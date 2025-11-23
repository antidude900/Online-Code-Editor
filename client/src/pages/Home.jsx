import LeftSection from "../components/HomeSections/LeftSection";
import RightSection from "../components/HomeSections/RightSection";

const Home = () => {
	return (
		<div className="flex flex-col lg:flex-row">
			<div className="w-full lg:w-[50%]">
				<LeftSection />
			</div>

			<div className="[@media(max-width:270px)]:hidden flex-1">
				<RightSection />
			</div>
		</div>
	);
};

export default Home;
