import { useState } from "react";
import { useSelector } from "react-redux";
import { useSendMailMutation } from "../../redux/api/nodemailerApiSlice";

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
		<div className="dropdown p-0">
			<div
				tabIndex="0"
				role="button"
				className={`btn ${sending ? "cursor-not-allowed opacity-50" : ""}`}
			>
				Send to Mail
			</div>
			<ul
				tabIndex="0"
				className="dropdown-content bg-base-100 rounded-box z-[1] p-5 w-[370px] shadow"
			>
				{" "}
				<li>
					<div className="flex flex-col gap-3">
						<input
							type="email"
							placeholder="Enter your address here..."
							className="input border-gray-700"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
						/>
						<input
							type="text"
							placeholder="Enter the subject of the mail here..."
							className="input border-gray-700"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
						/>
						<div
							className={`btn ${
								sending ? "cursor-not-allowed opacity-50" : ""
							}`}
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
						</div>
					</div>
				</li>
			</ul>
		</div>
	);
}

// send("a", `Code:\n${code},Input:\n${input},Output:\n${output}`)
