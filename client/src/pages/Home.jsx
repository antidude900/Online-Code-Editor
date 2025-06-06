import LeftSection from "../components/HomeSections/LeftSection";
import RightSection from "../components/HomeSections/RightSection";

const Home = () => {
	return (
		<div className="flex h-screen">
			<LeftSection />
			<RightSection />
		</div>
	);
};

export default Home;
