import { NavLink } from "react-router-dom";

const LeftSection = () => {
	return (
		<div className="flex relative">
			<div className="bg-[url('/assets/home-right-bg.jpg')] flex-1 bg-cover bg-center flex flex-col items-center justify-center">
				<NavLink
					to="/editor"
					className="mt-[50px] bg-black/70 text-cyan-400 border border-cyan-400 rounded-lg px-12 py-4 text-2xl font-mono shadow-lg shadow-cyan-500/50 hover:scale-105 hover:shadow-cyan-500/80 font-black transition-transform"
				>
					Start Coding
				</NavLink>
				<div className="my-[20px] py-[20px] font-black text-lg decoration-cyan-500 font-mono w-[60%] text-center bg-black/50">
					YOU CAN DIRECTLY START CODING! BUT FOR SAVING FILES, LOGIN IS
					REQUIRED😁
				</div>
				<div></div>
			</div>
			<div className="bg-transparent absolute top-0 right-0 bottom-0 w-[5%] shadow-[rgba(20,20,30,0.75)_20px_0px_15px_0px]"></div>
		</div>
	);
};

export default LeftSection;
