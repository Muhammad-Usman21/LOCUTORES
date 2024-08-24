import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	currentUser: null,
};

const userSLice = createSlice({
	name: "user",
	initialState,
	reducers: {
		signInSuccess: (state, action) => {
			state.currentUser = action.payload;
		},
		updateUserSuccess: (state, action) => {
			state.currentUser = action.payload;
		},
		deleteUserSuccess: (state) => {
			state.currentUser = null;
		},
		signOutSuccess: (state) => {
			state.currentUser = null;
		},
	},
});

export const {
	signInSuccess,
	updateUserSuccess,
	deleteUserSuccess,
	signOutSuccess,
} = userSLice.actions;

export default userSLice.reducer;
