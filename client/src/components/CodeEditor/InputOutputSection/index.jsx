/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { PLACEHOLDER } from "../../../constants";
import { useSelector } from "react-redux";
import styles from "./index.module.css";

export default function InputOutputSection({
	onSendInput,
	isRunning,
	waitingForInput,
}) {
	const { output, error, isInteractive } = useSelector(
		(state) => state.codeEditor,
	);
	const [interactiveInput, setInteractiveInput] = useState("");
	const [isScrollableDown, setIsScrollableDown] = useState(false);
	const [isScrollableUp, setIsScrollableUp] = useState(false);
	const [batchInput, setBatchInput] = useState("");
	const textareaRef = useRef(null);
	const outputRef = useRef(null);
	const inputRef = useRef(null);
	const currentInputIndexRef = useRef(0);
	const inputListRef = useRef([]);

	const checkIfScrollable = () => {
		if (textareaRef.current) {
			const isScrollable =
				textareaRef.current.scrollHeight > textareaRef.current.clientHeight;
			const isAtBottom =
				textareaRef.current.scrollHeight - textareaRef.current.scrollTop ===
				textareaRef.current.clientHeight;
			const isAtTop = textareaRef.current.scrollTop === 0;

			setIsScrollableDown(isScrollable && !isAtBottom);
			setIsScrollableUp(isScrollable && !isAtTop);
		}
	};

	const scrollToBottom = () => {
		if (textareaRef.current)
			textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
	};

	const scrollToTop = () => {
		if (textareaRef.current) textareaRef.current.scrollTop = 0;
	};

	const handleInputChange = (e) => {
		setBatchInput(e.target.value);
		checkIfScrollable();
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && waitingForInput) {
			e.preventDefault();
			sendInput();
		}
	};

	const sendInput = () => {
		if (interactiveInput.trim() && waitingForInput && onSendInput) {
			onSendInput(interactiveInput);
			setInteractiveInput("");
		}
	};

	useEffect(() => {
		checkIfScrollable();

		if (textareaRef.current) {
			textareaRef.current.addEventListener("scroll", checkIfScrollable);
		}

		window.addEventListener("resize", checkIfScrollable);

		return () => {
			if (textareaRef.current) {
				textareaRef.current.removeEventListener("scroll", checkIfScrollable);
			}
			window.removeEventListener("resize", checkIfScrollable);
		};
	}, []);

	useEffect(() => {
		// Auto-scroll to bottom when output changes
		if (outputRef.current) {
			outputRef.current.scrollTop = outputRef.current.scrollHeight;
		}
	}, [output]);

	// Update input list when input textarea changes
	useEffect(() => {
		if (!isInteractive && batchInput) {
			// Split input by newlines and filter out empty lines
			inputListRef.current = batchInput
				.split("\n")
				.filter((line) => line.trim() !== "");
		} else {
			inputListRef.current = [];
		}
	}, [batchInput, isInteractive]);

	// Reset input index when execution starts
	useEffect(() => {
		if (isRunning) {
			currentInputIndexRef.current = 0;
		}
	}, [isRunning]);

	useEffect(() => {
		// (for non-interactive mode)
		if (waitingForInput && !isInteractive) {
			// Get the input value or empty string if index exceeds length
			const inputValue =
				currentInputIndexRef.current < inputListRef.current.length
					? inputListRef.current[currentInputIndexRef.current]
					: "";

			currentInputIndexRef.current++;

			// Send the input automatically
			onSendInput(inputValue);
		}
		// (for interactive mode)
		if (waitingForInput && inputRef.current && isInteractive) {
			inputRef.current.focus();
		}
	}, [waitingForInput, isInteractive, onSendInput]);

	return (
		<div className={styles.inputOutput}>
			{!isInteractive && (
				<div className={styles.inputOutput__inputBox}>
					<div className={styles.inputOutput__label}>
						<span>Input</span>
					</div>

					<div
						className={`${styles.inputOutput__border} ${
							styles.inputOutput__inputBorder
						}   ${
							isRunning
								? styles.borderGreen
								: !output
									? styles.borderGray
									: !error
										? styles.borderGreenDark
										: styles.borderRed
						}`}
					>
						<textarea
							ref={textareaRef}
							className={`${styles.inputOutput__inputBoxTextarea} ${
								batchInput === ""
									? styles.inputOutput__inputBoxTextareaEmpty
									: ""
							}`}
							placeholder={PLACEHOLDER}
							onChange={handleInputChange}
						/>
						{isScrollableUp && (
							<div
								className={`${styles.inputOutput__inputBoxScrollButton} ${styles.inputOutput__inputBoxScrollButtonTop}`}
							>
								<span
									className={styles.inputOutput__inputBoxScrollIcon}
									onClick={scrollToTop}
								>
									↑
								</span>
							</div>
						)}
						{isScrollableDown && (
							<div
								className={`${styles.inputOutput__inputBoxScrollButton} ${styles.inputOutput__inputBoxScrollButtonBottom}`}
							>
								<span
									className={styles.inputOutput__inputBoxScrollIcon}
									onClick={scrollToBottom}
								>
									↓
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			<div className={styles.inputOutput__outputBox}>
				<div className={styles.inputOutput__label}>
					<span>Output</span>

					<div className={styles.runningStatus}>
						{isRunning ? "● Program Running" : ""}
					</div>
				</div>
				<div
					className={`${styles.inputOutput__border} ${
						styles.inputOutput__outputBorder
					}  ${
						isRunning
							? styles.borderGreen
							: !output
								? styles.borderGray
								: !error
									? styles.borderGreenDark
									: styles.borderRed
					}`}
				>
					<div className={styles.inputOutput__output} ref={outputRef}>
						{output ? (
							<pre className={styles.inputOutput__outputPre}>{output}</pre>
						) : (
							"Run Code to See Output"
						)}
					</div>

					{isRunning && isInteractive && (
						<div className={styles.interactiveInputContainer}>
							<span
								className={
									waitingForInput
										? styles.interactivePromptActive
										: styles.interactivePrompt
								}
							>
								{">"}
							</span>
							<input
								ref={inputRef}
								type="text"
								className={`${styles.interactiveInput} ${
									!waitingForInput ? styles.interactiveInputDisabled : ""
								}`}
								placeholder={
									waitingForInput
										? "Type input (if any) and press Enter..."
										: "Waiting for program..."
								}
								value={interactiveInput}
								onChange={(e) => setInteractiveInput(e.target.value)}
								onKeyDown={handleKeyPress}
								disabled={!waitingForInput}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
