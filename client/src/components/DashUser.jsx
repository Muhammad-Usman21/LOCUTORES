import { Alert, Button, Modal, Spinner, TextInput } from "flowbite-react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
	deleteObject,
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
	updateUserSuccess,
	deleteUserSuccess,
	signOutSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { MdCancelPresentation } from "react-icons/md";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { Link } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const DashUser = () => {
	const { currentUser } = useSelector((state) => state.user);
	const { theme } = useSelector((state) => state.theme);
	const [imageFile, setImageFile] = useState(null);
	const [imageFileUrl, setImageFileUrl] = useState(null);
	const [imageFileUploading, setImageFileUploading] = useState(false);
	const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
	// const [imageFileErrorMsg, setImageFileErrorMsg] = useState(null);
	// const [imageFileSuccessMsg, setImageFileSuccessMsg] = useState(null);
	const [updateUserLoading, setUpdateUserLoading] = useState(false);
	// const [updateUserErrorMsg, setUpdateUserErrorMsg] = useState(null);
	// const [updateUserSuccessMsg, setUpdateUserSuccessMsg] = useState(null);
	// const [deleteUserErrorMsg, setDeleteUserErrorMsg] = useState(null);
	// const [signOutErrorMsg, setSignOutErrorMsg] = useState(null);
	const auth = getAuth(app);
	const filePickerRef = useRef();
	const dispatch = useDispatch();
	const [formData, setFormData] = useState({});
	const [inputPasswordValue, setInputPasswordValue] = useState(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [forgetPassword, setForgetPassword] = useState(false);
	const [changePasswordLoading, setChangePasswordLoading] = useState(false);
	const [myMessages, setMyMessages] = useState({
		updateUserErrorMsg: null,
		updateUserSuccessMsg: null,
		deleteUserErrorMsg: null,
		signOutErrorMsg: null,
		imageFileErrorMsg: null,
		imageFileSuccessMsg: null,
		changePasswordMsg: null,
		changePasswordErrorMsg: null,
	});

	const [prevUrlData, setPrevUrlData] = useState([]);

	const handleImageChange = (e) => {
		setMyMessages((prevMessages) => ({
			...prevMessages,
			imageFileErrorMsg: null,
			imageFileSuccessMsg: null,
			updateUserErrorMsg: null,
			updateUserSuccessMsg: null,
		}));

		const file = e.target.files[0];
		if (file) {
			setImageFile(file);
		}
	};

	// console.log(imageFile, imageFileUrl);
	// console.log(currentUser);

	useEffect(() => {
		if (imageFile) {
			setImageFileUploading(true);
			setImageFileUploadProgress(null);

			if (!imageFile.type.includes("image/")) {
				setImageFile(null);
				setImageFileUploading(false);
				setMyMessages((prevMessages) => ({
					...prevMessages,
					imageFileErrorMsg:
						"El tipo de archivo no es una imagen.\nSeleccione un archivo de imagen..",
				}));
				return;
			}
			if (imageFile.size >= 5 * 1024 * 1024) {
				setImageFile(null);
				setImageFileUploading(false);
				setMyMessages((prevMessages) => ({
					...prevMessages,
					imageFileErrorMsg: "El tamaño de la imagen debe ser inferior a 5 MB.!",
				}));
				return;
			}

			setImageFileUrl(URL.createObjectURL(imageFile));
			uploadImage();
		}
	}, [imageFile]);

	const uploadImage = async () => {
		const storage = getStorage(app);
		const fileName = new Date().getTime() + imageFile.name;
		const storageRef = ref(storage, fileName);
		const metadata = {
			customMetadata: {
				uid: currentUser.firebaseId,
			},
		};
		const uploadTask = uploadBytesResumable(storageRef, imageFile, metadata);

		uploadTask.on(
			"state_changed",
			(snapshot) => {
				const progress =
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				setImageFileUploadProgress(progress.toFixed(0));
			},
			(error) => {
				setMyMessages((prevMessages) => ({
					...prevMessages,
					imageFileErrorMsg:
						"No se pudo cargar la imagen.\nEl archivo debe tener menos de 2 MB!",
				}));
				setImageFile(null);
				setImageFileUrl(null);
				setImageFileUploading(false);
				setImageFileUploadProgress(null);
			},
			() => {
				getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
					if (formData.profilePicture) {
						setPrevUrlData([...prevUrlData, formData.profilePicture]);
					}
					setFormData({ ...formData, profilePicture: downloadURL });
					setImageFileUrl(downloadURL);
					setImageFileUploading(false);
					setMyMessages((prevMessages) => ({
						...prevMessages,
						imageFileSuccessMsg: "Imagen cargada exitosamente",
					}));
				});
			}
		);
	};

	// Firebase Storage Rules

	// service firebase.storage {
	//   match /b/{bucket}/o {
	//     match /{allPaths=**} {
	//       allow read;
	//       allow write: if
	//       request.resource.size < 2 * 1024 * 1024 &&
	//       request.resource.contentType.matches('image/.*');
	//     }
	//   }
	// }

	const handleChange = (e) => {
		setUpdateUserLoading(false);
		setMyMessages((prevMessages) => ({
			...prevMessages,
			imageFileErrorMsg: null,
			imageFileSuccessMsg: null,
			updateUserErrorMsg: null,
			updateUserSuccessMsg: null,
		}));

		// setFormData({ ...formData, [e.target.id]: e.target.value });
		setFormData((prevFormData) => ({
			...prevFormData,
			[e.target.id]: e.target.value,
		}));
	};

	// console.log(formData);

	const handleUpdateUserSubmit = async (e) => {
		e.preventDefault();
		setUpdateUserLoading(true);
		setMyMessages((prevMessages) => ({
			...prevMessages,
			updateUserErrorMsg: null,
			updateUserSuccessMsg: null,
		}));

		if (imageFileUploading) {
			setUpdateUserLoading(false);
			setMyMessages((prevMessages) => ({
				...prevMessages,
				updateUserErrorMsg: "Espere a que se cargue la imagen.!",
			}));
			return;
		}

		if (formData.profilePicture !== currentUser.profilePicture) {
			setPrevUrlData([...prevUrlData, currentUser.profilePicture]);
		}

		// if (formData.password === "") {
		// 	delete formData.password;
		// }
		// if (formData.confirmPassword === "") {
		// 	delete formData.confirmPassword;
		// }
		if (formData.name === currentUser.name) {
			delete formData.name;
		}
		if (formData.email === currentUser.email) {
			delete formData.email;
		}

		if (formData.name || formData.name === "") {
			if (formData.name === "") {
				setUpdateUserLoading(false);
				setMyMessages((prevMessages) => ({
					...prevMessages,
					updateUserErrorMsg: "Nombre requerido!",
				}));
				return;
			}
		}

		// if (!currentUser.googleAuth && !forgetPassword) {
		// 	if (!formData.currentPassword || formData.currentPassword === "") {
		// 		setUpdateUserLoading(false);
		// 		setMyMessages((prevMessages) => ({
		// 			...prevMessages,
		// 			updateUserErrorMsg:
		// 				"Enter your current password for update your profile.",
		// 		}));
		// 		return;
		// 	}
		// }

		// if (
		// 	(formData.password || formData.confirmPassword) &&
		// 	formData.password !== formData.confirmPassword
		// ) {
		// 	setUpdateUserLoading(false);
		// 	setMyMessages((prevMessages) => ({
		// 		...prevMessages,
		// 		updateUserErrorMsg: "Your password isn't same. Try again!",
		// 	}));
		// 	return;
		// }

		if (Object.keys(formData).length === 0) {
			setUpdateUserLoading(false);
			setMyMessages((prevMessages) => ({
				...prevMessages,
				updateUserErrorMsg: "No se realizaron cambios!",
			}));
			return;
		}

		try {
			const res = await fetch(`/api/user/update/${currentUser._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await res.json();
			if (!res.ok) {
				setUpdateUserLoading(false);
				setMyMessages((prevMessages) => ({
					...prevMessages,
					updateUserErrorMsg: data.message,
				}));
				return;
			} else {
				dispatch(updateUserSuccess(data));
				setUpdateUserLoading(false);
				setMyMessages((prevMessages) => ({
					...prevMessages,
					updateUserSuccessMsg: "Perfil del usuario actualizado exitosamente",
				}));
				// Object.keys(formData).forEach((key) => delete formData[key]);
				setFormData({});
				setForgetPassword(false);
				setImageFileUploadProgress(null);
				setImageFileUrl(null);
				setImageFile(null);
				prevUrlData.map((item, index) => deleteFileByUrl(item));
			}
		} catch (error) {
			setUpdateUserLoading(false);
			setMyMessages((prevMessages) => ({
				...prevMessages,
				updateUserErrorMsg: error.message,
			}));
		}
	};

	const handleInputPasswordChange = (e) => {
		setMyMessages((prevMessages) => ({
			...prevMessages,
			deleteUserErrorMsg: null,
		}));
		setInputPasswordValue(e.target.value);
	};

	const handleDeleteUserSubmit = async (e) => {
		e.preventDefault();
		setShowModal(false);

		if (!currentUser.googleAuth) {
			if (!inputPasswordValue || inputPasswordValue === "") {
				setInputPasswordValue(null);
				setMyMessages((prevMessages) => ({
					...prevMessages,
					deleteUserErrorMsg: "Se requiere contraseña!",
				}));
				return;
			}
		}

		try {
			setMyMessages((prevMessages) => ({
				...prevMessages,
				deleteUserErrorMsg: null,
			}));
			const res = await fetch(`/api/user/delete/${currentUser._id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ inputPassword: inputPasswordValue }),
			});

			const data = await res.json();
			if (!res.ok) {
				setInputPasswordValue(null);
				setMyMessages((prevMessages) => ({
					...prevMessages,
					deleteUserErrorMsg: data.message,
				}));
				return;
			} else {
				dispatch(deleteUserSuccess(data));
			}
		} catch (error) {
			setInputPasswordValue(null);
			setMyMessages((prevMessages) => ({
				...prevMessages,
				deleteUserErrorMsg: error.message,
			}));
		}
	};

	const handleSignOut = async () => {
		try {
			setMyMessages((prevMessages) => ({
				...prevMessages,
				signOutErrorMsg: null,
			}));

			const res = await fetch("/api/auth/signout", {
				method: "POST",
			});

			const data = await res.json();
			if (!res.ok) {
				setMyMessages((prevMessages) => ({
					...prevMessages,
					signOutErrorMsg: data.message,
				}));
				return;
			} else {
				dispatch(signOutSuccess(data));
			}
		} catch (error) {
			setMyMessages((prevMessages) => ({
				...prevMessages,
				signOutErrorMsg: error.message,
			}));
		}
	};

	const handleForgetPassword = () => {
		setForgetPassword(true);
		Object.keys(myMessages).forEach((msg) => {
			myMessages[msg] = null;
		});
		setImageFileUploadProgress(null);
		setImageFileUrl(null);
		setImageFile(null);
		// Object.keys(formData).forEach((key) => delete formData[key]);
		setFormData({ forgetPassword: true });
		setShowModal(false);
		setInputPasswordValue(null);
	};

	const handleChangePassword = async (e) => {
		e.preventDefault();
		setChangePasswordLoading(true);

		setMyMessages((prevMessages) => ({
			...prevMessages,
			changePasswordMsg: null,
			changePasswordErrorMsg: null,
		}));

		try {
			await sendPasswordResetEmail(auth, currentUser.email);
			setMyMessages((prevMessages) => ({
				...prevMessages,
				changePasswordMsg: "Correo electrónico enviado para cambiar contraseña! Revisa tu bandeja de entrada.",
			}));
			setChangePasswordLoading(false);
		} catch (error) {
			console.error("Error sending password reset email:", error);
			setMyMessages((prevMessages) => ({
				...prevMessages,
				changePasswordErrorMsg: error.message,
			}));
			setChangePasswordLoading(false);
		}
	};

	return (
		<div
			className="w-full bg-cover bg-center
			bg-[url('../../bg-light.jpg')] dark:bg-[url('../../bg2-dark.jpg')]">
			<div
				className="max-w-xl my-10 mx-7 p-7 sm:mx-12 lg:mx-auto sm:p-10 self-center dark:shadow-whiteLg
			bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-xl">
				<h1 className="mt-2 mb-4 text-center font-semibold text-3xl">User</h1>
				<form
					className={`flex flex-col gap-2 ${theme}`}
					onSubmit={handleUpdateUserSubmit}>
					<input
						type="file"
						accept="image/*"
						onChange={handleImageChange}
						ref={filePickerRef}
						hidden
						disabled={forgetPassword}
					/>
					<button
						type="button"
						disabled={forgetPassword}
						className="relative w-32 h-32 self-center cursor-pointer mb-1 shadow-md 
                    overflow-hidden rounded-full disabled:cursor-not-allowed disabled:opacity-40"
						onClick={() => filePickerRef.current.click()}>
						{imageFileUploadProgress && (
							<CircularProgressbar
								value={imageFileUploadProgress || 0}
								text={`${imageFileUploadProgress}%`}
								strokeWidth={3}
								styles={{
									root: {
										width: "100%",
										height: "100%",
										position: "absolute",
										top: 0,
										left: 0,
									},
									path: {
										// stroke: `rgba(92, 230, 92, ${
										// 	imageFileUploadProgress / 100
										// })`,
										stroke: "rgba(92, 230, 92)",
									},
								}}
							/>
						)}
						<img
							src={imageFileUrl || currentUser.profilePicture}
							alt="user"
							className={`${
								imageFileUploadProgress &&
								imageFileUploadProgress < 100 &&
								"opacity-60"
							} rounded-full w-full h-full object-cover border-2 border-gray-400 `}
						/>
					</button>

					<TextInput
						type="text"
						id="name"
						placeholder="Nombre"
						onChange={handleChange}
						defaultValue={currentUser.name}
						disabled={forgetPassword}
					/>
					<TextInput
						type="email"
						id="email"
						placeholder="Correo electrónico"
						onChange={handleChange}
						defaultValue={currentUser.email}
						disabled
					/>
					{/* {!currentUser.googleAuth && (
						<TextInput
							type="password"
							id="currentPassword"
							placeholder="Current Password"
							onChange={handleChange}
							value={formData.currentPassword || ""}
							disabled={forgetPassword}
							required
						/>
					)} */}
					{/* <div className="flex items-center gap-1">
						<TextInput
							type={showPassword ? "text" : "password"}
							placeholder="New Password"
							id="password"
							onChange={handleChange}
							className="flex-auto"
							value={formData.password || ""}
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
					<TextInput
						type="password"
						id="confirmPassword"
						placeholder="Confirm Password"
						onChange={handleChange}
						value={formData.confirmPassword || ""}
					/> */}

					<Button
						type="submit"
						gradientDuoTone="purpleToBlue"
						outline
						className="uppercase focus:ring-1 mt-1"
						disabled={updateUserLoading || myMessages.updateUserErrorMsg}>
						{updateUserLoading ? (
							<>
								<Spinner size="sm" />
								<span className="pl-3">Cargando...</span>
							</>
						) : (
							"Actualizar"
						)}
					</Button>
				</form>

				<Button
					type="button"
					gradientDuoTone="purpleToBlue"
					className="uppercase focus:ring-1 mt-4 w-full"
					onClick={handleChangePassword}
					disabled={changePasswordLoading}>
					Cambiar la contraseña
				</Button>

				{!currentUser.isSpeaker && (
					<Link to={"/dashboard?tab=speaker"}>
						<Button
							type="button"
							gradientDuoTone="purpleToPink"
							className="uppercase focus:ring-1 mt-3 w-full">
							Conviértete en orador
						</Button>
					</Link>
				)}

				{/* <div className="text-red-500 flex justify-between my-3 mx-1">
					<span onClick={() => setShowModal(true)} className="cursor-pointer ">
						Delete Account
					</span>
					<span onClick={handleSignOut} className="cursor-pointer ">
						Sign Out
					</span>
				</div> */}

				{Object.entries(myMessages).map(
					([msg, value]) =>
						value && (
							<div key={msg} className="flex items-center gap-1 mt-4">
								<Alert
									className="flex-auto"
									color={msg.includes("Error") ? "failure" : "success"}
									withBorderAccent>
									<div className="flex justify-between">
										<span>
											{value}
											{value.includes("Invalid password.") && (
												<span
													onClick={handleForgetPassword}
													className="cursor-pointer">
													Forget Password?
												</span>
											)}
										</span>
										<span className="w-5 h-5">
											<MdCancelPresentation
												className="cursor-pointer w-6 h-6"
												onClick={() => {
													setMyMessages((prevMessages) => ({
														...prevMessages,
														[msg]: null,
													}));
												}}
											/>
										</span>
									</div>
								</Alert>
							</div>
						)
				)}

				<Modal
					className={`${theme}`}
					show={showModal}
					onClose={() => {
						setShowModal(false);
						setInputPasswordValue(null);
					}}
					popup
					size="lg">
					<Modal.Header />
					<Modal.Body>
						<form
							className={`flex flex-col text-center ${theme}`}
							onSubmit={handleDeleteUserSubmit}>
							<div className="flex items-center mb-8 gap-8 self-center">
								<HiOutlineExclamationCircle className="h-14 w-14 text-gray-500 dark:text-gray-200" />
								<span className="text-2xl text-gray-600 dark:text-gray-200">
								Eliminar cuenta
								</span>
							</div>
							{!currentUser.googleAuth && (
								<div className="flex items-center p-2">
									<TextInput
										type="password"
										id="password"
										placeholder="Password"
										onChange={handleInputPasswordChange}
										value={inputPasswordValue || ""}
										disabled={forgetPassword}
										className="flex-grow"
									/>
									<span
										onClick={handleForgetPassword}
										className="cursor-pointer ml-4 text-red-500">
										¿Olvidaste tu contraseña?
									</span>
								</div>
							)}
							<h3 className="my-5 text-lg text-gray-600 dark:text-gray-300">
							¿Estás seguro de que quieres eliminar tu cuenta?
							</h3>
							<div className="flex justify-around">
								<Button
									type="submit"
									color="failure"
									className="focus:ring-1"
									disabled={forgetPassword}>
									{"Yes, i'm sure"}
								</Button>
								<Button
									type="button"
									color="gray"
									onClick={() => setShowModal(false)}
									className="focus:ring-1 dark:text-gray-300">
									No, cancelar
								</Button>
							</div>
						</form>
					</Modal.Body>
				</Modal>
			</div>
		</div>
	);
};

export default DashUser;

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
