import { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useRenameFileMutation } from "@/redux/api/fileApiSlice";
import { setFiles } from "@/redux/states/filesSlice";
import styles from "./Title.module.css";

const Title = ({ file }) => {
	const [name, setName] = useState(file?.filename || "");

	useEffect(() => {
		if (file?.filename) {
			setName(file.filename);
		}
	}, [file?.filename]);
	const files = useSelector((state) => state.files);
	const [renameFile, { isLoading: renameLoading }] = useRenameFileMutation();
	const inputRef = useRef(null);
	const dispatch = useDispatch();

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
			await renameFile({ id: file._id, data: { filename: name } }).unwrap();
			dispatch(
				setFiles(
					files.map((f) => (f._id === file._id ? { ...f, filename: name } : f))
				)
			);
			form.blur();
		} catch (error) {
			form.setCustomValidity(error?.data?.message || "An error occurred");
			form.reportValidity();
		}
	}

	return (
		<div className={styles.title__container}>
			<input
				ref={inputRef}
				value={name}
				disabled={renameLoading}
				onChange={(e) => {
					setName(e.target.value);
					e.target.setCustomValidity("");
				}}
				onKeyDown={handleKeyDown}
				onBlur={() => setName(file.filename)}
				size={name.length || 1}
				className={`${styles.title__input} ${
					renameLoading ? styles.title__inputDisabled : ""
				}`}
				{...validation()}
			/>
		</div>
	);
};
Title.propTypes = {
	file: PropTypes.object,
};
export default Title;
