import { apiSlice } from "./apiSlice";

const FILES_URL = "/api/files";

export const fileApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		createFile: builder.mutation({
			query: (data) => ({
				url: `${FILES_URL}`,
				method: "POST",
				body: data,
			}),
		}),

		getAllFiles: builder.query({
			query: () => ({
				url: FILES_URL,
			}),
		}),

		getFileById: builder.query({
			query: (id) => ({
				url: `${FILES_URL}/${id}`,
			}),
		}),

		saveFile: builder.mutation({
			query: ({ id, data }) => ({
				url: `${FILES_URL}/${id}`,
				method: "PUT",
				body: data,
			}),
		}),

		deleteFile: builder.mutation({
			query: (id) => ({
				url: `${FILES_URL}/${id}`,
				method: "DELETE",
			}),
		}),

		renameFile: builder.mutation({
			query: ({ id, data }) => ({
				url: `${FILES_URL}/${id}`,
				method: "PATCH",
				body: data,
			}),
		}),
	}),
});

export const {
	useCreateFileMutation,
	useGetAllFilesQuery,
	useGetFileByIdQuery,
	useSaveFileMutation,
	useDeleteFileMutation,
	useRenameFileMutation,
} = fileApiSlice;
