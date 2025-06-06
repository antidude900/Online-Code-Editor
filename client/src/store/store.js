import { configureStore } from "@reduxjs/toolkit";
import CodeEditorReducer from "./states/CodeEditor/CodeEditorSlice.js";
import { apiSlice } from "./api/apiSlice.js";
import { setupListeners } from "@reduxjs/toolkit/query";

const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
		codeEditor: CodeEditorReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);
export default store;
