import { FilePlus } from "lucide-react";
import File from "./File";
import {
	useCreateFileMutation,
	useGetAllFilesQuery,
} from "../../redux/api/fileApiSlice";
import { setFiles } from "../../redux/states/filesSlice";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const WorkspaceExplorer = () => {
	const [newFileTemp, setNewFileTemp] = useState(false);
	const [createFile, { isLoading }] = useCreateFileMutation();
	const {
		data: allFiles,
		error,
		isLoading: filesLoading,
	} = useGetAllFilesQuery();
	console.log("files", allFiles);
	console.log("Files loading:", filesLoading);
	const files = useSelector((state) => state.files);
	console.log("Redux files state:", files);
	const code = useSelector((state) => state.codeEditor.codeByLanguage);
	console.log("new code", code);
	const dispatch = useDispatch();

	useEffect(() => {
		if (allFiles) {
			console.log("Setting files in Redux:", allFiles);
			dispatch(setFiles(allFiles));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allFiles]);

	useEffect(() => {
		if (error) {
			console.error("Error fetching files:", error);
		}
	}, [error]);

	async function saveNewFile(filename) {
		if (!filename) return;

		try {
			const newFile = await createFile({
				filename,
				code,
			}).unwrap();

			dispatch(setFiles([...files, newFile]));

			console.log("successfully created file");
			setNewFileTemp(false);
		} catch (err) {
			throw new Error(err?.data?.message || err.error);
		}
	}

	if (filesLoading) {
		return <div>Loading Files...</div>;
	}

	return (
		<div className="border-2 border-gray-600 border-dashed w-full rounded-lg h-full p-8">
			<div className="overflow-auto h-full px-2 py-2">
				{!files.length ? (
					<div className="flex h-full justify-center items-center">
						<div className="flex flex-col items-center cursor-pointer">
							<FilePlus
								size={75}
								style={{ strokeDasharray: "2 2" }}
								strokeWidth={1}
								stroke="gray"
								className="hover:stroke-cyan-400"
								onClick={() => setNewFileTemp(true)}
							/>

							<input
								value=""
								disabled
								className="bg-transparent text-center border-b border-transparent text-gray-400"
							/>
						</div>

						{newFileTemp && (
							<File
								active={true}
								saveNewFile={saveNewFile}
								loading={isLoading}
							/>
						)}
					</div>
				) : (
					<div className="grid grid-cols-3 gap-x-10 gap-y-10 justify-items-center place-items-start">
						<FilePlus
							size={75}
							style={{ strokeDasharray: "2 2" }}
							strokeWidth={1}
							stroke="gray"
							className="hover:stroke-cyan-400"
							onClick={() => setNewFileTemp(true)}
						/>
						{files.map((file) => (
							<File key={file._id} file={file} />
						))}

						{newFileTemp && (
							<File
								deactivate={() => setNewFileTemp(false)}
								saveNewFile={saveNewFile}
								loading={isLoading}
							/>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default WorkspaceExplorer;
