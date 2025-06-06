import { apiSlice } from "../apiSlice";

export const nodemailerApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		sendMail: builder.mutation({
			query: (mailDetails) => ({
				url: "/api/third-party/nodemailer/send",
				method: "POST",
				body: mailDetails,
			}),
		}),
	}),
});

export const { useSendMailMutation } = nodemailerApiSlice;
