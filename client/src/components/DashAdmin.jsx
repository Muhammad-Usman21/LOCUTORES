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
	Table,
	TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { MdCancelPresentation } from "react-icons/md";
import ReactPlayer from "react-player";
import { Link } from "react-router-dom";
import { app } from "../firebase";
import { useSelector } from "react-redux";

const DashAdmin = () => {
	const [formData, setFormData] = useState({
		recommended: [],
		pdfs: [],
	});
	const [speakers, setSpeakers] = useState([]);
	const [showMore, setShowMore] = useState(true);
	const [addRemoveError, setAddRemoveError] = useState(null);
	const [updatedMsg, setUpdatedMsg] = useState(null);
	const [updatedError, setUpdatedError] = useState(null);
	const [pdfFile, setPdfFile] = useState(null);
	const [pdfUploadErrorMsg, setPdfUploadErrorMsg] = useState(null);
	const [pdfUploading, setPdfUploading] = useState(false);
	const [prevUrlData, setPrevUrlData] = useState([]);
	const { currentUser } = useSelector((state) => state.user);
	const [users, setUsers] = useState([]);
	const [showMoreUsers, setShowMoreUsers] = useState(true);
	const [freePremiumError, setFreePremiumError] = useState(null);

	console.log(formData);

	useEffect(() => {
		const fetchStorage = async () => {
			try {
				const response = await fetch("/api/storage/get-storage");
				const data = await response.json();
				setFormData(data);
			} catch (error) {
				console.log(error.message);
			}
		};

		fetchStorage();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setUpdatedMsg(null);
		setUpdatedError(null);
		try {
			if (!formData.found) {
				console.log(formData.found);
				const res = await fetch(`/api/storage/create-storage`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				});
				const data = await res.json();
				if (!res.ok) {
					console.log(data.message);
				} else {
					setFormData(data);
					prevUrlData.map((item, index) => deleteFileByUrl(item));
					return setUpdatedMsg("Actualizado exitosamente");
				}
			}
			if (formData.found) {
				const res = await fetch(`/api/storage/update-storage`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				});
				const data = await res.json();
				if (!res.ok) {
					console.log(data.message);
				} else {
					setFormData(data);
					prevUrlData.map((item, index) => deleteFileByUrl(item));
					return setUpdatedMsg("Actualizado exitosamente");
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		fetchSpeaker();
	}, []);

	const fetchSpeaker = async () => {
		// console.log(voiceType, country);
		try {
			const response = await fetch(
				`/api/speaker/getspeakers?&sort=${"desc"}&limit=10`
			);
			const data = await response.json();
			// console.log(data);
			setSpeakers(data);
			if (data.length < 10) {
				setShowMore(false);
			}
		} catch (error) {
			console.error("Failed to fetch speaker", error);
		}
	};

	const handleShowMore = async () => {
		try {
			const startIndex = speakers.length;
			const response = await fetch(
				`/api/speaker/getspeakers?startIndex=${startIndex}&sort=${"desc"}&limit=10`
			);
			const data = await response.json();
			// console.log(data);
			if (data.length < 10) {
				setShowMore(false);
			}
			setSpeakers([...speakers, ...data]);
		} catch (error) {
			console.error("Failed to fetch speaker", error);
		}
	};

	const handleAddSpeaker = (speakerId) => {
		if (formData.recommended?.length === 6) {
			return setAddRemoveError(
				"Puedes agregar hasta 6 parlantes a los recomendados."
			);
		}
		setFormData({
			...formData,
			recommended: [...formData.recommended, speakerId],
		});
	};
	const handleRemoveSpeaker = (speakerId) => {
		setFormData({
			...formData,
			recommended: formData.recommended.filter((id, index) => id !== speakerId),
		});
	};

	const handleUploadPdf = async () => {
		setPdfUploadErrorMsg(null);
		setPdfUploading(true);
		try {
			if (!pdfFile || pdfFile.length === 0) {
				setPdfUploadErrorMsg("Seleccione un archivo PDF.");
				setPdfUploading(false);
				return;
			}
			if (pdfFile.length + formData.pdfs?.length > 6) {
				setPdfUploadErrorMsg("Puede cargar hasta 6 archivos PDF");
				setPdfUploading(false);
				return;
			}

			for (let i = 0; i < pdfFile.length; i++) {
				if (pdfFile[i].size >= 20 * 1024 * 1024) {
					setPdfUploadErrorMsg(
						"El tamaño del archivo PDF debe ser inferior a 20 MB."
					);
					setPdfUploading(false);
					return;
				}
			}

			const promises = [];

			for (let i = 0; i < pdfFile.length; i++) {
				promises.push(storePdf(pdfFile[i]));
			}

			Promise.all(promises)
				.then((urls) => {
					setFormData({
						...formData,
						pdfs: formData.pdfs.concat(urls),
					});
					setPdfUploadErrorMsg(null);
					setPdfUploading(false);
				})
				.catch((err) => {
					setPdfUploadErrorMsg(err);
					setPdfUploading(false);
				});
		} catch (error) {
			setPdfUploadErrorMsg(error.message);
			setPdfUploading(false);
		}
	};

	const storePdf = async (pdf) => {
		return new Promise((resolve, reject) => {
			const storage = getStorage(app);
			const fileName = new Date().getTime() + pdf.name;
			const stoageRef = ref(storage, fileName);
			const metadata = {
				customMetadata: {
					uid: currentUser.firebaseId,
				},
			};
			const uploadTask = uploadBytesResumable(stoageRef, pdf, metadata);
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

	const handleRemovePdf = (index, url) => {
		setFormData({
			...formData,
			pdfs: formData.pdfs.filter((x, i) => i !== index),
		});
		setPrevUrlData([...prevUrlData, url]);
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		// console.log(voiceType, country);
		try {
			const response = await fetch(
				`/api/user/getusers?&sort=${"desc"}&limit=10`
			);
			const data = await response.json();
			// console.log(data);
			setUsers(data.users);
			if (data.users.length < 10) {
				setShowMoreUsers(false);
			}
		} catch (error) {
			console.error("Failed to fetch speaker", error);
		}
	};

	const handleShowMoreUsers = async () => {
		try {
			const startIndex = speakers.length;
			const response = await fetch(
				`/api/user/getusers?startIndex=${startIndex}&sort=${"desc"}&limit=10`
			);
			const data = await response.json();
			// console.log(data);
			if (data.users.length < 10) {
				setShowMoreUsers(false);
			}
			setUsers([...users, ...data.users]);
		} catch (error) {
			console.error("Failed to fetch speaker", error);
		}
	};

	const handlePremiumUser = async (userId) => {
		try {
			const res = await fetch(`/api/user/makePremium/${userId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (res.ok) {
				setUsers((prevUsers) =>
					prevUsers.map((user) =>
						user._id === userId ? { ...user, isPremium: true } : user
					)
				);
			}
		} catch (error) {
			console.log(error.message);
		}
	};
	const handleFreeUser = async (userId) => {
		try {
			const res = await fetch(`/api/user/makeFree/${userId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (res.ok) {
				setUsers((prevUsers) =>
					prevUsers.map((user) =>
						user._id === userId ? { ...user, isPremium: false } : user
					)
				);
			}
		} catch (error) {
			console.log(error.message);
		}
	};

	return (
		<div
			className="w-full bg-cover bg-center
			bg-[url('../../bg-light.jpg')] dark:bg-[url('../../bg2-dark.jpg')]">
			<div
				className="max-w-6xl my-5 sm:my-10 mx-3 p-3 sm:mx-12 lg:mx-auto sm:p-10 self-center dark:shadow-whiteLg
			bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[20px] rounded-lg shadow-xl">
				<h2 className="self-center text-2xl text-center font-semibold">
					Sólo para administrador
				</h2>
				<form className="my-10 flex flex-col gap-10" onSubmit={handleSubmit}>
					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[20px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<Label
							value="Enlace de Youtube para el vídeo de la página de inicio."
							className="text-center"
						/>
						<div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
							<TextInput
								className="flex-grow w-full"
								type="text"
								placeholder="Youtube Link"
								onChange={(e) =>
									setFormData({ ...formData, youtubeLink: e.target.value })
								}
								value={formData.youtubeLink}
							/>
						</div>
						{formData.youtubeLink && (
							<div className=" max-w-3xl self-center video-wrapper-form h-[180px] sm:h-[270px] md:h-[260px] lg:h-[370px] w-full">
								<ReactPlayer
									url={formData.youtubeLink}
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
					</div>
					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[20px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<Label
							value="Seleccione hasta 6 oradores para recomendar en la página de inicio"
							className="text-center"
						/>
						{speakers.length > 0 && (
							<>
								<div
									className="overflow-x-scroll p-4 xl:overflow-visible md:max-w-md lg:max-w-5xl w-full mx-auto
					scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300
					 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500 dark:shadow-whiteLg
					 bg-transparent border-2 border-white/40 dark:border-white/20 rounded-lg shadow-xl">
									<Table
										hoverable
										className="backdrop-blur-[20px] bg-transparent border-2 border-white/20 
							rounded-lg shadow-lg dark:shadow-whiteLg">
										<Table.Head className=" xl:sticky xl:top-[60px] z-10">
											<Table.HeadCell>Imagen del orador</Table.HeadCell>
											<Table.HeadCell>Nombre del orador</Table.HeadCell>
											<Table.HeadCell>
												Correo electrónico del orador
											</Table.HeadCell>
											<Table.HeadCell>Agregar/Quitar</Table.HeadCell>
										</Table.Head>
										<Table.Body>
											{speakers.map((speaker) => (
												<Table.Row
													key={speaker._id}
													className="border border-gray-400">
													<Table.Cell>
														<img
															src={speaker.image}
															alt="image"
															className="w-20 h-10 object-cover bg-gray-500"
														/>
													</Table.Cell>
													<Table.Cell>
														<Link to={`/speaker/${speaker._id}`}>
															<div className="flex gap-1 items-center">
																<span
																	className={`text-gray-900 dark:text-gray-300`}>
																	{speaker.userId.name}
																</span>
																{speaker.userId.isPremium && (
																	<img
																		className="w-7 h-7 ml-1"
																		src="../../icons8-blue-tick.svg"
																		alt="Premium"
																	/>
																)}
															</div>
														</Link>
													</Table.Cell>
													<Table.Cell>
														<Link to={`/speaker/${speaker._id}`}>
															<span
																className={`text-gray-900 dark:text-gray-300`}>
																{speaker.userId.email}
															</span>
														</Link>
													</Table.Cell>
													<Table.Cell>
														{formData.recommended?.includes(speaker._id) ? (
															<Button
																onClick={() => handleRemoveSpeaker(speaker._id)}
																size="sm"
																type="button"
																outline
																gradientDuoTone="purpleToPink"
																className="focus:ring-1 w-20">
																Eliminar
															</Button>
														) : (
															<Button
																onClick={() => handleAddSpeaker(speaker._id)}
																size="sm"
																outline
																type="button"
																gradientDuoTone="purpleToBlue"
																className="focus:ring-1 w-20">
																Agregar
															</Button>
														)}
													</Table.Cell>
												</Table.Row>
											))}
										</Table.Body>
									</Table>
									{showMore && (
										<div className="flex w-full">
											<button
												type="button"
												onClick={handleShowMore}
												className="text-teal-400 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500 mx-auto text-sm py-4">
												Mostrar más
											</button>
										</div>
									)}
								</div>
								{addRemoveError && (
									<Alert className="flex-auto" color="failure" withBorderAccent>
										<div className="flex justify-between">
											<span>{addRemoveError}</span>
											<span className="w-5 h-5">
												<MdCancelPresentation
													className="cursor-pointer w-6 h-6"
													onClick={() => setAddRemoveError(null)}
												/>
											</span>
										</div>
									</Alert>
								)}
							</>
						)}
					</div>

					{/* <div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<Label value="Upload PDFs" />
						<div className="flex flex-col mb-4 sm:flex-row gap-4 items-center justify-between">
							<FileInput
								type="file"
								accept="application/pdf" // Accepts only PDF files
								onChange={(e) => setPdfFile(e.target.files)} // Handles file selection
								className="w-full sm:w-auto"
								multiple
								disabled={pdfUploading}
							/>
							<Button
								type="button"
								gradientDuoTone="purpleToBlue"
								size="sm"
								outline
								className="focus:ring-1 w-full sm:w-auto"
								onClick={handleUploadPdf}
								disabled={pdfUploading}>
								{pdfUploading ? "Uploading... Please Wait!" : "Upload PDFs"}
							</Button>
						</div>
						{pdfUploadErrorMsg && (
							<Alert className="flex-auto" color="failure" withBorderAccent>
								<div className="flex justify-between">
									<span
										dangerouslySetInnerHTML={{ __html: pdfUploadErrorMsg }}
									/>
									<span className="w-5 h-5">
										<MdCancelPresentation
											className="cursor-pointer w-6 h-6"
											onClick={() => setPdfUploadErrorMsg(null)}
										/>
									</span>
								</div>
							</Alert>
						)}
						{formData.pdfs?.length > 0 &&
							formData.pdfs.map((url, index) => (
								<div
									key={url}
									className="flex flex-col justify-between p-3 my-2 border items-center gap-1">
									<iframe
										src={url}
										width="100%"
										title="PDF Viewer"
										className="h-[400px] md:h-[600px]"></iframe>
									<button
										disabled={pdfUploading}
										type="button"
										onClick={() => handleRemovePdf(index, url)}
										className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75">
										Delete
									</button>
								</div>
							))}
					</div> */}
					<Button
						type="submit"
						gradientDuoTone="purpleToPink"
						outline
						className="focus:ring-1 uppercase">
						Confirmar
					</Button>
				</form>
				{updatedMsg && (
					<Alert className="flex-auto" color="success" withBorderAccent>
						<div className="flex justify-between">
							<span>{updatedMsg}</span>
							<span className="w-5 h-5">
								<MdCancelPresentation
									className="cursor-pointer w-6 h-6"
									onClick={() => setUpdatedMsg(null)}
								/>
							</span>
						</div>
					</Alert>
				)}
			</div>
			<div
				className="max-w-6xl my-5 sm:my-10 mx-3 p-3 sm:mx-12 lg:mx-auto sm:p-10 self-center dark:shadow-whiteLg flex flex-col gap-5
			bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[20px] rounded-lg shadow-xl">
				<Label
					value="Seleccione Usuarios para hacerlos Premium o Gratis"
					className="text-center"
				/>
				{users.length > 0 && (
					<>
						<div
							className="overflow-x-scroll p-4 xl:overflow-visible md:max-w-md lg:max-w-5xl w-full mx-auto
					scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300
					 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500 dark:shadow-whiteLg
					 bg-transparent border-2 border-white/40 dark:border-white/20 rounded-lg shadow-xl">
							<Table
								hoverable
								className="backdrop-blur-[20px] bg-transparent border-2 border-white/20 
							rounded-lg shadow-lg dark:shadow-whiteLg">
								<Table.Head className=" xl:sticky xl:top-[60px] z-10">
									<Table.HeadCell>Imagen de usuario</Table.HeadCell>
									<Table.HeadCell>Nombre de usuario</Table.HeadCell>
									<Table.HeadCell>
										Correo electrónico del usuario
									</Table.HeadCell>
									<Table.HeadCell>Gratis/Premium</Table.HeadCell>
								</Table.Head>
								<Table.Body>
									{users.map((user) => (
										<Table.Row
											key={user._id}
											className="border border-gray-400">
											<Table.Cell>
												<img
													src={user.profilePicture}
													alt="image"
													className="w-10 h-10 object-cover bg-gray-500 rounded-full"
												/>
											</Table.Cell>
											<Table.Cell>
												{/* <Link to={`/speaker/${speaker._id}`}> */}
												<div className="flex gap-1 items-center">
													<span className={`text-gray-900 dark:text-gray-300`}>
														{user.name}
													</span>
													{user.isPremium && (
														<img
															className="w-7 h-7 ml-1"
															src="../../icons8-blue-tick.svg"
															alt="Premium"
														/>
													)}
												</div>
												{/* </Link> */}
											</Table.Cell>
											<Table.Cell>
												{/* <Link to={`/speaker/${speaker._id}`}> */}
												<span className={`text-gray-900 dark:text-gray-300`}>
													{user.email}
												</span>
												{/* </Link> */}
											</Table.Cell>
											<Table.Cell>
												{!user.isPremium ? (
													<Button
														onClick={() => handlePremiumUser(user._id)}
														size="sm"
														type="button"
														outline
														gradientDuoTone="purpleToPink"
														className="focus:ring-1 w-36">
														Hacer prima
													</Button>
												) : (
													<Button
														onClick={() => handleFreeUser(user._id)}
														size="sm"
														outline
														type="button"
														gradientDuoTone="purpleToBlue"
														className="focus:ring-1 w-36">
														Hacer gratis
													</Button>
												)}
											</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table>
							{showMoreUsers && (
								<div className="flex w-full">
									<button
										type="button"
										onClick={handleShowMoreUsers}
										className="text-teal-400 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500 mx-auto text-sm py-4">
										Mostrar más
									</button>
								</div>
							)}
						</div>
						{freePremiumError && (
							<Alert className="flex-auto" color="failure" withBorderAccent>
								<div className="flex justify-between">
									<span>{freePremiumError}</span>
									<span className="w-5 h-5">
										<MdCancelPresentation
											className="cursor-pointer w-6 h-6"
											onClick={() => setFreePremiumError(null)}
										/>
									</span>
								</div>
							</Alert>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default DashAdmin;

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
