import { createSlice } from "@reduxjs/toolkit";
import { CODE_SNIPPETS } from "../../constants";

const initialState = {
	codeByLanguage: {
		python: CODE_SNIPPETS.python,
		javascript: CODE_SNIPPETS.javascript,
		c: CODE_SNIPPETS.c,
		cpp: CODE_SNIPPETS.cpp,
	},
	code: CODE_SNIPPETS.python,
	language: "python",
	output: "",
	input: "",
	isLoading: false,
	error: null,
	isInteractive: true,
};

const CodeEditorSlice = createSlice({
	name: "codeEditor",
	initialState,
	reducers: {
		updateCode: (state, action) => {
			state.code = action.payload;
			state.codeByLanguage[state.language] = action.payload;
		},
		updateAllCode: (state, action) => {
			const newContent = action.payload;
			console.log("newContent", newContent);
			state.code = newContent[state.language];
			state.codeByLanguage = newContent;
			console.log("new ones", state.code, state.codeByLanguage);
		},
		switchLanguage: (state, action) => {
			const newLanguage = action.payload;
			state.language = newLanguage;
			state.code = state.codeByLanguage[newLanguage];
		},

		setEditorProperty: (state, action) => {
			const { property, value } = action.payload;
			state[property] = value;
		},

		appendOutput: (state, action) => {
			state.output = state.output + action.payload;
		},

		clearOutput: (state) => {
			state.output = "";
			state.isError = null;
		},

		resetToInitialState: () => initialState,
	},
});

export const {
	updateCode,
	updateAllCode,
	switchLanguage,
	setEditorProperty,
	appendOutput,
	clearOutput,
	resetToInitialState,
} = CodeEditorSlice.actions;
export default CodeEditorSlice.reducer;
