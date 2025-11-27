import { createSlice } from "@reduxjs/toolkit";

const setInitialState = () => {
	const userInfo = localStorage.getItem("userInfo");
	const expirationTime = localStorage.getItem("expirationTime");

	if (!userInfo || !expirationTime) {
		return null;
	}

	const currentTime = new Date().getTime();
	if (currentTime > parseInt(expirationTime)) {
		localStorage.clear();
		return null;
	}

	return JSON.parse(userInfo);
};

const initialState = {
	userInfo: setInitialState(),
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setCredentials: (state, action) => {
			state.userInfo = action.payload;
			localStorage.setItem("userInfo", JSON.stringify(action.payload));

			const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
			localStorage.setItem("expirationTime", expirationTime);
		},

		logout: (state) => {
			state.userInfo = null;
			localStorage.clear();
		},
	},
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
