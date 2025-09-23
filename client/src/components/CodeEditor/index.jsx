/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import LanguageMenu from "./LanguageMenu";
import EditorSection from "./EditorSection.jsx";
import InputOutputSection from "./InputOutputSection.jsx";
import SendEmail from "./SendEmail.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
	setEditorProperty,
	clearOutput,
} from "../../redux/states/CodeEditorSlice.js";
import { useExecuteCodeMutation } from "../../redux/api/pistonApiSlice.js";
import { Folder, LogIn } from "lucide-react";
import Logout from "../HomeSections/Logout.jsx";
import { Link } from "react-router-dom";

export default function CodeEditor() {
	const { code, language, input, isLoading } = useSelector(
		(state) => state.codeEditor
	);

	const { userInfo } = useSelector((state) => state.auth);

	const dispatch = useDispatch();

	const updateEditorProperty = (property, value) => {
		dispatch(setEditorProperty({ property, value }));
	};

	const [executeCode] = useExecuteCodeMutation();

	useEffect(() => {
		dispatch(clearOutput());
	}, [language, dispatch]);

	useEffect(() => {
		updateEditorProperty("isError", null);
	}, [code]);

	async function runCode() {
		if (!code) return;
		try {
			updateEditorProperty("isLoading", true);
			console.log("code", code);
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
						<div className="label-buttons flex justify-between grow mr-3">
							<LanguageMenu />

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
							<Folder className="cursor-pointer" />
						</div>
					) : (
						<Link to="/" className="cursor-pointer">
							<LogIn />
						</Link>
					)}
				</div>

				<InputOutputSection />
			</div>
		</>
	);
}
// code={code} input={input} output={output.join("\n")}
