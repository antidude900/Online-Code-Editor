import { useEffect, useRef, useState } from "react";
import { FileCode, Trash } from "lucide-react";
import PropTypes from "prop-types";

const File = ({ active, fileSave, loading, name: fileName }) => {
	const [name, setName] = useState(fileName || "Untitled");
	const inputRef = useRef(null);

	useEffect(() => {
		if (fileName) {
			setName(fileName);
		}
	}, [fileName]);

	useEffect(() => {
		if (active) {
			inputRef.current?.focus();
		}
	}, [active]);

	const handleKeyDown = (e) => {
		if (e.key === "Enter" || e.key === "Escape") {
			inputRef.current?.blur();
		}
	};

	return (
		<div className="relative group flex flex-col items-center cursor-pointer">
			{loading ? (
				<div>Loading...</div>
			) : (
				<FileCode
					size={75}
					strokeWidth={1}
					className="group-hover:stroke-cyan-400"
				/>
			)}

			<div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex flex-col gap-1">
				<Trash size={15} className="text-red-500" />
			</div>

			<input
				ref={inputRef}
				value={name}
				onChange={(e) => setName(e.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={() => fileSave?.(name)}
				size={name.length || 1}
				className="bg-transparent text-center focus:border-b border-gray-400 focus:outline-none"
			/>
		</div>
	);
};
File.propTypes = {
	active: PropTypes.bool,
	fileSave: PropTypes.func,
	loading: PropTypes.bool,
	name: PropTypes.string,
};
export default File;
