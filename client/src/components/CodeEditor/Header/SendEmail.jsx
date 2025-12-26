import { useState } from "react";
import { useSelector } from "react-redux";
import { useSendMailMutation } from "@/redux/api/nodemailerApiSlice";
import Dropdown from "@/components/shared/Dropdown";
import Button from "@/components/shared/Button";
import styles from "./SendEmail.module.css";

export default function SendEmail() {
	const { code, input, output } = useSelector((state) => state.codeEditor);
	const [sending, setSending] = useState(false);
	const [address, setAddress] = useState("");
	const [subject, setSubject] = useState("");
	const [sendMail] = useSendMailMutation();

	async function send(to, message) {
		try {
			setSending(true);
			await sendMail({
				to: to,
				subject: subject || "Code From LinkCode",
				message: message,
			});

			alert("Email sent!");
		} catch (err) {
			alert(err);
		} finally {
			setSending(false);
		}
	}
	return (
		<Dropdown buttonText="Send">
			<div className={styles.sendEmail__form}>
				<input
					type="email"
					placeholder="Enter your address here..."
					className={styles.sendEmail__input}
					value={address}
					onChange={(e) => setAddress(e.target.value)}
				/>
				<input
					type="text"
					placeholder="Enter the subject of the mail here..."
					className={styles.sendEmail__input}
					value={subject}
					onChange={(e) => setSubject(e.target.value)}
				/>
				<Button
					disabled={sending}
					onClick={() =>
						send(
							address,
							`<hr>
    						<h2>Code:</h2>
    						<pre>${code}</pre>
    						<hr>
    						<h2>Input:</h2>
    						<pre>${input}</pre>
    						<hr>
    						<h2>Output:</h2>
    						<pre>${output}</pre>
    						<hr>`
						)
					}
				>
					Submit
				</Button>
			</div>
		</Dropdown>
	);
}
