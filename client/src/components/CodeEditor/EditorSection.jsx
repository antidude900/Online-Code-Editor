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
import "./loading-animation.css";
import { useDispatch, useSelector } from "react-redux";
import { updateCode } from "../../redux/states/CodeEditorSlice";

export default function EditorSection() {
	const { code, language, isLoading } = useSelector(
		(state) => state.codeEditor
	);

	const dispatch = useDispatch();

	const editor = useRef();
	const view = useRef();

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
				return javascript();
		}
	}

	const customTheme = EditorView.theme({
		".cm-selectionBackground": {
			backgroundColor: "#4A90E2 !important",
			opacity: "0.4",
		},
		".cm-selectionMatch": {
			backgroundColor: "#4A90E2",
			opacity: "0.2",
		},
	});

	const onUpdate = EditorView.updateListener.of((v) => {
		dispatch(updateCode(v.state.doc.toString()));
	});

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

	useEffect(() => {
		const startState = EditorState.create({
			doc: code,
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

	useEffect(() => {
		if (view.current && view.current.state.doc.toString() !== code) {
			view.current.dispatch({
				changes: {
					from: 0,
					to: view.current.state.doc.length,
					insert: code,
				},
			});
		}
	}, [code]);

	return (
		<div
			className={`${
				isLoading ? "card" : "border-4 rounded-[10px] border-gray-700"
			} h-[80vh] `}
		>
			<div className="bg-[#282A36] h-full z-1 p-2 border border-transparent rounded-[10px]	">
				<div ref={editor} className="h-full"></div>
			</div>
		</div>
	);
}
