import { createSlice } from "@reduxjs/toolkit";
import { CODE_SNIPPETS } from "../../constants";

const CodeEditorSlice = createSlice({
	name: "codeEditor",
	initialState: {
		codeByLanguage: {
			javascript: CODE_SNIPPETS.javascript,
			python: CODE_SNIPPETS.python,
			c: CODE_SNIPPETS.c,
			cpp: CODE_SNIPPETS.cpp,
		},
		code: CODE_SNIPPETS.javascript,
		language: "javascript",
		output: [],
		input: "",
		isLoading: false,
		isError: null,
	},
	reducers: {
		updateCode: (state, action) => {
			state.code = action.payload;
			state.codeByLanguage[state.language] = action.payload;
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

		clearOutput: (state) => {
			state.output = [];
			state.isError = null;
		},
	},
});

export const { updateCode, switchLanguage, setEditorProperty, clearOutput } =
	CodeEditorSlice.actions;
export default CodeEditorSlice.reducer;
