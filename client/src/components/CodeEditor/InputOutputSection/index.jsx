/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { PLACEHOLDER } from "../../../constants";
import { useDispatch, useSelector } from "react-redux";
import { setEditorProperty } from "../../../redux/states/CodeEditorSlice";
import styles from "./index.module.css";

export default function InputOutputSection() {
	const { output, isError, input } = useSelector((state) => state.codeEditor);
	const dispatch = useDispatch();

	const [isScrollableDown, setIsScrollableDown] = useState(false);
	const [isScrollableUp, setIsScrollableUp] = useState(false);
	const textareaRef = useRef(null);

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

	const scrollToBottom = () => {
		if (textareaRef.current)
			textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
	};

	const scrollToTop = () => {
		if (textareaRef.current) textareaRef.current.scrollTop = 0;
	};

	const handleInputChange = (e) => {
		dispatch(setEditorProperty({ property: "input", value: e.target.value }));
		checkIfScrollable();
	};

	return (
		<div className={styles.inputOutput}>
			<div className={styles.inputOutput__inputBox}>
				<div className={styles.inputOutput__label}>Input</div>

				<div
					className={`${styles.inputOutput__border} ${
						styles.inputOutput__borderInput
					} ${
						isError !== null
							? isError
								? styles.inputOutput__borderError
								: styles.inputOutput__borderSuccess
							: ""
					}`}
				>
					<textarea
						ref={textareaRef}
						className={`${styles.inputOutput__inputBoxTextarea} ${
							input === "" ? styles.inputOutput__inputBoxTextareaEmpty : ""
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

			<div className={styles.inputOutput__outputBox}>
				<div className={styles.inputOutput__labelOutput}>Output</div>
				<div
					className={`${styles.inputOutput__border}  ${
						styles.inputOutput__borderOutput
					} ${
						isError !== null
							? isError
								? styles.inputOutput__borderError
								: styles.inputOutput__borderSuccess
							: ""
					}`}
				>
					<div className={styles.inputOutput__output}>
						{output ? (
							<pre className={styles.inputOutput__outputPre}>{output}</pre>
						) : (
							"Run Code to See Output"
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
