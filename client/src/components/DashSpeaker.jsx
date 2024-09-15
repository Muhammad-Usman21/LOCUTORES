import {
	deleteObject,
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable,
} from "firebase/storage";
import {
	Alert,
	Button,
	FileInput,
	Label,
	Select,
	Spinner,
	Textarea,
	TextInput,
} from "flowbite-react";
import { useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import { MdCancelPresentation } from "react-icons/md";
import { useSelector } from "react-redux";
import { app } from "../firebase";
import { countries } from "countries-list";
import ReactPlayer from "react-player";
import ReactAudioPlayer from "react-audio-player";
import { updateUserSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";

const DashSpeaker = ({ stripeAccountId }) => {
	const [file, setFile] = useState(null);
	const [imageUploadProgress, setImageUploadProgress] = useState(null);
	const [imageUploadErrorMsg, setImageUploadErrorMsg] = useState(null);
	const [speakerErrorMsg, setSpeakerErrorMsg] = useState(null);
	const [imageUploading, setImageUploading] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		demos: [],
		videos: [],
		prices: {},
		stripeAccountId,
	});
	const { theme } = useSelector((state) => state.theme);
	const [audioFile, setAudioFile] = useState(null);
	const [audioUploadErrorMsg, setAudioUploadErrorMsg] = useState(null);
	const [audioUploading, setAudioUploading] = useState(false);
	const { currentUser } = useSelector((state) => state.user);
	const dispatch = useDispatch();
	const natigate = useNavigate();
	const [ytLink, setYTLink] = useState("");
	const [videosErrorMsg, setVideosErrorMsg] = useState(null);
	const [keywords, setKeywords] = useState("");

	const [prevUrlData, setPrevUrlData] = useState([]);

	const countryOptions = Object.values(countries).map(
		(country) => country.name
	);

	const handleUploadImage = async () => {
		setImageUploadErrorMsg(null);
		setImageUploading(true);
		try {
			if (!file) {
				setImageUploading(false);
				setImageUploadErrorMsg("¡Seleccione una imagen!");
				return;
			}
			if (!file.type.includes("image/")) {
				setImageUploading(false);
				setImageUploadErrorMsg(
					"El tipo de archivo no es imagen.\n¡Seleccione un archivo de imagen!"
				);
				return;
			}
			if (file.size >= 5 * 1024 * 1024) {
				setImageUploading(false);
				setImageUploadErrorMsg("¡El tamaño de la imagen debe ser inferior a 5 MB!");
				return;
			}

			const storage = getStorage(app);
			const fileName = new Date().getTime() + "-" + file.name;
			const storgeRef = ref(storage, fileName);
			const metadata = {
				customMetadata: {
					uid: currentUser.firebaseId,
				},
			};
			const uploadTask = uploadBytesResumable(storgeRef, file, metadata);
			uploadTask.on(
				"state_changed",
				(snapshot) => {
					const progress =
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					setImageUploadProgress(progress.toFixed(0));
				},
				(error) => {
					setImageUploading(false);
					setImageUploadProgress(null);
					setImageUploadErrorMsg("Error al cargar la imagen. Intentar otra vez!");
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
						if (formData.image) {
							setPrevUrlData([...prevUrlData, formData.image]);
						}
						setImageUploadProgress(null);
						setFormData({ ...formData, image: downloadURL });
						setImageUploading(false);
					});
				}
			);
		} catch (error) {
			setImageUploadErrorMsg("Error al cargar la imagen. ¡Intentar otra vez!");
			setImageUploading(false);
		}
	};

	const handleUploadAudio = async () => {
		setAudioUploadErrorMsg(null);
		setAudioUploading(true);
		try {
			if (!audioFile || audioFile.length === 0) {
				setAudioUploadErrorMsg("Seleccione un archivo de audio.");
				setAudioUploading(false);
				return;
			}
			if (!audioFile || audioFile.length > 1) {
				setAudioUploadErrorMsg("Seleccione solo 1 archivo de audio.");
				setAudioUploading(false);
				return;
			}
			if (
				!currentUser.isPremium &&
				audioFile.length + formData.demos.length > 4
			) {
				setAudioUploadErrorMsg(
					"Actualmente estás usando un plan gratuito, por lo que puedes cargar hasta 4 archivos de audio.<br />Prueba la cuenta PREMIUM para cargar hasta 15 archivos de audio."
				);
				setAudioUploading(false);
				return;
			}
			if (
				currentUser.isPremium &&
				audioFile.length + formData.demos.length > 15
			) {
				setAudioUploadErrorMsg("Puedes subir solo 15 archivos de audio.");
				setAudioUploading(false);
				return;
			}

			for (let i = 0; i < audioFile.length; i++) {
				if (audioFile[i].size >= 20 * 1024 * 1024) {
					setAudioUploadErrorMsg("El tamaño del archivo de audio debe ser inferior a 20 MB.");
					setAudioUploading(false);
					return;
				}
			}

			const promises = [];

			for (let i = 0; i < audioFile.length; i++) {
				promises.push(storeAudio(audioFile[i]));
			}

			Promise.all(promises)
				.then((urls) => {
					setFormData({
						...formData,
						demos: [
							...formData.demos,
							{
								keywords: keywords,
								url: urls[0],
							},
						],
					});
					setAudioUploadErrorMsg(null);
					setAudioUploading(false);
					setKeywords("");
				})
				.catch((err) => {
					setAudioUploadErrorMsg("El tamaño del archivo de audio debe ser inferior a 20 MB.");
					setAudioUploading(false);
				});
		} catch (error) {
			setAudioUploadErrorMsg(error.message);
			setAudioUploading(false);
		}
	};

	const storeAudio = async (audio) => {
		return new Promise((resolve, reject) => {
			const storage = getStorage(app);
			const fileName = new Date().getTime() + audio.name;
			const stoageRef = ref(storage, fileName);
			const metadata = {
				customMetadata: {
					uid: currentUser.firebaseId,
				},
			};
			const uploadTask = uploadBytesResumable(stoageRef, audio, metadata);
			uploadTask.on(
				"state_changed",
				(snapshot) => {
					const progress =
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					console.log(`Upload is ${progress}% done`);
				},
				(error) => {
					reject(error);
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then((downlaodURL) => {
						resolve(downlaodURL);
					});
				}
			);
		});
	};

	const handleRemoveAudio = (index, url) => {
		// Create a new array with the item removed
		const updatedDemos = formData.demos.filter((_, i) => i !== index);
		setFormData({
			...formData,
			demos: updatedDemos, // Set the updated demos array
		});
		setPrevUrlData([...prevUrlData, url]); // Store removed URL
	};
	const handleRemoveVideo = (index) => {
		setFormData({
			...formData,
			videos: formData.videos.filter((x, i) => i !== index),
		});
	};

	console.log(formData);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSpeakerErrorMsg(null);
		setLoading(true);

		if (
			!formData.gender ||
			!formData.country ||
			!formData.image ||
			formData.demos.length === 0 ||
			!formData.prices.small ||
			!formData.prices.medium ||
			!formData.prices.large ||
			!formData.stripeAccountId
		) {
			setLoading(false);
			setSpeakerErrorMsg(
				"Solo el enlace de video de Youtube, Acerca de y las redes sociales son opcionales.<br />Todos los demás campos son obligatorios."
			);
			return;
		}

		try {
			const res = await fetch(
				`/api/speaker/create-speaker/${currentUser._id}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				}
			);
			const data = await res.json();
			if (!res.ok) {
				setLoading(false);
				setSpeakerErrorMsg(data.message);
				return;
			} else {
				setLoading(false);
				setSpeakerErrorMsg(null);
				dispatch(updateUserSuccess(data.user));
				prevUrlData.map((item, index) => deleteFileByUrl(item));
				natigate("/");
			}
		} catch (error) {
			setSpeakerErrorMsg(error.message);
			setLoading(false);
		}
	};

	const handleStripeLogin = async () => {
		try {
			const response = await fetch(`/api/auth/signin-stripe?tab=speaker`);
			const result = await response.json();
			window.location.href = result.url;
		} catch (error) {
			console.log(error);
		}
	};

	const handleAddVideos = () => {
		setVideosErrorMsg(null);
		if (ytLink && ytLink !== "") {
			if (!currentUser.isPremium && formData.videos.length === 1) {
				setYTLink("");
				setVideosErrorMsg(
					"Actualmente estás usando un plan gratuito, por lo que solo puedes cargar un enlace de YouTube.<br />Prueba la cuenta PREMIUM para cargar hasta 10 enlaces de YouTube.."
				);
				return;
			}
			if (currentUser.isPremium && formData.videos.length === 10) {
				setYTLink("");
				setVideosErrorMsg("Puedes subir hasta 10 enlaces de Youtube..");
				return;
			}

			setFormData({
				...formData,
				videos: [...formData.videos, ytLink],
			});
			setYTLink("");
		}
	};

	return (
		<div
			className="w-full bg-cover bg-center
			bg-[url('../../bg-light.jpg')] dark:bg-[url('../../bg2-dark.jpg')]">
			<div
				className="max-w-3xl my-10 mx-3 p-3 sm:mx-12 lg:mx-auto sm:p-10 self-center dark:shadow-whiteLg
			bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-xl">
				<h1 className="text-center text-3xl mb-7 font-semibold">
				Crear una cuenta de orador
				</h1>
				<form
					className={`flex py-5 flex-col gap-6 ${theme}`}
					onSubmit={handleSubmit}>
					<Button
						type="button"
						gradientDuoTone=""
						outline
						className="focus:ring-1 my-2"
						disabled={loading || imageUploading || audioUploading}
						onClick={handleStripeLogin}>
						Iniciar sesión con Stripe{" "}
						{formData.stripeAccountId == "" || formData.stripeAccountId == null
							? ""
							: "✅"}
					</Button>
					<div className="flex flex-col gap-4 sm:flex-row justify-around items-center">
						<div className="flex flex-col gap-1">
							<Label value="Selecciona tu género" />
							<Select
								disabled={loading || imageUploading || audioUploading}
								className="w-56"
								required
								onChange={(e) =>
									setFormData({ ...formData, gender: e.target.value })
								}>
								<option value="">Elige género</option>
								<option value="male">Masculino</option>
								<option value="female">Femenino</option>
								<option value="other">Otro</option>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label value="Selecciona tu país" />
							<Select
								disabled={loading || imageUploading || audioUploading}
								className="w-56"
								required
								onChange={(e) =>
									setFormData({ ...formData, country: e.target.value })
								}>
								<option value="">Seleccione un país</option>
								{countryOptions.map((country, index) => (
									<option key={index} value={country}>
										{country}
									</option>
								))}
							</Select>
						</div>
					</div>

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2 dark:shadow-whiteLg">
						<Label value="El enlace de tu vídeo de YouTube (opcional)" />
						<div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
							<TextInput
								className="flex-grow w-full"
								type="text"
								placeholder="Enlace de Youtube"
								onChange={(e) => setYTLink(e.target.value)}
								disabled={loading || imageUploading || audioUploading}
								value={ytLink}
							/>
							<Button
								type="button"
								gradientDuoTone="purpleToBlue"
								size="sm"
								outline
								className="focus:ring-1 w-full sm:w-auto"
								onClick={handleAddVideos}
								disabled={
									imageUploadProgress ||
									loading ||
									imageUploading ||
									audioUploading ||
									!ytLink
								}>
								Agregar
							</Button>
						</div>
						{ytLink && (
							<div className="video-wrapper-form h-[180px] sm:h-[270px] md:h-[260px] lg:h-[370px] w-full">
								<ReactPlayer
									url={ytLink}
									controls
									loop
									config={{
										youtube: {
											playerVars: {
												modestbranding: 1, // Hide the YouTube logo
												rel: 0, // Minimizes related videos
												showinfo: 0, // Hides video title and info (deprecated but still useful in some cases)
												disablekb: 1, // Disables keyboard shortcuts
											},
										},
									}}
									width={"100%"}
									className="react-player-form"
								/>
							</div>
						)}
						{videosErrorMsg && (
							<Alert className="flex-auto" color="failure" withBorderAccent>
								<div className="flex justify-between">
									<span dangerouslySetInnerHTML={{ __html: videosErrorMsg }} />
									<span className="w-5 h-5">
										<MdCancelPresentation
											className="cursor-pointer w-6 h-6"
											onClick={() => setVideosErrorMsg(null)}
										/>
									</span>
								</div>
							</Alert>
						)}
						{formData.videos?.length > 0 &&
							formData.videos.map((url, index) => (
								<div
									key={url}
									className="flex-col md:flex-row justify-between px-2 py-1 items-center gap-1">
									<div className="video-wrapper-form h-[180px] sm:h-[270px] md:h-[260px] lg:h-[370px] w-full">
										<ReactPlayer
											url={url}
											controls
											loop
											config={{
												youtube: {
													playerVars: {
														modestbranding: 1, // Hide the YouTube logo
														rel: 0, // Minimizes related videos
														showinfo: 0, // Hides video title and info (deprecated but still useful in some cases)
														disablekb: 1, // Disables keyboard shortcuts
													},
												},
											}}
											width={"100%"}
											className="react-player-form"
										/>
									</div>
									<div className="flex flex-col md:flex-row justify-between px-3 py-3 border items-center gap-1">
										<Label className="flex-grow">
											<a href={url} target="_blank" rel="noopener noreferrer">
												{url}
											</a>
										</Label>
										<button
											disabled={loading || imageUploading || audioUploading}
											type="button"
											onClick={() => handleRemoveVideo(index)}
											className="px-3 text-red-700 rounded-lg uppercase hover:opacity-75">
											Borrar
										</button>
									</div>
								</div>
							))}
					</div>

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2 dark:shadow-whiteLg">
						<Label value="Upload an image (max size 5 MBs) (required)" />
						<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
							<FileInput
								type="file"
								accept="image/*"
								onChange={(e) => setFile(e.target.files[0])}
								className="w-full sm:w-auto"
								disabled={loading || imageUploading || audioUploading}
							/>
							<Button
								type="button"
								gradientDuoTone="purpleToBlue"
								size="sm"
								outline
								className="focus:ring-1 w-full sm:w-auto"
								onClick={handleUploadImage}
								disabled={
									imageUploadProgress ||
									loading ||
									imageUploading ||
									audioUploading
								}>
								{imageUploadProgress ? (
									<div className="flex items-center">
										<CircularProgressbar
											className="h-5"
											value={imageUploadProgress}
										/>
										<span className="ml-1">Subiendo... Espere por favor!</span>
									</div>
								) : (
									"Subir imagen"
								)}
							</Button>
						</div>
						{imageUploadErrorMsg && (
							<Alert className="flex-auto" color="failure" withBorderAccent>
								<div className="flex justify-between">
									<span>{imageUploadErrorMsg}</span>
									<span className="w-5 h-5">
										<MdCancelPresentation
											className="cursor-pointer w-6 h-6"
											onClick={() => setImageUploadErrorMsg(null)}
										/>
									</span>
								</div>
							</Alert>
						)}
						{formData.image && (
							<img
								src={formData.image}
								alt="upload"
								className="w-full h-auto object-cover border 
								border-gray-500 dark:border-gray-300 mt-4"
							/>
						)}
					</div>

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<Label value="Subir demos (se requiere mínimo 1) " />
						<div className="flex flex-col mb-4 w-full gap-4 items-center justify-between">
							<div className="w-full">
								<TextInput
									type="text"
									placeholder="Escribe diferentes palabras clave para la demostración con espacios."
									id="keywords"
									onChange={(e) => setKeywords(e.target.value)}
									disabled={loading || imageUploading || audioUploading}
									value={keywords}
								/>
							</div>
							<div className="flex flex-col w-full mb-4 sm:flex-row gap-4 items-center justify-between">
								<FileInput
									type="file"
									accept="audio/*" // Accepts only audio files
									onChange={(e) => setAudioFile(e.target.files)} // Handles file selection
									className="w-full sm:w-auto"
									multiple
									disabled={loading || imageUploading || audioUploading}
								/>
								<Button
									type="button"
									gradientDuoTone="purpleToBlue"
									size="sm"
									outline
									className="focus:ring-1 w-full sm:w-auto"
									onClick={handleUploadAudio}
									disabled={
										loading || imageUploading || audioUploading || !keywords
									}>
									{audioUploading
										? "Subiendo... Espere por favor!"
										: "Subir demostraciones"}
								</Button>
							</div>
						</div>
						{audioUploadErrorMsg && (
							<Alert className="flex-auto" color="failure" withBorderAccent>
								<div className="flex justify-between">
									<span
										dangerouslySetInnerHTML={{ __html: audioUploadErrorMsg }}
									/>
									<span className="w-5 h-5">
										<MdCancelPresentation
											className="cursor-pointer w-6 h-6"
											onClick={() => setAudioUploadErrorMsg(null)}
										/>
									</span>
								</div>
							</Alert>
						)}
						{formData.demos &&
							formData.demos.length > 0 &&
							formData.demos.map((demo, index) => (
								<div
									key={index}
									className="flex flex-col px-3 py-1 border gap-1">
									<div className="w-full">
										<Label value={`Palabras clave : ${demo.keywords}`} />
									</div>
									<div className="flex flex-col md:flex-row justify-between px-3 py-1 items-center gap-1">
										{console.log("URL:", demo.url)}
										<ReactAudioPlayer
											src={demo.url}
											controls
											className="w-full"
										/>
										<button
											disabled={loading || imageUploading || audioUploading}
											type="button"
											onClick={() => handleRemoveAudio(index, demo.url)}
											className="px-3 text-red-700 rounded-lg uppercase hover:opacity-75">
											Borrar
										</button>
									</div>
								</div>
							))}
					</div>

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<span className="text-lg text-center my-2">
							{"Tus Precios ("}
							<span className="font-bold">$</span>
							{")"}
						</span>
						<div className="flex flex-col mb-4 gap-4 items-center justify-between">
							<div className="flex gap-2 items-center">
								<Label value="Voz durante 10 a 20 segundos" />
								<TextInput
									className="w-40"
									type="number"
									placeholder="$"
									onChange={(e) =>
										setFormData({
											...formData,
											prices: {
												...formData.prices,
												small: e.target.value,
											},
										})
									}
									required
									min="0"
									disabled={loading || imageUploading || audioUploading}
								/>
							</div>
							<div className="flex gap-2 items-center">
								<Label value="Voz durante 30 - 40 segundos" />
								<TextInput
									className="w-40"
									type="number"
									placeholder="$"
									onChange={(e) =>
										setFormData({
											...formData,
											prices: {
												...formData.prices,
												medium: e.target.value,
											},
										})
									}
									required
									min="0"
									disabled={loading || imageUploading || audioUploading}
								/>
							</div>
							<div className="flex gap-2 items-center lg:pl-11">
								<Label value="Voz durante 1 minuto" />
								<TextInput
									className="w-40"
									type="number"
									placeholder="$"
									onChange={(e) =>
										setFormData({
											...formData,
											prices: {
												...formData.prices,
												large: e.target.value,
											},
										})
									}
									required
									min="0"
									disabled={loading || imageUploading || audioUploading}
								/>
							</div>
						</div>
					</div>

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<span className="text-lg text-center my-2 items-center">
						Acerca de
							<span className="text-sm ml-2">(opcional)</span>
						</span>
						<Textarea
							className="mb-2 mt-1"
							rows="4"
							placeholder="Escribe algo sobre ti...."
							onChange={(e) =>
								setFormData({ ...formData, about: e.target.value })
							}
							disabled={loading || imageUploading || audioUploading}
						/>
					</div>

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<span className="text-lg text-center my-2">
						Redes Sociales (opcional)
						</span>
						<div className="flex flex-col mb-4 gap-4 items-center justify-between">
							<div className="flex sm:flex-row flex-col gap-2 items-center">
								<div className="flex items-center justify-center gap-2">
									{<FaInstagram />}
									<Label value="Instagram"></Label>
								</div>
								<TextInput
									className="w-72"
									type="text"
									placeholder="enlace de instagram"
									value={formData.socialMedia?.instagram || ""}
									onChange={(e) =>
										setFormData({
											...formData,
											socialMedia: {
												...formData.socialMedia,
												instagram: e.target.value,
											},
										})
									}
									disabled={loading || imageUploading || audioUploading}
								/>
							</div>
							<div className="flex sm:flex-row flex-col gap-2 items-center">
								<div className="flex items-center justify-center gap-2">
									<FaFacebook />
									<Label value="Facebook" />
								</div>
								<TextInput
									className="w-72"
									type="text"
									placeholder="enlace de facebook"
									value={formData.socialMedia?.facebook || ""}
									onChange={(e) =>
										setFormData({
											...formData,
											socialMedia: {
												...formData.socialMedia,
												facebook: e.target.value,
											},
										})
									}
									disabled={loading || imageUploading || audioUploading}
								/>
							</div>
							<div className="flex sm:flex-row flex-col gap-2 items-center sm:pl-4">
								<div className="flex items-center justify-center gap-2">
									<FaTwitter />
									<Label value="Twitter" />
								</div>
								<TextInput
									className="w-72"
									type="text"
									placeholder="enlace de twitter"
									value={formData.socialMedia?.twitter || ""}
									onChange={(e) =>
										setFormData({
											...formData,
											socialMedia: {
												...formData.socialMedia,
												twitter: e.target.value,
											},
										})
									}
									disabled={loading || imageUploading || audioUploading}
								/>
							</div>
							<div className="flex sm:flex-row flex-col gap-2 items-center">
								<div className="flex items-center justify-center gap-2">
									<FaWhatsapp />
									<Label value="Whatsapp" />
								</div>
								<TextInput
									className="w-72"
									type="text"
									placeholder="número de whatsapp"
									value={formData.socialMedia?.whatsapp || ""}
									onChange={(e) =>
										setFormData({
											...formData,
											socialMedia: {
												...formData.socialMedia,
												whatsapp: e.target.value,
											},
										})
									}
									disabled={loading || imageUploading || audioUploading}
								/>
							</div>
						</div>
					</div>

					<Button
						type="submit"
						gradientDuoTone="purpleToPink"
						outline
						className="focus:ring-1 uppercase"
						disabled={loading || imageUploading || audioUploading}>
						{loading ? (
							<>
								<Spinner size="sm" />
								<span className="pl-3">Cargando.... Espere por favor!</span>
							</>
						) : (
							"Conviértete en orador"
						)}
					</Button>
				</form>
				{speakerErrorMsg && (
					<Alert className="flex-auto" color="failure" withBorderAccent>
						<div className="flex justify-between">
							<span dangerouslySetInnerHTML={{ __html: speakerErrorMsg }} />
							<span className="w-5 h-5">
								<MdCancelPresentation
									className="cursor-pointer w-6 h-6"
									onClick={() => setSpeakerErrorMsg(null)}
								/>
							</span>
						</div>
					</Alert>
				)}
			</div>
		</div>
	);
};

export default DashSpeaker;

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
