import { createSlice } from "@reduxjs/toolkit";


const CodeEditorSlice = createSlice({
	name: "codeEditor",
	initialState: {
		code: "Write your code here:",
        language:"javascript",
		output: [],
		input: "",
		isLoading: false,
		isError: null,
	},
	reducers: {
		setCodeEditor: (state, action) => {
			Object.keys(action.payload).forEach((key) => {
				state[key] = action.payload[key];
			});
		},
	},
});

export const { setCodeEditor } = CodeEditorSlice.actions;
export default CodeEditorSlice.reducer;

