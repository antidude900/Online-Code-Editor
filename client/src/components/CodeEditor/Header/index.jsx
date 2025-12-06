import { useState } from "react";
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

export default function Header({
	file,
	fileId,
	codeByLanguage,
	isLoading,
	runCode,
	userInfo,
}) {
	const [open, setOpen] = useState(false);

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
						<Button disabled={isLoading} onClick={runCode}>
							Run
						</Button>
					</div>
				</div>
			</div>

			<div className={styles.header__rightSection}>
				{userInfo ? (
					<div className={styles.header__rightSectionButtons}>
						<Logout />
						<div className={styles.header__filesShowContainer}>
							<FilesShow />
						</div>
					</div>
				) : (
					<>
						<LogIn className="cursor-pointer" onClick={() => setOpen(true)} />

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
					</>
				)}
			</div>
		</div>
	);
}

Header.propTypes = {
	file: PropTypes.object,
	fileId: PropTypes.string,
	codeByLanguage: PropTypes.object,
	isLoading: PropTypes.bool,
	runCode: PropTypes.func.isRequired,
	userInfo: PropTypes.object,
};
