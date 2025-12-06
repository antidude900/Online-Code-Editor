import { Link } from "react-router-dom";
import styles from "./index.module.css";

const LeftSection = () => {
	return (
		<div className={styles.leftSection__container}>
			<div className={styles.leftSection__content}>
				<Link to="/editor" className={styles.leftSection__Button}>
					Start Coding
				</Link>
				<div className={styles.leftSection__notice}>
					YOU CAN DIRECTLY START CODING! BUT FOR SAVING FILES, LOGIN IS REQUIRED
				</div>
			</div>
			<div className={styles.leftSection__shadowOverlay}></div>
		</div>
	);
};

export default LeftSection;
