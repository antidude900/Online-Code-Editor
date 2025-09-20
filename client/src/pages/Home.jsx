import LeftSection from "../components/HomeSections/LeftSection";
import RightSection from "../components/HomeSections/RightSection";

const Home = () => {
	return (
		<div className="flex h-screen">
			<div className="w-[50%]">
				<LeftSection />
			</div>

			<RightSection />
		</div>
	);
};

export default Home;
