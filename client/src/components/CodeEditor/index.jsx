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
import { useExecuteCodeMutation } from "@/redux/api/pistonApiSlice.js";
import { useGetFileByIdQuery } from "@/redux/api/fileApiSlice.js";
import AuthForm from "@/components/shared/AuthForm";
import styles from "./index.module.css";
import PropTypes from "prop-types";

export default function CodeEditor({ fileId }) {
	const { code, language, input, isLoading, codeByLanguage } = useSelector(
		(state) => state.codeEditor
	);

	const { userInfo } = useSelector((state) => state.auth);

	const dispatch = useDispatch();

	const updateEditorProperty = (property, value) => {
		dispatch(setEditorProperty({ property, value }));
	};

	const [executeCode] = useExecuteCodeMutation();

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
			console.log("Should come here");
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
		updateEditorProperty("isError", null);
	}, [code]);

	async function runCode() {
		if (!code) return;
		try {
			updateEditorProperty("isLoading", true);
			const { run: result } = await executeCode({
				language,
				code,
				input,
			}).unwrap();

			console.log("message", result.message);
			const formattedOutput = result.output.replace(/\t/g, "    ");

			updateEditorProperty("output", formattedOutput);
			updateEditorProperty("isError", result.stderr ? true : false);
		} catch (error) {
			console.log(error);
		} finally {
			updateEditorProperty("isLoading", false);
		}
	}

	if (loadingFile) return <div>Loading...</div>;

	if (fileFetchError && fileFetchError.data.message === "Not Authenticated") {
		console.log("Authform")
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
					isLoading={isLoading}
					runCode={runCode}
					userInfo={userInfo}
				/>
				<div className={styles.codeEditor__content}>
					<div className={styles.codeEditor__editor}>
						<EditorSection />
					</div>

					<div className={styles.codeEditor__inputOutputSection}>
						<InputOutputSection />
					</div>
				</div>
			</div>
		</>
	);
}

CodeEditor.propTypes = {
	fileId: PropTypes.string,
};
