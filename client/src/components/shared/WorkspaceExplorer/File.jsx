import { useEffect, useRef, useState } from "react";
import { FileCode, Trash } from "lucide-react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import {
	useDeleteFileMutation,
	useRenameFileMutation,
} from "@/redux/api/fileApiSlice";
import { setFiles } from "@/redux/states/filesSlice";
import { Link } from "react-router-dom";
import styles from "./File.module.css";

const File = ({ file, deactivate, saveNewFile, loading, temp = false }) => {
	const [name, setName] = useState(file?.filename || "");
	const files = useSelector((state) => state.files);
	const dispatch = useDispatch();
	const [renameFile, { isLoading: renameLoading }] = useRenameFileMutation();
	const [deleteFile, { isLoading: deletingFile }] = useDeleteFileMutation();
	const [fileLoading, setFileLoading] = useState(false);
	const inputRef = useRef(null);

	useEffect(() => {
		if (loading || renameLoading || deletingFile) {
			setFileLoading(true);
		} else setFileLoading(false);
	}, [loading, renameLoading, deletingFile]);

	useEffect(() => {
		if (!file) {
			inputRef.current?.focus();
		}
	}, [file]);

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			setName(e.target.value.trim());
			handleSubmit(e);
		}
		if (e.key === "Escape") {
			inputRef.current?.blur();
		}
	};

	function validation() {
		return {
			required: true,
			minLength: 1,
			maxLength: 20,
			// pattern: "^[a-zA-Z0-9_s-]+$",
			title: "Press Enter to save",
		};
	}

	async function handleSubmit(e) {
		e.preventDefault();
		const form = e.target;

		if (file && name === file.filename) {
			form.blur();
			return;
		}

		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}

		const pattern = /^[a-zA-Z0-9_\s-]+$/; //somehow the pattern validation is not working, so manually working with this
		if (!pattern.test(name)) {
			form.setCustomValidity(
				"File name must contain only letters, numbers, hyphens, and underscores"
			);
			form.reportValidity();
			return;
		}

		const isNameTaken = files.some((file) => file.filename === name);
		if (isNameTaken) {
			form.setCustomValidity(
				"File name already exists. Please choose a different name."
			);
			form.reportValidity();
			return;
		}

		try {
			if (file) {
				await renameFile({ id: file._id, data: { filename: name } }).unwrap();
			} else {
				saveNewFile?.(name);
			}
			form.blur();
		} catch (error) {
			form.setCustomValidity(error?.data?.message || "An error occurred");
			form.reportValidity();
		}
	}

	async function handleDelete() {
		try {
			await deleteFile(file._id).unwrap();
			const updatedFiles = files.filter((f) => f._id !== file._id);
			dispatch(setFiles(updatedFiles));
		} catch (error) {
			console.error("Error deleting file:", error);
		}
	}

	return (
		<div className={styles.file__container}>
			<Link to={file && !fileLoading ? `/editor/${file._id}` : "#"}>
				<FileCode
					size={75}
					className={`${styles.file__icon} ${
						!file ? styles.file__iconDisabled : ""
					} ${fileLoading ? styles.file__iconLoading : ""}`}
				/>
			</Link>

			{!temp && (
				<div
					className={styles.file__deleteButton}
					disabled={fileLoading}
					onClick={handleDelete}
				>
					<Trash size={15} className={styles.file__deleteIcon} />
				</div>
			)}

			<input
				ref={inputRef}
				value={name}
				onChange={(e) => {
					setName(e.target.value);
					e.target.setCustomValidity("");
				}}
				disabled={fileLoading}
				onKeyDown={handleKeyDown}
				onBlur={() => (file ? setName(file.filename) : deactivate?.())}
				size={name.length || 1}
				className={`${styles.file__input} ${
					fileLoading ? styles.file__inputDisabled : ""
				}`}
				{...validation()}
			/>
		</div>
	);
};
File.propTypes = {
	file: PropTypes.object,
	deactivate: PropTypes.func,
	saveNewFile: PropTypes.func,
	loading: PropTypes.bool,
	temp: PropTypes.bool,
};
export default File;
