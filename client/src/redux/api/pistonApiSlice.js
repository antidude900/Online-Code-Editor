import { LANGUAGES } from "../../constants";
import { apiSlice } from "./apiSlice";

export const pistonApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		executeCode: builder.mutation({
			query: ({ language, code, input }) => ({
				url: "/api/piston/execute",
				method: "POST",
				body: {
					language: language,
					version: LANGUAGES[language],
					files: [
						{
							content: code,
						},
					],
					stdin: input,
				},
			}),
		}),
	}),
});

export const { useExecuteCodeMutation } = pistonApiSlice;
