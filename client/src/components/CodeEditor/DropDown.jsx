import { useState, useEffect, useRef } from "react";

// eslint-disable-next-line react/prop-types
export default function Dropdown({ buttonText, children }) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	const toggleDropdown = () => setIsOpen((prev) => !prev);
	const closeDropdown = () => setIsOpen(false);

	const handleClickOutside = (event) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			closeDropdown();
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				className={`${isOpen && "bg-[#1D1F28]"}`}
				onClick={toggleDropdown}
			>
				{buttonText}
			</button>

			{isOpen &&
				(typeof children === "function" ? children(closeDropdown) : children)}
		</div>
	);
}
