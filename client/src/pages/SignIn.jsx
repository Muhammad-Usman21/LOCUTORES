import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInSuccess } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { MdCancelPresentation } from "react-icons/md";
import OAuth from "../components/OAuth";
import {
	getAuth,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { app } from "../firebase";

const SignIn = () => {
	const [formData, setFormData] = useState({});
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { theme } = useSelector((state) => state.theme);
	const auth = getAuth(app);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);

	const handleChange = (e) => {
		// console.log(e.target.value);
		setLoading(false);
		setErrorMessage(null);
		// setFormData({ ...formData, [e.target.id]: e.target.value });
		setFormData((prevFormData) => ({
			...prevFormData,
			[e.target.id]: e.target.value,
		}));
	};

	// console.log(formData);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.email || !formData.password) {
			return setErrorMessage("All fields are required!");
		}
		try {
			setLoading(true);
			setErrorMessage(null);

			const firebaseUser = await signInWithEmailAndPassword(
				auth,
				formData.email,
				formData.password
			);

			const res = await fetch("/api/auth/signin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...formData, password: firebaseUser.user.uid }),
			});
			const data = await res.json();
			if (data.success === false) {
				setLoading(false);
				setErrorMessage(data.message);
				return;
			}
			if (res.ok && firebaseUser && firebaseUser.user) {
				setLoading(false);
				dispatch(signInSuccess(data));
				navigate("/");
			}
		} catch (error) {
			setErrorMessage(error.message);
			setLoading(false);
		}
	};

	const handleForgotPassword = async (e) => {
		e.preventDefault();
		setError(null);
		setMessage(null);

		if (!formData.email) {
			return setError("Email required!");
		}

		try {
			await sendPasswordResetEmail(auth, formData.email);
			setMessage("Password reset email sent! Check your inbox.");
		} catch (error) {
			console.error("Error sending password reset email:", error);
			setError(error.message);
		}
	};

	return (
		<div className="min-h-screen py-20">
			<div
				className="flex p-5 md:p-10 max-w-2xl mx-5 sm:mx-10 md:mx-20 lg:mx-auto flex-col md:flex-row md:items-center gap-10
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
				<div className="flex-1 md:px-5">
					<form
						className={`flex flex-col gap-3 ${theme}`}
						onSubmit={handleSubmit}>
						<div className="flex flex-col gap-1">
							<Label value="Sign in with email" />
							<TextInput
								type="text"
								placeholder="Email"
								id="email"
								onChange={handleChange}
								required
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label value="Your password" />
							<TextInput
								type="password"
								placeholder="Password"
								id="password"
								onChange={handleChange}
								required
							/>
						</div>
						<Button
							gradientDuoTone="purpleToBlue"
							type="submit"
							className="uppercase focus:ring-1 mt-1"
							disabled={loading || errorMessage}>
							{loading ? (
								<>
									<Spinner size="sm" />
									<span className="pl-3">Loading...</span>
								</>
							) : (
								"Sign in"
							)}
						</Button>
						<OAuth />
					</form>
					<div className="flex justify-between text-sm mt-4">
						<div className="flex gap-2 text-sm">
							<span>Dont have an account?</span>
							<Link to="/sign-up" className="text-blue-500">
								Sign Up
							</Link>
						</div>
						<div className="text-red-500">
							<span className="cursor-pointer" onClick={handleForgotPassword}>
								Forget Password?
							</span>
						</div>
					</div>
					{errorMessage && (
						<div className="flex items-center gap-1 mt-4">
							<Alert className="flex-auto" color="failure" withBorderAccent>
								<div className="flex justify-between">
									<span>{errorMessage}</span>
									<span className="w-5 h-5">
										<MdCancelPresentation
											className="cursor-pointer w-6 h-6"
											onClick={() => setErrorMessage(null)}
										/>
									</span>
								</div>
							</Alert>
						</div>
					)}
					{error && (
						<div className="flex items-center gap-1 mt-4">
							<Alert className="flex-auto" color="failure" withBorderAccent>
								<div className="flex justify-between">
									<span>{error}</span>
									<span className="w-5 h-5">
										<MdCancelPresentation
											className="cursor-pointer w-6 h-6"
											onClick={() => setError(null)}
										/>
									</span>
								</div>
							</Alert>
						</div>
					)}
					{message && (
						<div className="flex items-center gap-1 mt-4">
							<Alert className="flex-auto" color="success" withBorderAccent>
								<div className="flex justify-between">
									<span>{message}</span>
									<span className="w-5 h-5">
										<MdCancelPresentation
											className="cursor-pointer w-6 h-6"
											onClick={() => setMessage(null)}
										/>
									</span>
								</div>
							</Alert>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SignIn;
