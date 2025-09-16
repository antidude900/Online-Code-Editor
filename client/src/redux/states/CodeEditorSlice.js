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
		setCodeEditor: (state, action) => {
			Object.keys(action.payload).forEach((key) => {
				if (key === "code") {
					state.code = action.payload[key];
					state.codeByLanguage[state.language] = action.payload[key];
				} else if (key === "language") {
					const newLanguage = action.payload[key];
					state.language = newLanguage;
					state.code = state.codeByLanguage[newLanguage];
				} else {
					state[key] = action.payload[key];
				}
			});
		},
	},
});

export const { setCodeEditor } = CodeEditorSlice.actions;
export default CodeEditorSlice.reducer;
