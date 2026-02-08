import { useState, useEffect } from "react";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import LanguageMenu from "./LanguageMenu.jsx";
import SaveButton from "./SaveButton.jsx";
import SendEmail from "./SendEmail.jsx";
import Title from "./Title.jsx";
import FilesShow from "./FilesShow.jsx";
import Logout from "@/components/shared/Logout.jsx";
import Button from "@/components/shared/Button.jsx";
import AuthForm from "@/components/shared/AuthForm";
import styles from "./index.module.css";
import { useDispatch, useSelector } from "react-redux";
import { setEditorProperty } from "@/redux/states/CodeEditorSlice.js";

export default function Header({
	file,
	fileId,
	codeByLanguage,
	runCode,
	userInfo,
	isConnected,
	isRunning,
	stopExecution,
}) {
	const [open, setOpen] = useState(false);
	const { isInteractive } = useSelector((state) => state.codeEditor);
	const dispatch = useDispatch();

	useEffect(() => {
		if (userInfo) {
			setOpen(false);
		}
	}, [userInfo]);
	useEffect(() => {
		if (!isConnected) {
			dispatch(
				setEditorProperty({
					property: "error",
					value: true,
				}),
			);
			dispatch(
				setEditorProperty({
					property: "output",
					value: "\n[Server is not connected]\n",
				}),
			);
		}
	}, [isConnected]);

	return (
		<div className={styles.header__container}>
			<div className={styles.header__leftSection}>
				<div className={styles.header__label}>
					<Link to="/">
						<img src="/logo.png" className={styles.header__logo} />
					</Link>
				</div>
				{file && <Title file={file} />}

				<div className={styles.header__leftSectionButtons}>
					<LanguageMenu />
					<SaveButton fileId={fileId} codeByLanguage={codeByLanguage} />
					<SendEmail />

					<div>
						{isRunning ? (
							<Button
								className={styles.stopButton}
								onClick={() => stopExecution()}
							>
								Stop
							</Button>
						) : (
							<Button
								className={`btn ${
									!isConnected ? "cursor-not-allowed opacity-50" : ""
								}`}
								onClick={runCode}
								disabled={!isConnected}
								title={!isConnected ? "Connecting to server..." : "Run code"}
							>
								Run
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className={styles.header__rightSection}>
				<div className={styles.header__interactiveButtonContainer}>
					<span className={styles.header__interactiveButtonLabel}>
						Interactive
					</span>
					<button
						className={`${styles.header__interactiveButton} ${
							isInteractive && styles.header__interactiveButtonActive
						}`}
						onClick={() =>
							dispatch(
								setEditorProperty({
									property: "isInteractive",
									value: !isInteractive,
								}),
							)
						}
					></button>
				</div>
				{userInfo ? (
					<div className={styles.header__rightSectionButtons}>
						<Logout />
						<div className={styles.header__filesShowContainer}>
							<FilesShow />
						</div>
					</div>
				) : (
					<div className={styles.header__rightSectionButtons}>
						<LogIn
							className="cursor-pointer"
							onClick={() => {
								setOpen(true);
							}}
						/>

						{open && (
							<div className={styles.header__authModal}>
								<div className={styles.header__authModalContent}>
									<button
										onClick={() => setOpen(false)}
										className={styles.header__authModalCloseButton}
									>
										×
									</button>

									<AuthForm />
								</div>

								<div
									className={styles.header__authModalbackdrop}
									onClick={() => setOpen(false)}
								/>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

Header.propTypes = {
	file: PropTypes.object,
	fileId: PropTypes.string,
	codeByLanguage: PropTypes.object,
	runCode: PropTypes.func.isRequired,
	userInfo: PropTypes.object,
	isConnected: PropTypes.bool.isRequired,
	isRunning: PropTypes.bool.isRequired,
	stopExecution: PropTypes.func.isRequired,
};
