import Docker from "dockerode";

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
		this.activeExecutions = new Map(); // sessionId -> container
		this.languageContainers = new Map(); // language -> containerInfo
		this.initialized = false;
	}

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
							`Starting existing ${language} container ${containerData.Id.substring(
								0,
								12
							)}...`
						);
						await container.start();
					} catch (error) {
						console.log(
							`Could not start container ${containerData.Id.substring(
								0,
								12
							)}: ${error.message}`
						);
						continue;
					}
				}

				const containerInfo = {
					id: containerData.Id,
					container: container,
					language: language,
				};

				this.languageContainers.set(language, containerInfo);
				console.log(
					`Found existing ${language} container ${containerData.Id.substring(
						0,
						12
					)}`
				);
			}
		}

		console.log(
			`Containers initialized: ${Array.from(
				this.languageContainers.keys()
			).join(", ")}`
		);
		this.initialized = true;
	}

	async pullImageIfNeeded(imageName) {
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
						}
					);
				});
			});
		}
	}

	async getOrCreateContainer(language) {
		// Ensure initialized
		await this.initialize();

		const config = LANGUAGE_CONFIGS[language];
		if (!config) {
			throw new Error(`Unsupported language: ${language}`);
		}

		// Check if we already have a container for this language
		if (this.languageContainers.has(language)) {
			const containerInfo = this.languageContainers.get(language);

			// Verify the container still exists and is running
			try {
				const inspectData = await containerInfo.container.inspect();

				// Check if container is stopped or paused and restart/unpause
				if (!inspectData.State.Running) {
					console.log(
						`Container ${containerInfo.id.substring(
							0,
							12
						)} is stopped, restarting...`
					);
					await containerInfo.container.start();
				} else if (inspectData.State.Paused) {
					console.log(
						`Container ${containerInfo.id.substring(
							0,
							12
						)} is paused, unpausing...`
					);
					await containerInfo.container.unpause();
				}

				console.log(
					`Using existing container ${containerInfo.id.substring(
						0,
						12
					)} for ${language}`
				);
				return containerInfo;
			} catch (error) {
				// Container no longer exists, remove it and create a new one
				console.log(
					`Container ${containerInfo.id.substring(
						0,
						12
					)} no longer exists, creating new one`
				);
				this.languageContainers.delete(language);
			}
		}

		// Create a new container for this language
		console.log(`Creating new container for ${language}`);

		// Pull image if needed
		await this.pullImageIfNeeded(config.image);

		// Create a persistent container
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
		console.log(
			`Created container ${container.id.substring(0, 12)} for ${language}`
		);

		return containerInfo;
	}

	async createTarStreamFromCode(language, code) {
		const config = LANGUAGE_CONFIGS[language];
		const filename = `main.${config.fileExtension}`;
		const tar = await import("tar-stream");
		const pack = tar.pack();

		// Add the code file to the tar stream
		pack.entry({ name: filename }, code, (err) => {
			if (err) throw err;
			pack.finalize();
		});

		return pack;
	}

	async executeCode(sessionId, language, code, onOutput, onError, onExit) {
		const config = LANGUAGE_CONFIGS[language];
		if (!config) {
			throw new Error(`Unsupported language: ${language}`);
		}

		try {
			// Get or create a container for this language
			const containerInfo = await this.getOrCreateContainer(language);
			const container = containerInfo.container;

			// Track this execution
			this.activeExecutions.set(sessionId, containerInfo);

			console.log(
				`Executing code in container ${containerInfo.id.substring(
					0,
					12
				)} for session ${sessionId}`
			);

			// Create /code directory in container
			await container
				.exec({
					Cmd: ["mkdir", "-p", "/code"],
					AttachStdout: false,
					AttachStderr: false,
				})
				.then((exec) => exec.start({ Detach: true }));

			// Copy code file into container directly from memory
			const tarStream = await this.createTarStreamFromCode(language, code);
			await container.putArchive(tarStream, { path: "/code" });

			// Execute code in the container using exec
			const exec = await container.exec({
				Cmd: config.command,
				AttachStdin: true,
				AttachStdout: true,
				AttachStderr: true,
				Tty: true,
			});

			const stream = await exec.start({
				hijack: true,
				stdin: true,
				Tty: true,
			});

			stream.setEncoding("utf8");

			// Handle output
			stream.on("data", (chunk) => {
				let output = chunk.toString("utf8");
				output = output.replace(
					/\{"stream":true,"stdin":true,"stdout":true,"stderr":true,"hijack":true\}/g,
					""
				);

				if (output.length > 0) {
					console.log(`[${sessionId}] Output:`, output);
					onOutput.write(Buffer.from(output));
				}
			});

			stream.on("end", async () => {
				console.log(`[${sessionId}] Exec stream ended`);

				// Get exit code
				try {
					const inspectData = await exec.inspect();
					const exitCode = inspectData.ExitCode || 0;

					// Clean up this execution
					this.activeExecutions.delete(sessionId);

					onExit(null, exitCode);
				} catch (error) {
					console.error(`[${sessionId}] Error inspecting exec:`, error);
					this.activeExecutions.delete(sessionId);
					onExit(null, 0);
				}
			});

			stream.on("error", (err) => {
				console.error(`[${sessionId}] Stream error:`, err);
				onError.write(Buffer.from(err.message));

				// Clean up this execution
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
					`Stopping execution ${sessionId} in container ${containerInfo.id.substring(
						0,
						12
					)}`
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
				console.log(
					`Removed container ${containerInfo.id.substring(
						0,
						12
					)} for ${language}`
				);
			} catch (error) {
				console.error(
					`Error removing container ${containerInfo.id.substring(0, 12)}:`,
					error
				);
			}
		}
		this.languageContainers.clear();
		this.activeExecutions.clear();
	}
}

export default new DockerExecutionService();
