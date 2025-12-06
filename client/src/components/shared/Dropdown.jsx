import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./Dropdown.module.css";
import Button from "./Button";

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
		<div className={styles.dropdown__container} ref={dropdownRef}>
			<Button
				className={`${isOpen ? styles.dropdown__buttonActive : ""}`}
				onClick={toggleDropdown}
			>
				{buttonText}
			</Button>

			{isOpen && (
				<div className={styles.dropdown__content}>
					{typeof children === "function" ? children(closeDropdown) : children}
				</div>
			)}
		</div>
	);
}

Dropdown.propTypes = {
	buttonText: PropTypes.node.isRequired,
	children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};
