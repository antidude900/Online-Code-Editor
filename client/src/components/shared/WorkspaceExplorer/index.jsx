import { FilePlus } from "lucide-react";
import File from "./File";
import {
	useCreateFileMutation,
	useGetAllFilesQuery,
} from "@/redux/api/fileApiSlice";
import { setFiles } from "@/redux/states/filesSlice";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";

// eslint-disable-next-line react/prop-types
const WorkspaceExplorer = ({ currentFileId }) => {
	const [newFileTemp, setNewFileTemp] = useState(false);
	const [createFile, { isLoading }] = useCreateFileMutation();
	const {
		data: allFiles,
		error,
		isLoading: filesLoading,
	} = useGetAllFilesQuery();
	console.log("files", allFiles);
	console.log("Files loading:", filesLoading);
	const tempFiles = useSelector((state) => state.files);
	const files = currentFileId
		? tempFiles.filter((file) => file._id !== currentFileId)
		: tempFiles;
	console.log("Redux files state:", files);
	const code = useSelector((state) => state.codeEditor.codeByLanguage);
	console.log("new code", code);
	const dispatch = useDispatch();

	useEffect(() => {
		if (allFiles && tempFiles.length === 0) {
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

			dispatch(setFiles([...tempFiles, newFile]));

			console.log("successfully created file");
			setNewFileTemp(false);
		} catch (err) {
			throw new Error(err?.data?.message || err.error);
		}
	}

	if (filesLoading) {
		return (
			<div className={styles.workspaceExplorer__loadingText}>
				Loading Files...
			</div>
		);
	}

	return (
		<div className={styles.workspaceExplorer__container}>
			<div className={styles.workspaceExplorer__scrollContainer}>
				{!files.length ? (
					<div className={styles.workspaceExplorer__emptyState}>
						<div className={styles.workspaceExplorer__FileWrapper}>
							<FilePlus
								size={75}
								style={{ strokeDasharray: "2 2" }}
								strokeWidth={1}
								stroke="gray"
								className={styles.workspaceExplorer__FileIcon}
								onClick={() => setNewFileTemp(true)}
							/>

							<input
								value=""
								disabled
								className={styles.workspaceExplorer__inputSpaceHolder}
							/>
						</div>

						{newFileTemp && (
							<File
								active={true}
								saveNewFile={saveNewFile}
								loading={isLoading}
								temp={true}
							/>
						)}
					</div>
				) : (
					<div className={styles.workspaceExplorer__grid}>
						<FilePlus
							size={75}
							style={{ strokeDasharray: "2 2" }}
							strokeWidth={1}
							stroke="gray"
							className={styles.workspaceExplorer__FileIcon}
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
