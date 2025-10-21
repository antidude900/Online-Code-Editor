import { useEffect, useRef, useState } from "react";
import { FileCode, Trash } from "lucide-react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import {
	useDeleteFileMutation,
	useRenameFileMutation,
} from "../../redux/api/fileApiSlice";
import { setFiles } from "../../redux/states/filesSlice";
import { Link } from "react-router-dom";

const File = ({ file, deactivate, saveNewFile, loading }) => {
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
		<div className="relative group flex flex-col items-center cursor-pointer">
			<Link to={file && !fileLoading ? `/editor/${file._id}` : "#"}>
				<FileCode
					size={75}
					strokeWidth={1}
					className={`group-hover:stroke-cyan-400 ${
						!file && "cursor-not-allowed"
					} ${fileLoading && "animate-pulse text-gray-900 cursor-not-allowed"}
				}`}
				/>
			</Link>

			<div
				className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex flex-col gap-1"
				disabled={fileLoading}
				onClick={handleDelete}
			>
				<Trash size={15} className="text-red-500" />
			</div>

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
				className="bg-transparent text-center focus:border-b border-gray-400 focus:outline-none text-sm"
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
};
export default File;
