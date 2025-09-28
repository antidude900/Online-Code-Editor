/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { PLACEHOLDER } from "../../constants";
import { useDispatch, useSelector } from "react-redux";
import { setEditorProperty } from "../../redux/states/CodeEditorSlice";

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
		<div className="input-output w-[40vw] ml-10 h-[80vh] flex flex-col mt-[65px]">
			<div className="input-box h-[30%] mb-[20px] flex flex-col">
				<div className="text-[#A6ADBB] w-[100px] text-[20px] font-bold h-[20%]">
					Input
				</div>

				<div
					className={`relative input-border border-4 h-[80%] ${
						isError !== null
							? isError
								? "border-red-700"
								: "border-green-700"
							: "border-gray-700"
					} p-2 rounded-[10px]`}
				>
					<textarea
						ref={textareaRef}
						className={`w-full h-full bg-inherit outline-none resize-none ${
							input === "" && "text-[10px]"
						}`}
						placeholder={PLACEHOLDER}
						onChange={handleInputChange}
					/>
					{isScrollableUp && (
						<div className="absolute top-[-23px] right-[50%] text-white opacity-50 font-bold">
							<span
								className="text-xl border-4 border-gray-500 rounded-full cursor-pointer p-[1px] leading-none inline-block "
								onClick={scrollToTop}
							>
								↑
							</span>
						</div>
					)}
					{isScrollableDown && (
						<div className="absolute top-[110px] right-[50%] text-white opacity-50 font-bold">
							<span
								className="text-xl border-4 border-gray-500 rounded-full cursor-pointer p-[1px] leading-none inline-block"
								onClick={scrollToBottom}
							>
								↓
							</span>
						</div>
					)}
				</div>
			</div>

			<div className="output-box h-[70%] flex flex-col">
				<div className="text-[#A6ADBB] w-[100px] text-[20px] font-bold h-[8.62%]">
					Output
				</div>
				<div
					className={`output-border border-4 h-[91.38%] ${
						isError !== null
							? isError
								? "border-red-700"
								: "border-green-700"
							: "border-gray-700"
					} p-2 rounded-[10px]`}
				>
					<div className="overflow-auto w-full h-[98%] p-1">
						{output ? (
							<pre className="whitespace-pre-wrap break-words">{output}</pre>
						) : (
							"Run Code to See Output"
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
