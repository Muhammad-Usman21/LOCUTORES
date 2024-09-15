// src/components/ResetPassword.js
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
	verifyPasswordResetCode,
	confirmPasswordReset,
	getAuth,
} from "firebase/auth";
import { app } from "../firebase";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { MdCancelPresentation } from "react-icons/md";
import { useSelector } from "react-redux";

const ResetPassword = () => {
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	const [isCodeValid, setIsCodeValid] = useState(false);
	const [email, setEmail] = useState("");
	const location = useLocation();
	const navigate = useNavigate();
	const auth = getAuth(app);
	const { theme } = useSelector((state) => state.theme);
	const [showPassword, setShowPassword] = useState(false);

	// Extract oobCode from URL
	const searchParams = new URLSearchParams(location.search);
	const oobCode = searchParams.get("oobCode");

	useEffect(() => {
		// Validate oobCode
		const validateCode = async () => {
			try {
				const email = await verifyPasswordResetCode(auth, oobCode);
				setEmail(email); // Email is valid
				setIsCodeValid(true);
			} catch (error) {
				console.error("Invalid or expired password reset code:", error.message);
				setError("Enlace de restablecimiento de contraseña no válido o caducado.");
			}
		};
		if (oobCode) {
			validateCode();
		} else {
			setError("No se encontró ningún código de restablecimiento en la URL.");
		}
	}, [oobCode]);

	const handleResetPassword = async (e) => {
		e.preventDefault();
		setError(null);
		setMessage(null);

		if (newPassword !== confirmPassword) {
			setError("Las contraseñas no coinciden.");
			return;
		}

		if (newPassword.length < 8) {
			setError("La contraseña debe tener al menos 8 caracteres.");
			return;
		}

		try {
			await confirmPasswordReset(auth, oobCode, newPassword);
			setMessage(
				"¡La contraseña se ha restablecido correctamente! Ya puedes iniciar sesión con tu nueva contraseña."
			);
			navigate("/"); // Redirect to login page or other appropriate page
		} catch (error) {
			console.error("Error resetting password:", error.message);
			setError("No se pudo restablecer la contraseña. Por favor inténtalo de nuevo.");
		}
	};

	return (
		<div className="min-h-screen py-20">
			<div
				className="flex p-5 md:p-10 max-w-2xl mx-5 sm:mx-10 md:mx-20 lg:mx-auto flex-col md:flex-row md:items-center gap-10
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
				<div className="flex-1 md:px-5">
					<h2 className="text-2xl text-center mb-10">Cambiar la contraseña</h2>
					{isCodeValid && (
						<form
							className={`flex flex-col gap-3 ${theme}`}
							onSubmit={handleResetPassword}>
							<div className="flex flex-col gap-1">
								<Label value="Cambiar contraseña para:" />
								<TextInput type="email" placeholder={email} disabled />
							</div>
							<div className="flex flex-col gap-1">
								<Label value="Nueva contraseña" />
								<div className="flex items-center gap-1">
									<TextInput
										type={showPassword ? "text" : "password"}
										placeholder="Nueva contraseña"
										id="password"
										onChange={(e) => {
											setNewPassword(e.target.value);
										}}
										className="flex-auto"
										required
										minLength="8"
									/>
									<Button
										className="w-10 h-10 focus:ring-1 items-center rounded-lg"
										color="gray"
										onMouseEnter={() => setShowPassword(true)}
										onMouseLeave={() => setShowPassword(false)}>
										{showPassword ? <BiSolidShow /> : <BiSolidHide />}
									</Button>
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<Label value="Confirmar Contraseña" />
								<TextInput
									type="password"
									placeholder="Confirmar Contraseña"
									id="confirmPassword"
									onChange={(e) => {
										setConfirmPassword(e.target.value);
									}}
									required
								/>
							</div>
							<Button
								gradientDuoTone="purpleToBlue"
								type="submit"
								className="uppercase focus:ring-1 mt-1"
								disabled={error}>
								Cambiar la contraseña
							</Button>
						</form>
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

export default ResetPassword;
