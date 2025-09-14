import { apiSlice } from "./apiSlice";

const USERS_URL = "/api/users";

export const userApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		register: builder.mutation({
			query: (data) => ({
				url: `${USERS_URL}`,
				method: "POST",
				body: data,
			}),
		}),

		login: builder.mutation({
			query: (data) => ({
				url: `${USERS_URL}/login`,
				method: "POST",
				body: data,
			}),
		}),

		logout: builder.mutation({
			query: () => ({
				url: `${USERS_URL}/logout`,
				method: "POST",
			}),
		}),
	}),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } =
	userApiSlice;
