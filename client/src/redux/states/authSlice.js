import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	userInfo: null,
	isLoading: true,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setCredentials: (state, action) => {
			state.userInfo = action.payload;
			state.isLoading = false;
		},

		logout: (state) => {
			state.userInfo = null;
			state.isLoading = false;
		},
	},
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
