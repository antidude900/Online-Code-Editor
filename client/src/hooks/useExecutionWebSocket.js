import { useEffect, useRef, useState, useCallback } from "react";
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

	const connect = useCallback(() => {
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
	}, []);

	const handleMessage = (message) => {
		// Ignore messages from old executions
		if (
			message.executionId &&
			message.executionId !== currentExecutionIdRef.current
		) {
			console.log(`Ignoring message from old execution ${message.executionId}`);
			return;
		}

		switch (message.type) {
			case "output":
				dispatch(appendOutput(message.data));
				break;

			case "error":
				if (message.data) {
					dispatch(appendOutput(message.data));
				}
				updateEditorProperty("error", true);
				break;

			case "status":
				console.log("Status:", message.message);
				if (message.status === "running") {
					setIsRunning(true);
				}
				break;

			case "exit":
				console.log("Execution completed with exit code:", message.exitCode);
				setIsRunning(false);
				setWaitingForInput(false);
				currentExecutionIdRef.current = null;
				if (message.exitCode === 0) {
					dispatch(appendOutput("\n[Execution Completed]\n"));
					updateEditorProperty("error", false);
				} else {
					dispatch(appendOutput("\n[Execution Failed! (Server Issue)]\n"));
					updateEditorProperty("error", true);
				}
				break;

			case "stopped":
				console.log("Execution stopped");
				setIsRunning(false);
				setWaitingForInput(false);
				currentExecutionIdRef.current = null;
				break;

			case "input_required":
				console.log("Program waiting for input");
				setWaitingForInput(true);
				break;

			case "input-sent":
				console.log("Input sent successfully");
				setWaitingForInput(false);
				break;

			default:
				console.log("Unknown message type:", message.type);
		}
	};

	const executeCode = useCallback((language, code) => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			return;
		}

		// Generate new execution ID
		const executionId = Date.now().toString();
		currentExecutionIdRef.current = executionId;

		// Immediately clear output and reset state
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
			})
		);
	}, []);

	const sendInput = useCallback((input) => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			return;
		}

		wsRef.current.send(
			JSON.stringify({
				type: "input",
				input,
			})
		);
	}, []);

	const stopExecution = useCallback(() => {
		// Immediately update UI state and clear execution ID
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
			})
		);
	}, [dispatch]);

	useEffect(() => {
		connect();

		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
			if (wsRef.current) {
				wsRef.current.close();
			}
		};
	}, [connect]);

	return {
		isConnected,
		isRunning,
		waitingForInput,
		executeCode,
		sendInput,
		stopExecution,
	};
}
