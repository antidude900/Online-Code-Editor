import { useState, useEffect } from "react";
import {
	useCreateFileMutation,
	useSaveFileMutation,
	useGetFileByIdQuery,
} from "@/redux/api/fileApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFiles } from "@/redux/states/filesSlice";
import AuthForm from "@/components/shared/AuthForm";
import Button from "@/components/shared/Button";
import styles from "./SaveButton.module.css";

// eslint-disable-next-line react/prop-types
export default function SaveButton({ fileId, codeByLanguage }) {
	const [saveFile, { isLoading: saving }] = useSaveFileMutation();
	const [createFile, { isLoading: creating }] = useCreateFileMutation();
	const [open, setOpen] = useState(false);
	const [lastSavedCode, setLastSavedCode] = useState(null);
	const { userInfo } = useSelector((state) => state.auth);
	const files = useSelector((state) => state.files);
	const code = useSelector((state) => state.codeEditor.codeByLanguage);
	const [name, setName] = useState("");
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const { data: currentFile } = useGetFileByIdQuery(fileId, {
		skip: !fileId,
	});

	const hasUnsavedChanges =
		fileId && currentFile && lastSavedCode
			? JSON.stringify(codeByLanguage) !== JSON.stringify(lastSavedCode)
			: fileId && currentFile
			? JSON.stringify(codeByLanguage) !== JSON.stringify(currentFile.code)
			: false;

	useEffect(() => {
		if (currentFile && currentFile.code) {
			setLastSavedCode(currentFile.code);
		}
	}, [currentFile]);

	const getSaveButtonState = () => {
		if (saving) return "saving";
		if (!fileId) return "new";
		if (hasUnsavedChanges) return "unsaved";
		return "saved";
	};

	const saveButtonState = getSaveButtonState();

	async function saveNewFile(filename) {
		if (!filename) return;

		try {
			const newFile = await createFile({
				filename,
				code,
			}).unwrap();

			dispatch(setFiles([...files, newFile]));
			navigate(`/editor/${newFile._id}`);

			return newFile;
		} catch (err) {
			throw new Error(err?.data?.message || err.error);
		}
	}

	function validation() {
		return {
			required: true,
			minLength: 1,
			maxLength: 20,
			// pattern: "^[a-zA-Z0-9_s-]+$",
			title:
				"File name must be 1-50 characters and contain only letters, numbers, spaces, hyphens, and underscores",
		};
	}

	async function handleSubmit(e) {
		e.preventDefault();
		const form = e.target;
		const input = form.elements[0];

		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}

		// Check pattern with spaces allowed
		const pattern = /^[a-zA-Z0-9_\s-]+$/;
		if (!pattern.test(name)) {
			input.setCustomValidity(
				"File name must contain only letters, numbers, spaces, hyphens, and underscores"
			);
			input.reportValidity();
			return;
		}

		const isNameTaken = files.some((file) => file.filename === name);
		if (isNameTaken) {
			input.setCustomValidity(
				"File name already exists. Please choose a different name."
			);
			input.reportValidity();
			return;
		}

		try {
			await saveNewFile(name);
			setOpen(false); // Close modal after successful creation
		} catch (error) {
			input.setCustomValidity(error?.data?.message || "An error occurred");
			input.reportValidity();
		}
	}

	// Render button content based on state
	const renderButtonContent = () => {
		switch (saveButtonState) {
			case "saving":
				return (
					<>
						<span className={styles.saveButton__saving}>Saving</span>
					</>
				);
			case "saved":
				return (
					<>
						<span className={styles.saveButton__saved}>Saved</span>
					</>
				);
			default:
				return <span>Save</span>;
		}
	};

	return (
		<div>
			<Button
				className={styles.saveButton__container}
				disabled={saving}
				onClick={async () => {
					if (userInfo) {
						if (fileId) {
							try {
								await saveFile({ id: fileId, data: codeByLanguage });
								setLastSavedCode(codeByLanguage);
							} catch (err) {
								console.log(err);
							}
						} else {
							setOpen(true);
						}
					} else {
						setOpen(true);
					}
				}}
			>
				{renderButtonContent()}
			</Button>

			{open && (
				<div className={styles.saveButton__authModal}>
					<div className={styles.saveButton__authModalContent}>
						<button
							onClick={() => setOpen(false)}
							className={styles.saveButton__authModalCloseButton}
						>
							×
						</button>

						{!userInfo ? (
							<AuthForm />
						) : (
							<div>
								<div className={styles.saveButton__FilenameModalTitle}>
									Name of your file:
								</div>

								<form onSubmit={handleSubmit}>
									<input
										value={name}
										placeholder="Enter the name..."
										onChange={(e) => {
											setName(e.target.value);
											e.target.setCustomValidity("");
										}}
										onBlur={(e) => {
											setName(e.target.value.trim());
										}}
										disabled={creating}
										className={styles.saveButton__FilenameModalInput}
										{...validation()}
									/>
									<Button
										type="submit"
										disabled={creating}
										className={styles.saveButton__FilenameModalSubmitButton}
									>
										{creating ? "Creating..." : "Create File"}
									</Button>
								</form>
							</div>
						)}
					</div>

					<div
						className={styles.saveButton__backdrop}
						onClick={() => setOpen(false)}
					/>
				</div>
			)}
		</div>
	);
}
