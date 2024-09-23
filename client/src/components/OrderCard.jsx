import { countries } from "countries-list";
import {
	deleteObject,
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable,
} from "firebase/storage";
import { Alert, Button, FileInput, Textarea } from "flowbite-react";
import { useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import { MdCancelPresentation, MdEmail } from "react-icons/md";
import { useSelector } from "react-redux";
import Flag from "react-world-flags";
import { app } from "../firebase";
import { Link } from "react-router-dom";

const OrderCard = ({ order, orderUpdated }) => {
	const { currentUser } = useSelector((state) => state.user);
	const [file, setFile] = useState(null);
	const [audioUploading, setAudioUploading] = useState(false);
	const [audioUrl, setAudioUrl] = useState(order.audioFile);

	const [status, setStatus] = useState(order.status);
	const [rejectMessage, setRejectMessage] = useState(order.rejectMessage);
	const [speakerMessage, setSpeakerMessage] = useState(order.speakerMessage);
	const [errorMsg, setErrorMsg] = useState(null);

	const [prevUrlData, setPrevUrlData] = useState([]);

	const getCountryCodeFromName = (countryName) => {
		for (const [code, { name }] of Object.entries(countries)) {
			if (name.toLowerCase() === countryName.toLowerCase()) {
				return code; // Return the country code if a match is found
			}
		}
		return null;
	};

	const handleUploadAudio = async () => {
		setErrorMsg(null);
		if (!file) return setErrorMsg("Seleccione un archivo");
		setAudioUploading(true);

		// Initialize Firebase storage
		const storage = getStorage(app);
		const fileName = new Date().getTime() + file.name;
		const storageRef = ref(storage, fileName);
		const uploadTask = uploadBytesResumable(storageRef, file);

		uploadTask.on(
			"state_changed",
			(snapshot) => {
				// Track the upload progress
				const progress =
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				console.log(`Upload is ${progress}% done`);
			},
			(error) => {
				console.error("Upload failed:", error);
				setAudioUploading(false);
				setErrorMsg(error.message);
			},
			async () => {
				// Handle successful uploads
				const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
				console.log("File available at", downloadURL);
				if (audioUrl) {
					setPrevUrlData([...prevUrlData, audioUrl]);
				}
				setAudioUrl(downloadURL);
				setAudioUploading(false);
			}
		);
	};

	const handleFileUpload = async (orderId, statuss) => {
		// Update the order in your backend with the file URL and status
		setErrorMsg(null);
		try {
			const response = await fetch(
				`/api/order/status?orderId=${orderId}&status=${statuss}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						audioFile: audioUrl,
						rejectMessage:
							rejectMessage === order.rejectMessage ? null : rejectMessage,
						speakerMessage:
							speakerMessage === order.speakerMessage ? null : speakerMessage,
					}),
				}
			);

			if (response.ok) {
				console.log("Order updated successfully");
				prevUrlData.map((item, index) => deleteFileByUrl(item));
				setAudioUrl(null);
				orderUpdated({
					orderId,
					status: statuss,
					audioFile: audioUrl,
					rejectMessage,
					speakerMessage,
				});
			} else {
				console.error("Failed to update order");
			}
		} catch (error) {
			console.log(error);
			setErrorMsg(error.message);
		}
	};

	return (
		<>
			{currentUser._id === order.speakerId.userId._id && (
				<div className="lg:min-w-80 lg:max-w-80 flex flex-col gap-1 p-5 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[20px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<span className="text-xl lg:text-2xl text-center mb-3">
					Información del cliente
					</span>
					<div className="flex items-center gap-3">
						<img
							src={order.userId.profilePicture}
							alt="profile pic"
							className="w-10 h-10 object-cover rounded-full"
						/>
						<span className="text-lg">{order.userId.name}</span>
					</div>
					<div className="flex items-center gap-3">
						<MdEmail className="w-10 h-10" />
						<span className="">{order.userId.email}</span>
					</div>
					<div className="flex items-center gap-3">
						<Flag
							code={getCountryCodeFromName(order.userContry)}
							className="h-7 w-10 object-cover"
						/>
						<span className="">{order.userContry}</span>
					</div>
				</div>
			)}

			<div className="flex-auto py-3 lg:p-5">
				<div className="border rounded-xl p-2 dark:border-gray-700">
					<div>
						<span className="font-semibold mr-12">Fecha de creación:</span>
						<span>
							{new Date(order.createdAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</span>
					</div>
					<div>
						<span className="font-semibold mr-11">Servicio de pedidos:</span>
						<span>{order.service === "voiceOver" && "Voz en off"}</span>
						<span>{order.service === "womenVoice" && "Debbing de vídeo"}</span>
						<span>
							{order.service === "holdswitch" && "Mensaje en ESPERA/CAMBIAR"}
						</span>
						<span>
							{order.service === "auditoryLogos" && "Logotipos auditivos (Branding)"}
						</span>
					</div>
					<div>
						<span className="font-semibold mr-8">Duración del audio:</span>
						<span>{order.audioDuration === "small" && "10 ~ 20 segundos"}</span>
						<span>{order.audioDuration === "medium" && "30 ~ 40 seconds"}</span>
						<span>{order.audioDuration === "large" && "1 minuto"}</span>
					</div>
					<div>
						<span className="font-semibold mr-4">Monto del pago:</span>
						<span className="font-semibold">$ {order.amount}</span>
					</div>
					<div>
						<span className="font-semibold mr-[53px]">Estado del pedido:</span>
						<span
							className={
								order.status === "Rejected"
									? "text-red-500 font-bold"
									: order.status === "Completed"
									? "text-green-500 font-bold"
									: order.status === "Pending Delivery"
									? "text-yellow-500 font-bold"
									: "font-bold"
							}>
							{order.status}
						</span>
					</div>
					<div className="text-justify">
						<span className="font-bold mr-5">Cita:</span>
						<span className="text-justify">{order.quote}</span>
					</div>
					<div className="text-justify">
						<span className="font-bold mr-6">Especificaciones:</span>
						<span className="text-justify">
							{order.specs ? `${order.specs}` : "Ninguno"}
						</span>
					</div>
				</div>

				{(order.status === "Completed" ||
					order.status === "Rejected" ||
					order.status === "Delivered") && (
					<div className="p-2 rounded-xl mt-2 border dark:border-gray-700">
						{(order.status === "Delivered" || order.status === "Rejected") &&
							order.speakerId.userId._id === currentUser._id && (
								<p className="text-center py-2">
									El cliente recibió este audio. <br />
									Pero puedes actualizar esto si hay algún problema con este archivo.
								</p>
							)}
						{order.status === "Delivered" &&
							order.userId._id === currentUser._id && (
								<p className="text-center py-2">
									Ordene {order.status} y el orador envíe este audio. <br /> Si hay algún problema en el archivo, puede comunicarse con su orador.
								</p>
							)}
						<ReactAudioPlayer
							src={order.audioFile}
							controls
							controlsList={order.status === "Completed" ? "" : "nodownload"}
							className="w-full"
						/>
						{order.status === "Delivered" &&
							order.speakerId.userId._id === currentUser._id && (
								<p className="text-center py-2">
									Orden {order.status}. Esperando que el cliente ACEPTE
								</p>
							)}
						{(order.status === "Delivered" || order.status === "Rejected") &&
							order.userId._id === currentUser._id && (
								<div className="flex flex-col gap-2">
									{order.speakerMessage && (
										<div className="my-2 p-2 border rounded-xl dark:border-gray-700">
											<p className="text-xxs">Mensaje del orador</p>
											<p>{order.speakerMessage}</p>
										</div>
									)}

									{status === "Delivered" && (
										<>
											<p className="text-center my-1">
											Puede descargar el audio anterior después de ACEPTAR
											</p>
											<div className="flex w-full gap-4">
												<Button
													type="button"
													gradientDuoTone="purpleToBlue"
													size="sm"
													outline
													className="focus:ring-1 flex-1"
													onClick={() => {
														handleFileUpload(order._id, "Completed");
													}}>
													Aceptar
												</Button>
												<Button
													type="button"
													gradientDuoTone="purpleToPink"
													size="sm"
													outline
													className="focus:ring-1 flex-1"
													onClick={() => setStatus("Reject")}>
													Rechazar
												</Button>
											</div>
										</>
									)}

									{status === "Reject" && (
										<div className="w-full mt-1">
											<span className="text-sm ml-1">
											Escribir un mensaje para el orador
											</span>

											<Textarea
												className="mb-2 mt-1 w-full"
												rows="2"
												value={rejectMessage}
												placeholder="Escriba el motivo del rechazo...."
												onChange={(e) => setRejectMessage(e.target.value)}
												disabled={audioUploading}
											/>
											<div className="flex gap-2">
												<Button
													type="submit"
													gradientDuoTone="purpleToPink"
													size="sm"
													outline
													disabled={!rejectMessage}
													className="focus:ring-1 w-full"
													onClick={() => {
														handleFileUpload(order._id, "Rejected");
														setStatus("Rejected");
													}}>
													ENVIAR
												</Button>
												<Button
													type="button"
													gradientDuoTone="purpleToPink"
													size="sm"
													outline
													className="focus:ring-1 w-full"
													onClick={() => setStatus(order.status)}>
													CANCELAR
												</Button>
											</div>
										</div>
									)}
									{order.status === "Rejected" && (
										<p className="text-center py-2">
											Orden {order.status}. Esperando que el altavoz envíe otro audio.
										</p>
									)}
								</div>
							)}
						{order.status === "Rejected" &&
							order.speakerId.userId._id === currentUser._id &&
							order.rejectMessage && (
								<div className="my-2 p-2 border rounded-xl dark:border-gray-700">
									<p className="text-xxs">Mensaje del cliente</p>
									<p>{order.rejectMessage}</p>
								</div>
							)}
					</div>
				)}

				{order.speakerId.userId._id === currentUser._id &&
					(order.status === "Rejected" ||
						order.status === "Delivered" ||
						order.status === "Pending Delivery") && (
						<div className="flex flex-col w-full gap-3 mt-4 border rounded-xl p-2 dark:border-gray-700">
							<div className="flex justify-between gap-10">
								<FileInput
									type="file"
									accept="audio/mp3"
									onChange={(e) => setFile(e.target.files[0])}
									className="flex-grow"
								/>
								<Button
									type="button"
									gradientDuoTone="purpleToBlue"
									size="sm"
									outline
									className="focus:ring-1"
									onClick={handleUploadAudio}
									disabled={audioUploading}>
									{audioUploading ? "Subiendo... Espere por favor!" : "Subir"}
								</Button>
							</div>
							{audioUrl &&
								(order.status === "Pending Delivery" ||
									order.status === "Rejected") && (
									<div className="flex flex-col gap-2">
										<div className="flex justify-between px-3 py-1 items-center">
											<ReactAudioPlayer
												src={audioUrl}
												controls
												className="w-full"
											/>
											<button
												disabled={audioUploading}
												type="button"
												onClick={() => setAudioUrl(null)}
												className="px-3 text-red-700 rounded-lg uppercase hover:opacity-75">
												Borrar
											</button>
										</div>
										<div>
											<span className="text-sm">
											Escribe un mensaje para el cliente (opcional)
											</span>
											<Textarea
												className="mb-2 mt-1"
												rows="2"
												value={speakerMessage}
												placeholder="Escribe algo a los clientes...."
												onChange={(e) => setSpeakerMessage(e.target.value)}
												disabled={audioUploading}
											/>
										</div>
									</div>
								)}
							<Button
								type="button"
								gradientDuoTone="purpleToPink"
								size="sm"
								outline
								className="focus:ring-1 w-full sm:w-auto uppercase"
								onClick={() => {
									handleFileUpload(order._id, "Delivered");
								}}
								disabled={audioUploading || !audioUrl}>
								{order.status === "Delivered" ? "Actualizar" : "Confirmar"}
							</Button>
						</div>
					)}
				{order.status === "Completed" && (
					<div className="w-full flex items-center justify-center bg-green-600 my-2 rounded-full p-1">
						<span className="text-3xl text-center text-green-200 self-center">
						PEDIDO COMPLETADO
						</span>
					</div>
				)}
			</div>
			{errorMsg && (
				<Alert className="flex-auto" color="failure" withBorderAccent>
					<div className="flex justify-between">
						<span dangerouslySetInnerHTML={{ __html: errorMsg }} />
						<span className="w-5 h-5">
							<MdCancelPresentation
								className="cursor-pointer w-6 h-6"
								onClick={() => setErrorMsg(null)}
							/>
						</span>
					</div>
				</Alert>
			)}

			{currentUser._id === order.userId._id && (
				<div className="lg:min-w-80 lg:max-w-80 flex flex-col gap-1 p-5 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[20px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<span className="text-2xl text-center mb-3">
						<Link to={`/speaker/${order.speakerId._id}`}>
						Información del orador
						</Link>
					</span>
					<div className="flex items-center gap-3">
						<Link to={`/speaker/${order.speakerId._id}`}>
							<img
								src={order.speakerId.userId.profilePicture}
								alt="profile pic"
								className="w-10 h-10 object-cover rounded-full"
							/>
						</Link>
						<span className="text-lg flex">
							<Link to={`/speaker/${order.speakerId._id}`}>
								{order.speakerId.userId.name}
							</Link>
							{order.speakerId.userId.isPremium && (
								<img
									className="w-7 h-7 ml-1"
									src="../../icons8-blue-tick.svg"
									alt="Premium"
								/>
							)}
						</span>
					</div>
					<div className="flex items-center gap-3">
						<MdEmail className="w-10 h-10" />
						<span className="">{order.speakerId.userId.email}</span>
					</div>
					<div className="flex items-center gap-3">
						<Flag
							code={getCountryCodeFromName(order.speakerId.country)}
							className="h-7 w-10 object-cover"
						/>
						<span className="">{order.speakerId.country}</span>
					</div>
				</div>
			)}
		</>
	);
};

export default OrderCard;

// Function to delete a file using its URL
const deleteFileByUrl = async (fileUrl) => {
	const storage = getStorage();

	try {
		// Extract the file path from the URL
		const startIndex = fileUrl.indexOf("/o/") + 3;
		const endIndex = fileUrl.indexOf("?alt=media");

		const filePath = decodeURIComponent(
			fileUrl.substring(startIndex, endIndex)
		);

		// Create a reference to the file to delete
		const fileRef = ref(storage, filePath);

		// Delete the file
		await deleteObject(fileRef);
		console.log("File deleted successfully");
	} catch (error) {
		console.error("Error deleting file:", error.message);
	}
};
