import { createSlice } from "@reduxjs/toolkit";

const filesSlice = createSlice({
	name: "files",
	initialState: [],
	reducers: {
		setFiles: (_, action) => action.payload,

		updateFilename: (state, action) => {
			const { id, newFilename } = action.payload;
			const file = state.find((f) => f._id === id);
			if (file) file.filename = newFilename;
		},
		deleteFile: (state, action) => {
			const id = action.payload;
			return state.filter((f) => f._id !== id);
		},
	},
});

export const { setFiles, updateFilename, deleteFile } = filesSlice.actions;
export default filesSlice.reducer;
