import Docker from "dockerode";
import { PassThrough } from "stream";

const docker = new Docker({
	host: "localhost",
	port: 2375,
});

// Language configurations with Docker images
const LANGUAGE_CONFIGS = {
	python: {
		image: "python:3.10-slim",
		command: ["python", "-u", "/code/main.py"],
		fileExtension: "py",
	},
	javascript: {
		image: "node:18-slim",
		command: ["node", "/code/main.js"],
		fileExtension: "js",
	},
	c: {
		image: "gcc:latest",
		command: ["/bin/sh", "-c", "gcc /code/main.c -o /code/main && /code/main"],
		fileExtension: "c",
	},
	cpp: {
		image: "gcc:latest",
		command: [
			"/bin/sh",
			"-c",
			"g++ /code/main.cpp -o /code/main && /code/main",
		],
		fileExtension: "cpp",
	},
};

class DockerExecutionService {
	constructor() {
		this.activeExecutions = new Map(); // stores the sessionId of each execution request and the info of the container its using
		this.languageContainers = new Map(); // stores the languages of existing containers and the info of the container
		this.initialized = false; // flag to know if the docker has already been initalized or not
	}

	// initializing the docker by enabling the containers of the required languages
	async initialize() {
		if (this.initialized) return;

		console.log("Discovering existing containers...");

		// List all containers (including stopped ones)
		const containers = await docker.listContainers({ all: true });

		for (const containerData of containers) {
			// Check if this is one of our language containers
			const image = containerData.Image;
			let language = null;

			for (const [lang, config] of Object.entries(LANGUAGE_CONFIGS)) {
				if (image.startsWith(config.image.split(":")[0])) {
					language = lang;
					break;
				}
			}

			if (language && !this.languageContainers.has(language)) {
				const container = docker.getContainer(containerData.Id);

				// Check if container is running, if not start it
				if (containerData.State !== "running") {
					try {
						console.log(
							`Starting existing ${language} container ${containerData.Id}...`,
						);
						await container.start();
					} catch (error) {
						console.log(
							`Could not start container ${containerData.Id}: ${error.message}`,
						);
						continue;
					}
				}

				const containerInfo = {
					id: containerData.Id,
					container: container,
					language: language,
				};

				// storing all those containers in the languageContainers which were successully started
				this.languageContainers.set(language, containerInfo);
				console.log(`Found existing ${language} container ${containerData.Id}`);
			}
		}

		console.log(
			`Containers initialized: ${Array.from(
				this.languageContainers.keys(),
			).join(", ")}`,
		);
		this.initialized = true;
	}

	// to pull the images of those containers which havent been created
	async pullImage(imageName) {
		try {
			await docker.getImage(imageName).inspect();
			console.log(`Image ${imageName} already exists`);
		} catch (error) {
			console.log(`Pulling image ${imageName}...`);
			return new Promise((resolve, reject) => {
				docker.pull(imageName, (err, stream) => {
					if (err) return reject(err);

					docker.modem.followProgress(
						stream,
						(err, output) => {
							if (err) return reject(err);
							console.log(`Successfully pulled ${imageName}`);
							resolve(output);
						},
						(event) => {
							if (event.status) {
								console.log(`${imageName}: ${event.status}`);
							}
						},
					);
				});
			});
		}
	}

	// to get the container of the specific language; if doesnt exists, then we create one
	async getOrCreateContainer(language) {
		// Ensure if docker is already initialized with the existing containers
		await this.initialize();

		const config = LANGUAGE_CONFIGS[language];
		if (!config) {
			throw new Error(`Unsupported language: ${language}`);
		}

		// If we already have a container for the specific language, we just return the container
		if (this.languageContainers.has(language)) {
			const containerInfo = this.languageContainers.get(language);

			// The specific container might stop or pause in between after initializtion
			// (initialization only happens again only if the server restarts after crashing or stopping)
			// So double checking to avioid such case
			try {
				const inspectData = await containerInfo.container.inspect();

				if (!inspectData.State.Running) {
					console.log(
						`Container ${containerInfo.id} is stopped, restarting...`,
					);
					await containerInfo.container.start();
				} else if (inspectData.State.Paused) {
					console.log(`Container ${containerInfo.id} is paused, unpausing...`);
					await containerInfo.container.unpause();
				}

				console.log(
					`Using existing container ${containerInfo.id} for ${language}`,
				);
				return containerInfo;
			} catch (error) {
				// Container no longer exists, remove it and create a new one
				console.log(
					`Container ${containerInfo.id} no longer exists, creating new one`,
				);
				this.languageContainers.delete(language);
			}
		}

		// If container for that language doesn't exist, we create one
		console.log(`Creating new container for ${language}`);

		// Pull image for the new container
		await this.pullImage(config.image);

		const container = await docker.createContainer({
			Image: config.image,
			Cmd: ["/bin/sh", "-c", "while true; do sleep 1; done"], // Keep container alive
			Tty: false,
			OpenStdin: true,
			AttachStdin: true,
			AttachStdout: true,
			AttachStderr: true,
			HostConfig: {
				AutoRemove: false,
				Memory: 512 * 1024 * 1024, // 512MB limit
				CpuQuota: 50000, // 50% CPU
				NetworkMode: "none", // No network access for security
			},
		});

		await container.start();

		const containerInfo = {
			id: container.id,
			container: container,
			language: language,
		};

		this.languageContainers.set(language, containerInfo);
		console.log(`Created container ${container.id} for ${language}`);

		return containerInfo;
	}

