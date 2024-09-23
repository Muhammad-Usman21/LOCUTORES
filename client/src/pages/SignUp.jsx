import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiSolidShow, BiSolidHide } from "react-icons/bi";
import { MdCancelPresentation } from "react-icons/md";
import { useSelector } from "react-redux";
import OAuth from "../components/OAuth";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { app } from "../firebase";

const SignUp = () => {
	const [formData, setFormData] = useState({});
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const { theme } = useSelector((state) => state.theme);
	const auth = getAuth(app);

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

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (
			!formData.name ||
			!formData.email ||
			!formData.password ||
			!formData.confirmPassword
		) {
			return setErrorMessage("Todos los campos son obligatorios!");
		}
		if (formData.password !== formData.confirmPassword) {
			return setErrorMessage("Tu contraseña no es la misma. ¡Intentar otra vez!");
		}
		if (formData.password.length < 8) {
			return setErrorMessage("¡La contraseña debe tener al menos 8 caracteres!");
		}

		if (formData.name === "") {
			return setErrorMessage("Nombre requerido!");
		}
		if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			return setErrorMessage("Introduzca un correo electrónico válido (nombre@empresa.com)");
		}
		if (formData.email !== formData.email.toLowerCase()) {
			return setErrorMessage("¡El correo electrónico debe estar en minúsculas!");
		}

		try {
			setLoading(true);
			setErrorMessage(null);

			const firebaseUser = await createUserWithEmailAndPassword(
				auth,
				formData.email,
				formData.password
			);
			console.log(firebaseUser.user.uid);

			setFormData({ ...formData, password: firebaseUser.user.uid });

			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					password: firebaseUser.user.uid,
				}),
			});
			const data = await res.json();
			if (data.success === false) {
				setErrorMessage(data.message);
				setLoading(false);
				return;
			}
			if (res.ok && firebaseUser && firebaseUser.user) {
				setLoading(false);
				navigate("/sign-in");
			}
		} catch (error) {
			setErrorMessage(error.message);
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen py-20">
			<div
				className="flex p-5 md:p-10 max-w-2xl mx-5 sm:mx-10 md:mx-20 lg:mx-auto flex-col md:flex-row md:items-center gap-10
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[20px] rounded-lg shadow-2xl dark:shadow-whiteLg">
				<div className="flex-1 md:px-5">
					<form
						className={`flex flex-col gap-3 ${theme}`}
						onSubmit={handleSubmit}>
						<div className="flex flex-col gap-1">
							<Label value="Your nameSu nombre" />
							<TextInput
								type="text"
								placeholder="Nombre"
								id="name"
								onChange={handleChange}
								required
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label value="Tu correo electrónico" />
							<TextInput
								type="email"
								placeholder="name@company.com"
								id="email"
								onChange={handleChange}
								required
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label value="Tu contraseña" />
							<div className="flex items-center gap-1">
								<TextInput
									type={showPassword ? "text" : "password"}
									placeholder="Contraseña"
									id="password"
									onChange={handleChange}
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
									<span className="pl-3">Cargando...</span>
								</>
							) : (
								"Inscribirse"
							)}
						</Button>
						<OAuth />
					</form>
					<div className="flex gap-2 text-sm mt-4">
						<span>¿Tienes una cuenta?</span>
						<Link to="/sign-in" className="text-blue-500">
						Iniciar sesión
						</Link>
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
				</div>
			</div>
		</div>
	);
};

export default SignUp;
