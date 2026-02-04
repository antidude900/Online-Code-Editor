import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import dockerExecutionService from "../services/dockerExecutionService.js";

export function startWebSocketServer(server) {
	const wss = new WebSocketServer({
		server,
		path: "/ws/execute",
	});

	wss.on("connection", (ws) => {
		const connectionId = uuidv4();
		console.log(`New WebSocket connection: ${connectionId}`);

		let containerStream = null;
		let currentExecutionId = null;
		let ignoreNextOutput = false;

		ws.on("message", async (message) => {
			try {
				const data = JSON.parse(message.toString());

				switch (data.type) {
					case "execute":
						await handleExecute(ws, data);
						break;

					case "input":
						await handleInput(data, containerStream);
						break;

					case "stop":
						await handleStop();
						ws.send(
							JSON.stringify({
								type: "stopped",
								message: "Execution stopped by user",
							}),
						);
						break;
					default:
						ws.send(
							JSON.stringify({
								type: "error",
								error: `Unknown message type: ${data.type}`,
							}),
						);
				}
			} catch (error) {
				console.error("WebSocket message error:", error);
				ws.send(
					JSON.stringify({
						type: "error",
						error: error.message,
					}),
				);
			}
		});

		ws.on("close", () => {
			console.log(`WebSocket closed: ${connectionId}`);
			if (currentExecutionId) {
				dockerExecutionService.stopExecution(currentExecutionId);
			}
		});

		ws.on("error", (error) => {
			console.error(`WebSocket error for ${connectionId}:`, error);
		});

		async function handleExecute(ws, data) {
			const { language, code, executionId: clientExecutionId } = data;

			if (!language || !code) {
				ws.send(
					JSON.stringify({
						type: "error",
						error: "Language and code are required",
					}),
				);
				return;
			}

			try {
				// Stop any previous execution
				if (currentExecutionId) {
					console.log(`Stopping previous execution ${currentExecutionId}`);
					await dockerExecutionService.stopExecution(currentExecutionId);
					containerStream = null;
					currentExecutionId = null;
				}

				// Use client execution ID or generate new one
				const executionId = clientExecutionId || uuidv4();
				currentExecutionId = executionId;

				console.log(`Executing ${language} code for execution ${executionId}`);

				ws.send(
					JSON.stringify({
						type: "status",
						status: "starting",
						message: "Starting execution...",
						executionId,
					}),
				);

				const { stream } = await dockerExecutionService.executeCode(
					executionId,
					language,
					code,
					// stdout handler
					{
						write: (chunk) => {
							// Only send if this is still the current execution
							if (currentExecutionId !== executionId) {
								console.log(
									`Skipping output from old execution ${executionId}`,
								);
								return;
							}
							const output = chunk.toString();
							console.log(`[${executionId}] stdout:`, output);
							ws.send(
								JSON.stringify({
									type: "output",
									data: output,
									executionId,
								}),
							);

							// Reset echo flag if this output is echoed input from the terminal.
							// We still send input_required below to avoid missing real prompts in rapid succession.
							if (ignoreNextOutput) {
								console.log(
									`[${executionId}] Ignoring output for input_required (echo)`,
								);
								ignoreNextOutput = false;
							}

							// Signal that program might be waiting for input after output
							ws.send(
								JSON.stringify({
									type: "input_required",
									message: "Program may be waiting for input",
									executionId,
								}),
							);
						},
					},
					// stderr handler
					{
						write: (chunk) => {
							// Only send if this is still the current execution
							if (currentExecutionId !== executionId) {
								console.log(`Skipping error from old execution ${executionId}`);
								return;
							}
							const error = chunk.toString();
							console.log(`[${executionId}] stderr:`, error);
							ws.send(
								JSON.stringify({
									type: "error",
									data: error,
									executionId,
								}),
							);
						},
					},
					// exit handler
					(error, exitCode) => {
						console.log(
							`[${executionId}] Process exited with code ${exitCode}, error:`,
							error,
						);
						// Only send exit if this is still the current execution
						if (currentExecutionId === executionId) {
							containerStream = null;
							currentExecutionId = null;
							if (error) {
								ws.send(
									JSON.stringify({
										type: "error",
										error: error.message,
										executionId,
									}),
								);
							}
							ws.send(
								JSON.stringify({
									type: "exit",
									exitCode: exitCode || 0,
									message: "Execution completed",
									executionId,
								}),
							);
						}
					},
				);

				containerStream = stream;

				console.log(`[${executionId}] Execution started successfully`);
				ws.send(
					JSON.stringify({
						type: "status",
						status: "running",
						message: "Execution started. You can send input now.",
						executionId,
					}),
				);

				// Notify client that program can accept input
				ws.send(
					JSON.stringify({
						type: "input_required",
						message: "Program is ready to accept input",
						executionId,
					}),
				);
			} catch (error) {
				console.error(`[${currentExecutionId}] Execution error:`, error);
				const executionId = currentExecutionId;
				containerStream = null;
				currentExecutionId = null;

				// Send error message
				ws.send(
					JSON.stringify({
						type: "error",
						error: error.message,
						executionId,
					}),
				);

				// Send exit message to stop running state
				ws.send(
					JSON.stringify({
						type: "exit",
						exitCode: 1,
						message: "Execution failed",
						executionId,
					}),
				);
			}
		}

		async function handleInput(data, stream) {
			const { input } = data;

			if (!stream) {
				ws.send(
					JSON.stringify({
						type: "error",
						error: "No active execution to send input to",
					}),
				);
				return;
			}

			try {
				console.log(`[${currentExecutionId}] Sending input:`, input);
				// Send input directly to the container's stdin with newline
				const success = stream.write(`${input}\n`);
				console.log(`[${currentExecutionId}] Input write success:`, success);

				// Ignore next output (likely echo)
				ignoreNextOutput = true;

				ws.send(
					JSON.stringify({
						type: "input-sent",
						message: "Input sent successfully",
					}),
				);
			} catch (error) {
				console.error(`[${currentExecutionId}] Error sending input:`, error);
				ws.send(
					JSON.stringify({
						type: "error",
						error: `Failed to send input: ${error.message}`,
					}),
				);
			}
		}

		async function handleStop() {
			try {
				if (currentExecutionId) {
					const executionId = currentExecutionId;
					console.log(`Stopping execution ${executionId}`);
					await dockerExecutionService.stopExecution(executionId);
					containerStream = null;
					currentExecutionId = null;
				}
			} catch (error) {
				console.error("Error stopping execution:", error);
			}
		}
	});

	console.log("WebSocket server setup complete");
	return wss;
}