	// To put content directly in the file of docker, we need the content to be pushed in archived format
	async createTarStreamFromCode(language, code) {
		const config = LANGUAGE_CONFIGS[language];
		const filename = `main.${config.fileExtension}`;

		// Using streaming to make the HTTP Uploads our websocket server to the Docker server more efficient
		const tar = await import("tar-stream");
		const pack = tar.pack();

		// Add the code file to the tar stream
		pack.entry({ name: filename }, code, (err) => {
			if (err) throw err;
			pack.finalize();
		});

		return pack;
	}

	async executeCode(sessionId, language, code, sendOutput, sendError, onExit) {
		const config = LANGUAGE_CONFIGS[language];
		if (!config) {
			throw new Error(`Unsupported language: ${language}`);
		}

		try {
			// Get or create a container for this language
			const containerInfo = await this.getOrCreateContainer(language);
			const container = containerInfo.container;

			// Track this active execution and the container it's using
			this.activeExecutions.set(sessionId, containerInfo);

			console.log(
				`Executing code in container ${containerInfo.id} for session ${sessionId}`,
			);

			// When a source file is executed, it is loaded into the memory and acts as isloated process, and the write->execute happens very fast
			// So changes to the same source file by another user wont affect the process at all
			// But still if there are large no of users, the chance of multiple users doing write action to a file at the same time is possible
			// Hence we create a unique directory for each execution to avoid conflicts between concurrent executions
			const execPath = `/code/${sessionId}`;
			await container
				.exec({
					Cmd: ["mkdir", "-p", execPath],
					AttachStdout: false,
					AttachStderr: false,
				})
				.then((exec) => exec.start({ Detach: true }));

			// Copy code file into container's unique directory
			const tarStream = await this.createTarStreamFromCode(language, code);
			await container.putArchive(tarStream, { path: execPath });
			console.log(`Source Code in directory ${execPath}`);

			// Build command with the unique execution path
			const execCommand = config.command.map((arg) =>
				arg.replace("/code/", `${execPath}/`),
			);

			// Execute code in the container using exec
			const exec = await container.exec({
				Cmd: execCommand,
				AttachStdin: true,
				AttachStdout: true,
				AttachStderr: true,
				Tty: false,
			});

			// creating a bidirectional stream with the execution instance so that we can send input
			// stream.write() sends the data to the stdin
			const stream = await exec.start({
				hijack: true,
				stdin: true,
				Tty: false,
			});

			// Manuually separating stdout and stderr (required when not using Tty)
			const stdout = new PassThrough();
			const stderr = new PassThrough();

			docker.modem.demuxStream(stream, stdout, stderr);

			stdout.on("data", (chunk) => {
				console.log(`[${sessionId}] stdout:`, chunk.toString());
				sendOutput(chunk);
			});

			stderr.on("data", (chunk) => {
				console.log(`[${sessionId}] stderr:`, chunk.toString());
				sendError(chunk);
			});

			stream.on("end", async () => {
				console.log(`[${sessionId}] Exec stream ended`);

				// Get exit code
				try {
					const inspectData = await exec.inspect();
					const exitCode = inspectData.ExitCode || 0;

					// Clean up the execution directory
					try {
						await container
							.exec({
								Cmd: ["rm", "-rf", execPath],
								AttachStdout: false,
								AttachStderr: false,
							})
							.then((exec) => exec.start({ Detach: true }));
						console.log(`[${sessionId}] Cleaned up directory ${execPath}`);
					} catch (cleanupError) {
						console.error(
							`[${sessionId}] Failed to cleanup directory:`,
							cleanupError,
						);
					}

					onExit(exitCode);
				} catch (error) {
					console.error(
						`[${sessionId}] Error inspecting execution exitCode:`,
						error,
					);
					onExit(1);
				}
				this.activeExecutions.delete(sessionId);
			});

			return {
				container,
				stream,
				exec,
			};
		} catch (error) {
			this.cleanup(sessionId);
			throw error;
		}
	}

	async stopExecution(sessionId) {
		const containerInfo = this.activeExecutions.get(sessionId);
		if (containerInfo) {
			try {
				console.log(
					`Stopping execution ${sessionId} in container ${containerInfo.id}`,
				);
				// Just clean up the execution tracking
				this.activeExecutions.delete(sessionId);
			} catch (error) {
				console.error("Error stopping execution:", error);
			}
		}
	}

	cleanup(sessionId) {
		this.activeExecutions.delete(sessionId);
	}

	// Cleanup all containers on shutdown
	async shutdownAll() {
		console.log("Shutting down all language containers...");
		for (const [language, containerInfo] of this.languageContainers) {
			try {
				await containerInfo.container.stop({ t: 1 });
				await containerInfo.container.remove();
				console.log(`Removed container ${containerInfo.id} for ${language}`);
			} catch (error) {
				console.error(`Error removing container ${containerInfo.id}:`, error);
			}
		}
		this.languageContainers.clear();
		this.activeExecutions.clear();
	}
}

export default new DockerExecutionService();
