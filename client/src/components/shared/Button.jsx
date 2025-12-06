import PropTypes from "prop-types";
import styles from "./Button.module.css";

const Button = ({ children, onClick, disabled, className = "" }) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`${styles.button__container} ${
				disabled ? styles.button__disabled : ""
			} ${className}`}
		>
			{children}
		</button>
	);
};

Button.propTypes = {
	children: PropTypes.node.isRequired,
	onClick: PropTypes.func,
	disabled: PropTypes.bool,
	className: PropTypes.string,
};

export default Button;
