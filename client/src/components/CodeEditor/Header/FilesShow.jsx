import { Folder } from "lucide-react";
import { useEffect, useState } from "react";
import WorkspaceExplorer from "@/components/shared/WorkspaceExplorer";
import { useParams } from "react-router";
import styles from "./FilesShow.module.css";

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
				<div className={styles.filesShow__modal}>
					<div className={styles.filesShow__modalContent}>
						<button
							onClick={() => setOpen(false)}
							className={styles.filesShow__closeButton}
						>
							×
						</button>

						<div className={styles.filesShow__workspaceContainer}>
							<WorkspaceExplorer currentFileId={fileId} />
						</div>
					</div>

					<div
						className={styles.filesShow__backdrop}
						onClick={() => setOpen(false)}
					/>
				</div>
			)}
		</>
	);
};

export default FilesShow;
