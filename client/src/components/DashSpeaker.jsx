import {
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
	TextInput,
} from "flowbite-react";
import { useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import { MdCancelPresentation } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { app } from "../firebase";
import { countries } from "countries-list";
import ReactPlayer from "react-player";

const DashSpeaker = () => {
	const [file, setFile] = useState(null);
	const [imageUploadProgress, setImageUploadProgress] = useState(null);
	const [imageUploadErrorMsg, setImageUploadErrorMsg] = useState(null);
	const [publishErrorMsg, setPublishErrorMsg] = useState(null);
	const [imageUploading, setImageUploading] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({});
	const navigate = useNavigate();
	const { theme } = useSelector((state) => state.theme);
	const [audioFile, setAudioFile] = useState(null);
	const [audioUploadProgress, setAudioUploadProgress] = useState(null);
	const [audioUploadErrorMsg, setAudioUploadErrorMsg] = useState(null);
	const [audioUploading, setAudioUploading] = useState(false);

	const countryOptions = Object.values(countries).map(
		(country) => country.name
	);

	const handleUploadImage = async () => {
		setImageUploadErrorMsg(null);
		setImageUploading(true);
		try {
			if (!file) {
				setImageUploading(false);
				setImageUploadErrorMsg("Please select an image!");
				return;
			}
			if (!file.type.includes("image/")) {
				setImageUploading(false);
				setImageUploadErrorMsg(
					"File type isn't image.\nPlease select an image file!"
				);
				return;
			}
			if (file.size >= 5 * 1024 * 1024) {
				setImageUploading(false);
				setImageUploadErrorMsg("Image size must be less than 5 MBs!");
				return;
			}

			const storage = getStorage(app);
			const fileName = new Date().getTime() + "-" + file.name;
			const storgeRef = ref(storage, fileName);
			const uploadTask = uploadBytesResumable(storgeRef, file);
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
					setImageUploadErrorMsg("Image Upload Failed. Try Again!");
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
						setImageUploadProgress(null);
						setFormData({ ...formData, image: downloadURL });
						setImageUploading(false);
					});
				}
			);
		} catch (error) {
			setImageUploadErrorMsg("Image upload failed. Try Again!");
			setImageUploading(false);
		}
	};

	const handleUploadAudio = async () => {
		setAudioUploadErrorMsg(null);
		setAudioUploading(true);
		try {
			if (
				audioFile.length > 0 &&
				audioFile.length + formData.demos.length < 6
			) {
				const promises = [];

				for (let i = 0; i < audioFile.length; i++) {
					promises.push(storeAudio(audioFile[i]));
				}

				Promise.all(promises)
					.then((urls) => {
						setFormData({
							...formData,
							demos: formData.demos.concat(urls),
						});
						setAudioUploadErrorMsg(null);
						setAudioUploading(false);
					})
					.catch((err) => {
						setAudioUploadErrorMsg("Audio file size must be less than 20 MBs");
						setAudioUploading(false);
					});
			} else {
				setAudioUploadErrorMsg("You can upload only 5 Audio files");
				setAudioUploading(false);
			}
		} catch (error) {
			setAudioUploadErrorMsg("Upload Demos failed, try again!");
			setAudioUploading(false);
		}
	};

	const storeAudio = async (audio) => {
		return new Promise((resolve, reject) => {
			const storage = getStorage(app);
			const fileName = new Date().getTime() + audio.name;
			const stoageRef = ref(storage, fileName);
			const uploadTask = uploadBytesResumable(stoageRef, audio);
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setPublishErrorMsg(null);
		setLoading(true);

		if (!formData.title || !formData.content) {
			setLoading(false);
			setPublishErrorMsg("Title and Content are required fields!");
		}

		try {
			const res = await fetch("/api/post/create-post", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});
			const data = await res.json();
			if (!res.ok) {
				setLoading(false);
				setPublishErrorMsg(data.message);
				return;
			} else {
				setLoading(false);
				setPublishErrorMsg(null);
				// navigate(`/post/${data.slug}`);
			}
		} catch (error) {
			setPublishErrorMsg(error.message);
			setLoading(false);
		}
	};

	return (
		<div
			className="w-full bg-cover bg-center
			bg-[url('../../bg-light.jpg')] dark:bg-[url('../../bg2-dark.jpg')]">
			<div
				className="max-w-3xl my-10 mx-7 p-7 sm:mx-12 lg:mx-auto sm:p-10 self-center dark:shadow-whiteLg
			bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-xl">
				<h1 className="text-center text-3xl mb-7 font-semibold">
					Create a Speaker Account
				</h1>
				<form
					className={`flex py-5 flex-col gap-4 ${theme}`}
					onSubmit={handleSubmit}>
					<div className="flex flex-col gap-4 sm:flex-row justify-around">
						<div className="flex flex-col gap-1">
							<Label value="Select your gender" />
							<Select
								className="w-56"
								required
								onChange={(e) =>
									setFormData({ ...formData, gender: e.target.value })
								}>
								<option value="" disabled>
									Choose gender
								</option>
								<option value="male">Male</option>
								<option value="female">Female</option>
								<option value="other">Other</option>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label value="Select your gender" />
							<Select
								className="w-56"
								required
								onChange={(e) =>
									setFormData({ ...formData, country: e.target.value })
								}>
								<option value="" disabled>
									Select a Country
								</option>
								{countryOptions.map((country, index) => (
									<option key={index} value={country}>
										{country}
									</option>
								))}
							</Select>
						</div>
					</div>

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2">
						<Label value="Your youtube video link (optional)" />
						<TextInput
							className="mb-4"
							type="text"
							placeholder="Youtube Link"
							id="youtubeLink"
							onChange={(e) =>
								setFormData({ ...formData, youtubeLink: e.target.value })
							}
						/>
						{formData.youtubeLink && (
							<div className="video-wrapper-form">
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
									className="react-player-form"
								/>
							</div>
						)}
					</div>

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2">
						<Label value="Upload an image (max size 5 MBs) (required)" />
						<div className="flex flex-col sm:flex-row gap-4 items-center justify-between dark:shadow-whiteLg">
							<FileInput
								type="file"
								accept="image/*"
								onChange={(e) => setFile(e.target.files[0])}
								className="w-full sm:w-auto"
							/>
							<Button
								type="button"
								gradientDuoTone="purpleToBlue"
								size="sm"
								outline
								className="focus:ring-1 w-full sm:w-auto"
								onClick={handleUploadImage}
								disabled={imageUploadProgress}>
								{imageUploadProgress ? (
									<div className="flex items-center">
										<CircularProgressbar
											className="h-5"
											value={imageUploadProgress}
										/>
										<span className="ml-1">Uploading...</span>
									</div>
								) : (
									"Upload Image"
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

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2">
						<Label value="Upload demos maximum 3 (required minimum 1) " />
						<div className="flex flex-col sm:flex-row gap-4 items-center justify-between dark:shadow-whiteLg">
							<FileInput
								type="file"
								accept="audio/*" // Accepts only audio files
								onChange={(e) => setFile(e.target.files)} // Handles file selection
								className="w-full sm:w-auto"
								multiple
							/>
							<Button
								type="button"
								gradientDuoTone="purpleToBlue"
								size="sm"
								outline
								className="focus:ring-1 w-full sm:w-auto"
								onClick={handleUploadAudio}
								disabled={audioUploadProgress}>
								{audioUploadProgress ? (
									<div className="flex items-center">
										<CircularProgressbar
											className="h-5"
											value={audioUploadProgress}
										/>
										<span className="ml-1">Uploading...</span>
									</div>
								) : (
									"Upload Demos"
								)}
							</Button>
						</div>
						{audioUploadErrorMsg && (
							<Alert className="flex-auto" color="failure" withBorderAccent>
								<div className="flex justify-between">
									<span>{audioUploadErrorMsg}</span>
									<span className="w-5 h-5">
										<MdCancelPresentation
											className="cursor-pointer w-6 h-6"
											onClick={() => setAudioUploadErrorMsg(null)}
										/>
									</span>
								</div>
							</Alert>
						)}
					</div>

					<Button
						type="submit"
						gradientDuoTone="purpleToPink"
						outline
						className="focus:ring-1 uppercase"
						disabled={loading || imageUploading}>
						{loading ? (
							<>
								<Spinner size="sm" />
								<span className="pl-3">Loading...</span>
							</>
						) : (
							"Publish"
						)}
					</Button>
				</form>
				{publishErrorMsg && (
					<Alert className="flex-auto" color="failure" withBorderAccent>
						<div className="flex justify-between">
							<span>{publishErrorMsg}</span>
							<span className="w-5 h-5">
								<MdCancelPresentation
									className="cursor-pointer w-6 h-6"
									onClick={() => setPublishErrorMsg(null)}
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
