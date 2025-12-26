/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import Header from "./Header/index.jsx";
import EditorSection from "./EditorSection";
import InputOutputSection from "./InputOutputSection";
import { useDispatch, useSelector } from "react-redux";
import {
	setEditorProperty,
	clearOutput,
	updateAllCode,
	resetToInitialState,
} from "@/redux/states/CodeEditorSlice.js";
import { useGetFileByIdQuery } from "@/redux/api/fileApiSlice.js";
import AuthForm from "@/components/shared/AuthForm";
import styles from "./index.module.css";
import PropTypes from "prop-types";
import { useExecutionWebSocket } from "@/hooks/useExecutionWebSocket.js";

export default function CodeEditor({ fileId }) {
	const { code, language, codeByLanguage } = useSelector(
		(state) => state.codeEditor
	);

	const { userInfo } = useSelector((state) => state.auth);

	const dispatch = useDispatch();

	const updateEditorProperty = (property, value) => {
		dispatch(setEditorProperty({ property, value }));
	};

	const {
		isConnected,
		isRunning,
		waitingForInput,
		executeCode: wsExecuteCode,
		sendInput,
	} = useExecutionWebSocket();

	const {
		data: file,
		error: fileFetchError,
		isLoading: loadingFile,
		refetch: refetchFile,
	} = useGetFileByIdQuery(fileId, {
		skip: !fileId,
	});

	useEffect(() => {
		if (fileId) refetchFile();
	}, [fileId]);

	useEffect(() => {
		if (!fileId) {
			dispatch(resetToInitialState());
		} else if (!file || fileFetchError) {
			console.log("File not fetched", fileFetchError);
			if (userInfo && fileFetchError?.data.message === "Not Authenticated") {
				console.log("refetching");
				refetchFile();
			}
		} else {
			console.log("successfully fetched file", file);
			dispatch(updateAllCode(file.code));
		}
	}, [file, fileId, userInfo]);

	useEffect(() => {
		dispatch(clearOutput());
	}, [language]);

	useEffect(() => {
		updateEditorProperty("isLoading", isRunning);
	}, [isRunning]);

	async function runCode() {
		if (!code) {
			updateEditorProperty("output", "\n[No code found...]\n");
			updateEditorProperty("error", true);
			return;
		}
		if (!isConnected) {
			alert("Not connected to execution server. Please wait...");
			return;
		}

		dispatch(clearOutput());
		updateEditorProperty("isError", null);
		wsExecuteCode(language, code);
	}

	if (loadingFile) return <div>Loading...</div>;

	if (fileFetchError && fileFetchError.data.message === "Not Authenticated") {
		console.log("Authform");
		return (
			<div className={styles.codeEditor__center}>
				<div className={styles.codeEditor__authContainer}>
					<AuthForm />
				</div>
			</div>
		);
	}
	if (fileFetchError && fileFetchError.data.message === "Not Authorized") {
		return (
			<div className={styles.codeEditor__center}>
				<h1 className={styles.codeEditor__errorTitle}>Not Authorized!</h1>
			</div>
		);
	}

	if (fileFetchError && fileFetchError.data.message === "File Not Found") {
		return (
			<div className={styles.codeEditor__center}>
				<h1 className={styles.codeEditor__errorTitle}>File Not Found!</h1>
			</div>
		);
	}

	if (fileFetchError && fileFetchError.data.message === "Error Occurred") {
		return (
			<div className={styles.codeEditor__center}>
				<h1 className={styles.codeEditor__errorTitle}>Error Occurred!</h1>
			</div>
		);
	}

	return (
		<>
			<div className={styles.codeEditor__container}>
				<Header
					file={file}
					fileId={fileId}
					codeByLanguage={codeByLanguage}
					runCode={runCode}
					userInfo={userInfo}
				/>
				<div className={styles.codeEditor__content}>
					<div className={styles.codeEditor__editor}>
						<EditorSection />
					</div>

					<div className={styles.codeEditor__inputOutputSection}>
						<InputOutputSection
							onSendInput={sendInput}
							isRunning={isRunning}
							waitingForInput={waitingForInput}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

CodeEditor.propTypes = {
	fileId: PropTypes.string,
};
