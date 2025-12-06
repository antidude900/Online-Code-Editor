import LeftSection from "../components/HomeSections/LeftSection";
import RightSection from "../components/HomeSections/RightSection";
import styles from "./Home.module.css";

const Home = () => {
	return (
		<div className={styles.home__container}>
			<div className={styles.home__leftSection}>
				<LeftSection />
			</div>

			<div className={styles.home__rightSection}>
				<RightSection />
			</div>
		</div>
	);
};

export default Home;
