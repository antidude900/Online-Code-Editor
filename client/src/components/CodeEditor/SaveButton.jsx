import { useState } from "react";
import {
	useCreateFileMutation,
	useSaveFileMutation,
} from "../../redux/api/fileApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Login from "../HomeSections/Login";
import Register from "../HomeSections/Register";
import { setFiles } from "../../redux/states/filesSlice";

// eslint-disable-next-line react/prop-types
export default function SaveButton({ fileId, codeByLanguage }) {
	const [saveFile, { isLoading: saving }] = useSaveFileMutation();
	const [createFile, { isLoading: creating }] = useCreateFileMutation();
	const [open, setOpen] = useState(false);
	const [loginMode, setLoginMode] = useState(true);
	const { userInfo } = useSelector((state) => state.auth);
	const files = useSelector((state) => state.files);
	const code = useSelector((state) => state.codeEditor.codeByLanguage);
	const [name, setName] = useState("");
	const dispatch = useDispatch();
	const navigate = useNavigate();

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

	return (
		<div>
			<button
				className="btn"
				disabled={saving}
				onClick={async () => {
					if (userInfo) {
						if (fileId) {
							try {
								await saveFile({ id: fileId, data: codeByLanguage });
							} catch (err) {
								console.log(err);
							}
						} else {
							setOpen(true);
						}
					} else {
						// User not logged in - open modal for login
						setOpen(true);
					}
				}}
			>
				Save
			</button>

			{open && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-[#282A36] p-8 rounded-2xl shadow-xl shadow-gray-900 w-full max-w-sm relative">
						<button
							onClick={() => setOpen(false)}
							className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
						>
							×
						</button>

						{!userInfo ? (
							<>
								{loginMode ? <Login /> : <Register />}
								<div
									onClick={() => setLoginMode(!loginMode)}
									className="text-sm font-medium text-blue-500 hover:text-blue-700 underline cursor-pointer mt-6 text-center"
								>
									{loginMode ? "Create an Account" : "Already have an account"}
								</div>
							</>
						) : (
							<div>
								<div className="text-2xl font-bold mb-6">
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
										className="w-full h-[30px] text-center focus:border-b border-gray-400 focus:outline-none mb-6"
										{...validation()}
									/>
									<button
										type="submit"
										disabled={creating}
										className={`w-full bg-blue-500 py-2 px-4 rounded hover:bg-blue-600 ${
											creating && "opacity-50 cursor-not-allowed"
										}`}
									>
										{creating ? "Creating..." : "Create File"}
									</button>
								</form>
							</div>
						)}
					</div>

					<div
						className="absolute inset-0 -z-10"
						onClick={() => setOpen(false)}
					/>
				</div>
			)}
		</div>
	);
}
