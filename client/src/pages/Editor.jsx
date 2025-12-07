import { useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import styles from "./Editor.module.css";

function Editor() {
	const { fileId } = useParams();

	return (
		<div className={styles.editor__container}>
			<CodeEditor fileId={fileId} />
		</div>
	);
}

export default Editor;
