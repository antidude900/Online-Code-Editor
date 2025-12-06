import { ChevronDown } from "lucide-react";
import { LANGUAGES } from "../../../constants";
import { useDispatch, useSelector } from "react-redux";
import { switchLanguage } from "@/redux/states/CodeEditorSlice";
import Dropdown from "@/components/shared/Dropdown";
import styles from "./LanguageMenu.module.css";

export default function LanguageMenu() {
	const { language } = useSelector((state) => state.codeEditor);
	const dispatch = useDispatch();

	const languages = Object.entries(LANGUAGES);
	const handleClick = (lang, closeDropdown) => {
		if (lang !== language) dispatch(switchLanguage(lang));
		closeDropdown();
	};

	return (
		<Dropdown
			buttonText={
				<span className={styles.languageMenu__container}>
					<img
						src={`/assets/${language}.svg`}
						className={styles.languageMenu__icon}
					/>
					{language} <ChevronDown size={15} style={{ marginLeft: "0.25rem" }} />
				</span>
			}
		>
			{(closeDropdown) => (
				<ul className={styles.languageMenu__list}>
					{languages.map(([lang]) => (
						<li
							onClick={() => handleClick(lang, closeDropdown)}
							key={lang}
							className={styles.languageMenu__item}
						>
							<img
								src={`/assets/${lang}.svg`}
								className={styles.languageMenu__icon}
							/>
							<a
								className={
									lang === language ? styles.languageMenu__itemActive : ""
								}
							>
								{lang}
							</a>
						</li>
					))}
				</ul>
			)}
		</Dropdown>
	);
}
