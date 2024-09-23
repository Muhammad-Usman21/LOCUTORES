import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserSuccess } from "../redux/user/userSlice";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "flowbite-react";

const Premium = ({ updateUser }) => {
	const dispatch = useDispatch();
	const { currentUser } = useSelector((state) => state.user);

	useEffect(() => {
		const updateUserFunc = async () => {
			if (updateUser) {
				const response = await fetch(`/api/user/getuser/${currentUser._id}`);
				const data = await response.json();
				dispatch(updateUserSuccess(data));
			}
		};
		updateUserFunc();
	}, [updateUser]);

	const handlePremium = async () => {
		const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
		console.log(stripe);
		const response = await fetch(
			`/api/user/subscribe?userId=${currentUser._id}`
		);
		const session = await response.json();
		const result = stripe.redirectToCheckout({ sessionId: session.id });
		if (result.error) {
			console.error(result.error.message);
		}
	};

	return (
		<div className="w-full bg-cover bg-center">
			<div
				className="max-w-3xl my-3 sm:my-10 mx-3 p-3 sm:mx-12 lg:mx-auto sm:p-10 self-center dark:shadow-whiteLg items-center justify-center flex flex-col
			bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[20px] rounded-lg shadow-xl">
				<h1 className="text-2xl font-semibold">Comprar Premium</h1>
				<h2>Para Speakers</h2>
				<div className="flex flex-col text-justify mt-10 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[20px] rounded-lg shadow-xl p-4 dark:shadow-whiteLg">
					<h2 className="text-xl font-semibold">Plan Gratuito</h2>
					<p>Nuestro Plan Gratuito proporciona todo lo que necesitas para comenzar:</p>
					<p className="mt-2">
						<span className="font-semibold">Subida de Enlaces de YouTube:</span>
						<span>
							{" "}
							Puedes subir{" "}
							<span className="font-semibold">1 enlace de YouTube</span> para mostrar tu
							mejor contenido.
						</span>
					</p>
					<p>
						<span className="font-semibold">Subida de Archivos de Audio:</span>
						<span>
							{" "}
							Puedes subir hasta{" "}
							<span className="font-semibold">4 archivos de audio</span> para mostrar tu
							trabajo.
						</span>
					</p>
					<p className="mt-2">
						Este plan es perfecto para aquellos que están comenzando su viaje
						y quieren probar sin ningún costo.
					</p>
				</div>
				<div className="flex flex-col text-justify mt-6 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[20px] rounded-lg shadow-xl p-4 dark:shadow-whiteLg">
					<h2 className="text-xl font-semibold">Actualizar a Premium</h2>
					<p>
						Para aquellos que necesitan más espacio y flexibilidad, nuestro Plan Premium
						ofrece características mejoradas:
					</p>
					<p className="mt-2">
						<span className="font-semibold">Más Enlaces de YouTube:</span>
						<span>
							{" "}
							Puedes subir hasta{" "}
							<span className="font-semibold">10 enlaces de YouTube</span> para mostrar
							una gama más amplia de tu contenido.
						</span>
					</p>
					<p>
						<span className="font-semibold">Subidas de Audio Extendidas: </span>
						<span>
							{" "}
							Sube hasta <span className="font-semibold">15 archivos de audio</span>
							, lo que te permite presentar un portafolio más completo.
						</span>
					</p>
					<p className="mt-2">
						El Plan Premium está disponible por solo{" "}
						<span className="font-bold">${import.meta.env.VITE_PREMIUM_AMOUNT}</span>. Esta actualización está diseñada para
						darte la libertad de expandir tu perfil y mostrar más de tus talentos.
					</p>
					<p className="mt-2">
						¿Listo para desbloquear estas características adicionales?{" "}
						<span className="font-semibold">¡Actualiza a Premium</span> hoy y lleva tu cuenta al siguiente nivel!
					</p>
					<Button
						onClick={handlePremium}
						type="button"
						gradientDuoTone="purpleToPink"
						outline
						disabled={currentUser.isPremium}
						className="uppercase focus:ring-1 mt-6 w-full">
						Premium en ${import.meta.env.VITE_PREMIUM_AMOUNT}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Premium;
