import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice.js";
import { setupListeners } from "@reduxjs/toolkit/query";
import CodeEditorReducer from "./states/CodeEditorSlice.js";
import authReducer from "./states/authSlice.js";

const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
		codeEditor: CodeEditorReducer,
		auth: authReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware),
	devTools: true,
});

setupListeners(store.dispatch);
export default store;
