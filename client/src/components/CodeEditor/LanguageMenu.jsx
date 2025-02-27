import { ChevronDown } from "lucide-react";
import { LANGUAGES } from "../../constants";
import { useDispatch, useSelector } from "react-redux";
import { setCodeEditor } from "../../store/states/CodeEditor/CodeEditorSlice";

export default function LanguageMenu() {
	const { language } = useSelector((state) => state.codeEditor);
	const dispatch = useDispatch();

	const languages = Object.entries(LANGUAGES);
	const handleClick = (lang) => {
		const elem = document.activeElement;
		if (elem) {
			elem?.blur();
		}
		if (lang !== language) dispatch(setCodeEditor({ language: lang }));
	};
	return (
		<div className="dropdown">
			<div tabIndex="0" role="button" className="btn">
				<span className="flex justify-around items-center w-[120px]">
					<img src={`/assets/${language}.svg`} className="w-7 h-7 mr-2" />
					{language} <ChevronDown size={15} className="ml-1" />
				</span>
			</div>
			<ul
				tabIndex="0"
				className="dropdown-content bg-[#282A36] absolute rounded-xl z-[1] w-[200px] font-[500] text-[14px] divide-y divide-gray-700 overflow-hidden shadow-md shadow-gray-900"
			>
				{languages.map(([lang]) => (
					<li
						onClick={() => {
							handleClick(lang);
						}}
						key={lang}
						className="py-3 cursor-pointer flex items-center hover:bg-[#1D1F28] px-2"
					>
						<img src={`/assets/${lang}.svg`} className="w-7 h-7 mr-2" />
						<a className={lang === language ? "text-blue-500 font-black" : ""}>
							{lang}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
