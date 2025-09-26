import { Folder } from "lucide-react";
import { useEffect, useState } from "react";
import WorkspaceExplorer from "../WorkspaceExplorer";
import { useParams } from "react-router";

const FilesShow = () => {
	const { fileId } = useParams();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		setOpen(false);
	}, [fileId]);
	return (
		<>
			<Folder className="cursor-pointer" onClick={() => setOpen(true)} />
			{open && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-[#282A36] p-8 rounded-2xl shadow-xl shadow-gray-900 w-[50%] h-[90%] relative">
						<button
							onClick={() => setOpen(false)}
							className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
						>
							×
						</button>

						<div className="w-full h-full">
							<WorkspaceExplorer currentFileId={fileId} />
						</div>
					</div>

					<div
						className="absolute inset-0 -z-10"
						onClick={() => setOpen(false)}
					/>
				</div>
			)}
		</>
	);
};

export default FilesShow;
