import { EditorState } from "@codemirror/state";
import { highlightSelectionMatches } from "@codemirror/search";
import {
	indentWithTab,
	history,
	defaultKeymap,
	historyKeymap,
} from "@codemirror/commands";
import {
	foldGutter,
	indentOnInput,
	indentUnit,
	bracketMatching,
	foldKeymap,
	syntaxHighlighting,
	defaultHighlightStyle,
} from "@codemirror/language";
import {
	closeBrackets,
	autocompletion,
	closeBracketsKeymap,
	completionKeymap,
} from "@codemirror/autocomplete";
import {
	lineNumbers,
	highlightActiveLineGutter,
	highlightSpecialChars,
	drawSelection,
	// dropCursor,
	rectangularSelection,
	crosshairCursor,
	// highlightActiveLine,
	keymap,
	EditorView,
} from "@codemirror/view";

// Theme
import { dracula } from "thememirror";

// Language
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { updateCode } from "@/redux/states/CodeEditorSlice";
import styles from "./index.module.css";

export default function EditorSection({ codeByLanguage, language }) {
	const { isLoading } = useSelector((state) => state.codeEditor);

	const dispatch = useDispatch();
	const editor = useRef();
	const view = useRef();

	//theme of the code editor
	const customTheme = EditorView.theme({
		".cm-selectionBackground": {
			backgroundColor: "#4A90E2 !important",
			opacity: "0.4",
		},
		".cm-selectionMatch": {
			backgroundColor: "#4A90E2",
			opacity: "0.2",
		},
		"*": {
			fontFamily: "monospace,'Consolas'",
		},
	});

	//for the changes in the code editor, we also make change in the code of the codeByLanguage dictionary
	const onUpdate = EditorView.updateListener.of((v) => {
		dispatch(updateCode(v.state.doc.toString()));
	});

	// this is used in the config of the code editor to define which language we are currently at
	function getLanguage(language) {
		switch (language) {
			case "javascript":
				return javascript();
			case "python":
				return python();
			case "c":
				return cpp();
			case "cpp":
				return cpp();
			default:
				return python();
		}
	}

	//config for the code editor
	let extensions = [
		lineNumbers(),
		highlightActiveLineGutter(),
		highlightSpecialChars(),
		history(),
		foldGutter(),
		drawSelection(),
		indentUnit.of("    "),
		EditorState.allowMultipleSelections.of(true),
		indentOnInput(),
		bracketMatching(),
		closeBrackets(),
		autocompletion(),
		rectangularSelection(),
		crosshairCursor(),
		highlightSelectionMatches(),
		keymap.of([
			indentWithTab,
			...closeBracketsKeymap,
			...defaultKeymap,
			...historyKeymap,
			...foldKeymap,
			...completionKeymap,
		]),
		getLanguage(language),
		syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
		dracula,
		onUpdate,
		customTheme,
	];

	//initializing our code editor and setting reference to its view
	useEffect(() => {
		const startState = EditorState.create({
			doc: codeByLanguage[language],
			extensions,
		});

		view.current = new EditorView({
			state: startState,
			parent: editor.current,
		});
		return () => {
			view.current.destroy();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// if the lanuage changes, then we have to update the code to the corresponding langauge in the code editor
	useEffect(() => {
		view.current.dispatch({
			changes: {
				from: 0,
				to: view.current.state.doc.length,
				insert: codeByLanguage[language],
			},
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [language]);

	return (
		// container of the Editor
		<div
			className={`${styles.editorSection__container} ${!isLoading && `${styles.editorSection__containerBorder}`}`}
		>
			<div ref={editor} className={styles.editorSection__editor}></div>

			{isLoading && <div className={styles.editorSection__loadingOverlay} />}
		</div>
	);
}

EditorSection.propTypes = {
	codeByLanguage: PropTypes.object,
	language: PropTypes.string,
	isLoading: PropTypes.bool,
};
