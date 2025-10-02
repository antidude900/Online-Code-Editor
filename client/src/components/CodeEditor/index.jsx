/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import LanguageMenu from "./LanguageMenu";
import EditorSection from "./EditorSection.jsx";
import InputOutputSection from "./InputOutputSection.jsx";
import SendEmail from "./SendEmail.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
	setEditorProperty,
	clearOutput,
	updateAllCode,
	resetToInitialState,
} from "../../redux/states/CodeEditorSlice.js";
import { useExecuteCodeMutation } from "../../redux/api/pistonApiSlice.js";
import { LogIn } from "lucide-react";
import Logout from "../HomeSections/Logout.jsx";

import { Link, useParams } from "react-router-dom";
import { useGetFileByIdQuery } from "../../redux/api/fileApiSlice.js";
import SaveButton from "./SaveButton.jsx";
import AuthForm from "../HomeSections/AuthForm.jsx";
import Title from "./Title.jsx";
import FilesShow from "./FilesShow.jsx";

export default function CodeEditor() {
	const { code, language, input, isLoading, codeByLanguage } = useSelector(
		(state) => state.codeEditor
	);

	const { userInfo } = useSelector((state) => state.auth);

	const dispatch = useDispatch();

	const updateEditorProperty = (property, value) => {
		dispatch(setEditorProperty({ property, value }));
	};

	const [executeCode] = useExecuteCodeMutation();
	const { fileId } = useParams();

	const {
		data: file,
		error: fileFetchError,
		isLoading: loadingFile,
		refetch: refetchFile,
	} = useGetFileByIdQuery(fileId, {
		skip: !fileId,
	});
	const [open, setOpen] = useState(false);

	useEffect(() => {
		setOpen(false);
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
		return (
			<div className="flex items-center justify-center h-full">
				<div className="bg-[#282A36] p-8 rounded-2xl shadow-xl shadow-gray-900 w-full max-w-sm">
					<AuthForm />
				</div>
			</div>
		);
	}
	if (fileFetchError && fileFetchError.data.message === "Not Authorized") {
		return (
			<div className="flex items-center justify-center h-full">
				<h1 className="text-4xl font-bold text-red-500">Not Authorized!</h1>
			</div>
		);
	}

	if (fileFetchError && fileFetchError.data.message === "File Not Found") {
		return (
			<div className="flex items-center justify-center h-full">
				<h1 className="text-4xl font-bold text-red-500">File Not Found!</h1>
			</div>
		);
	}

	if (fileFetchError && fileFetchError.data.message === "Error Occurred") {
		return (
			<div className="flex items-center justify-center h-full">
				<h1 className="text-4xl font-bold text-red-500">Error Occurred!</h1>
			</div>
		);
	}

	return (
		<>
			<div className="whole-editor flex">
				<div className="editor w-[60vw]">
					<div className="labels flex items-center mb-5 h-[50px]">
						<div className="label w-[100px] font-bold ml-3">
							<Link to="/">
								<img src="/logo.png" width={70} height={10} />
							</Link>
						</div>
						{file && <Title file={file} />}

						<div className="label-buttons flex justify-between grow mr-3">
							<LanguageMenu />

							<SaveButton fileId={fileId} codeByLanguage={codeByLanguage} />

							<SendEmail />
							<button
								className={`${
									isLoading ? "cursor-not-allowed opacity-50" : ""
								} btn`}
								onClick={runCode}
							>
								Run
							</button>
						</div>
					</div>
					<EditorSection />
				</div>

				<div className="absolute top-10 right-[50px] min-h-[48px] flex items-center">
					{userInfo ? (
						<div className="flex gap-4">
							<Logout />
							<FilesShow />
						</div>
					) : (
						<>
							<LogIn className="cursor-pointer" onClick={() => setOpen(true)} />

							{open && (
								<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
									<div className="bg-[#282A36] p-8 rounded-2xl shadow-xl shadow-gray-900 w-full max-w-sm relative">
										<button
											onClick={() => setOpen(false)}
											className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
										>
											×
										</button>

										<AuthForm />
									</div>

									<div
										className="absolute inset-0 -z-10"
										onClick={() => setOpen(false)}
									/>
								</div>
							)}
						</>
					)}
				</div>

				<InputOutputSection />
			</div>
		</>
	);
}
