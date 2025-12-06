import CodeEditor from "../components/CodeEditor";
import styles from "./Editor.module.css";

function Editor() {
	return (
		<div className={styles.editor__container}>
			<CodeEditor />
		</div>
	);
}

export default Editor;
