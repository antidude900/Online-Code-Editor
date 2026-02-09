import { useEffect, useRef, useState } from "react";
import {
	setEditorProperty,
	appendOutput,
} from "../redux/states/CodeEditorSlice";
import { useDispatch } from "react-redux";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000/ws/execute";

export function useExecutionWebSocket() {
	const [isConnected, setIsConnected] = useState(false);
	const [isRunning, setIsRunning] = useState(false);
	const [waitingForInput, setWaitingForInput] = useState(false);
	const wsRef = useRef(null);
	const reconnectTimeoutRef = useRef(null);
	const currentExecutionIdRef = useRef(null);
	const dispatch = useDispatch();

	const updateEditorProperty = (property, value) => {
		dispatch(setEditorProperty({ property, value }));
	};

	// Setup WebSocket connection with the server
	const connect = () => {
		// if already connected, abort the connection process
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			return;
		}

		try {
			const ws = new WebSocket(WS_URL);

			ws.onopen = () => {
				console.log("WebSocket connected");
				setIsConnected(true);
				updateEditorProperty("error", null);
			};

			// capture the message sent by the server through websocket and handle it
			ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);
					handleMessage(message);
				} catch (err) {
					console.error("Failed to parse WebSocket message:", err);
				}
			};

			ws.onerror = (error) => {
				console.error("WebSocket error:", error);
			};

			// if the websocket connection closed, try reconnecting
			ws.onclose = () => {
				console.log("WebSocket disconnected");
				setIsConnected(false);
				setIsRunning(false);

				// Attempt to reconnect after 3 seconds
				reconnectTimeoutRef.current = setTimeout(() => {
					console.log("Attempting to reconnect...");
					connect();
				}, 3000);
			};

			wsRef.current = ws;
		} catch (err) {
			console.error("Failed to create WebSocket connection:", err);
		}
	};

	// handling Messages from the server
	const handleMessage = (message) => {
		// If the output from the previous execution just came when running a new execution, ignore it
		if (
			message.executionId &&
			message.executionId !== currentExecutionIdRef.current
		) {
			console.log(`Ignoring message from old execution ${message.executionId}`);
			return;
		}

		switch (message.type) {
			// If message type is output, update our output of the code editor with the new one
			case "output":
				dispatch(appendOutput(message.data));
				break;

			// If its an error, we still have to show the error of the execution of the code in the output as well
			case "error":
				if (message.data) {
					dispatch(appendOutput(message.data));
				}
				updateEditorProperty("error", true);
				break;

			// Acknowleding the code recieved and alerting that the code is in executiion
			case "status":
				console.log("Status:", message.message);
				if (message.status === "running") {
					setIsRunning(true);
				}
				break;

			// Alerting the completetion of code exectution
			case "exit":
				console.log("Execution completed");
				setIsRunning(false);
				setWaitingForInput(false);
				currentExecutionIdRef.current = null;
				dispatch(appendOutput("\n[Execution Completed]\n"));
				updateEditorProperty("error", false);
				break;

			// Asking for input from client
			case "input_required":
				console.log("Program waiting for input");
				setWaitingForInput(true);
				break;

			default:
				console.log("Unknown message type:", message.type);
		}
	};

	const executeCode = (language, code) => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			return;
		}

		// Generate new execution ID
		const executionId = Date.now().toString();
		currentExecutionIdRef.current = executionId;

		// Clear Previous output and states related to the output
		updateEditorProperty("output", "");
		updateEditorProperty("error", null);
		setIsRunning(true);
		setWaitingForInput(false);

		wsRef.current.send(
			JSON.stringify({
				type: "execute",
				language,
				code,
				executionId,
			}),
		);
	};

	const sendInput = (input) => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			return;
		}

		setWaitingForInput(false);
		wsRef.current.send(
			JSON.stringify({
				type: "input",
				input,
			}),
		);
	};

	const stopExecution = () => {
		// Reset output UI state and clear execution ID
		const stoppedExecutionId = currentExecutionIdRef.current;
		currentExecutionIdRef.current = null;
		setIsRunning(false);
		setWaitingForInput(false);
		dispatch(appendOutput("\n[Execution Stopped]\n"));

		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			return;
		}

		// Send stop message to server with the execution ID
		wsRef.current.send(
			JSON.stringify({
				type: "stop",
				executionId: stoppedExecutionId,
			}),
		);
	};

	useEffect(() => {
		connect();

		// After the component using the hook unmounts, we clear the timer for reconnect(if exists) and also close the websocket connection
		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
			if (wsRef.current) {
				wsRef.current.close();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		isConnected,
		isRunning,
		waitingForInput,
		executeCode,
		sendInput,
		stopExecution,
	};
}
