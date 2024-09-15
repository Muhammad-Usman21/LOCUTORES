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
		demos: {},
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
					setImageUploadErrorMsg("Image Upload Failed. Try Again!");
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
			setImageUploadErrorMsg("Image upload failed. Try Again!");
			setImageUploading(false);
		}
	};

	const handleUploadAudio = async () => {
		setAudioUploadErrorMsg(null);
		setAudioUploading(true);
		try {
			if (!audioFile || audioFile.length === 0) {
				setAudioUploadErrorMsg("Select an audio file.");
				setAudioUploading(false);
				return;
			}
			if (!audioFile || audioFile.length > 1) {
				setAudioUploadErrorMsg("Select only 1 audio file.");
				setAudioUploading(false);
				return;
			}
			if (
				!currentUser.isPremium &&
				audioFile.length + Object.keys(formData.demos).length > 4
			) {
				setAudioUploadErrorMsg(
					"You are currently using free plan, so you can upload upto 4 Audio files.<br />Try PREMIUM Account for upload upto 15 Audio files."
				);
				setAudioUploading(false);
				return;
			}
			if (
				currentUser.isPremium &&
				audioFile.length + Object.keys(formData.demos).length > 15
			) {
				setAudioUploadErrorMsg("You can upload only 15 Audio files");
				setAudioUploading(false);
				return;
			}

			for (let i = 0; i < audioFile.length; i++) {
				if (audioFile[i].size >= 20 * 1024 * 1024) {
					setAudioUploadErrorMsg("Audio file size must be less than 20 MBs");
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
						demos: {
							...formData.demos,
							[keywords]: urls[0],
						},
					});
					setAudioUploadErrorMsg(null);
					setAudioUploading(false);
					setKeywords("");
				})
				.catch((err) => {
					setAudioUploadErrorMsg("Audio file size must be less than 20 MBs");
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

	const handleRemoveAudio = (index, url, key) => {
		const updatedDemos = { ...formData.demos }; // Copy demos object
		delete updatedDemos[key]; // Remove the key from the object

		setFormData({
			...formData,
			demos: updatedDemos, // Set the updated demos object
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
			Object.keys(formData.demos).length === 0 ||
			!formData.prices.small ||
			!formData.prices.medium ||
			!formData.prices.large ||
			!formData.stripeAccountId
		) {
			setLoading(false);
			setSpeakerErrorMsg(
				"Only Youtube Video Link & About & social media are optional.<br />All other fields are required."
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
					"You are currently using free plan, so you can upload only one youtube link.<br />Try PREMIUM Account for upload upto 10 youtube links."
				);
				return;
			}
			if (currentUser.isPremium && formData.videos.length === 10) {
				setYTLink("");
				setVideosErrorMsg("You can upload upto 10 Youtube links.");
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
					Create a Speaker Account
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
						Login with Stripe{" "}
						{formData.stripeAccountId == "" || formData.stripeAccountId == null
							? ""
							: "✅"}
					</Button>
					<div className="flex flex-col gap-4 sm:flex-row justify-around items-center">
						<div className="flex flex-col gap-1">
							<Label value="Select your gender" />
							<Select
								disabled={loading || imageUploading || audioUploading}
								className="w-56"
								required
								onChange={(e) =>
									setFormData({ ...formData, gender: e.target.value })
								}>
								<option value="">Choose gender</option>
								<option value="male">Male</option>
								<option value="female">Female</option>
								<option value="other">Other</option>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label value="Select your country" />
							<Select
								disabled={loading || imageUploading || audioUploading}
								className="w-56"
								required
								onChange={(e) =>
									setFormData({ ...formData, country: e.target.value })
								}>
								<option value="">Select a Country</option>
								{countryOptions.map((country, index) => (
									<option key={index} value={country}>
										{country}
									</option>
								))}
							</Select>
						</div>
					</div>

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2 dark:shadow-whiteLg">
						<Label value="Your youtube video link (optional)" />
						<div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
							<TextInput
								className="flex-grow w-full"
								type="text"
								placeholder="Youtube Link"
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
								Add
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
											Delete
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
										<span className="ml-1">Uploading... Please Wait!</span>
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

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<Label value="Upload demos (required minimum 1) " />
						<div className="flex flex-col mb-4 w-full gap-4 items-center justify-between">
							<div className="w-full">
								<TextInput
									type="text"
									placeholder="Write different keywords for demo with spaces"
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
										? "Uploading... Please Wait!"
										: "Upload Demos"}
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
							Object.keys(formData.demos).length > 0 &&
							Object.entries(formData.demos).map(([key, url], index) => (
								<div
									key={index}
									className="flex flex-col px-3 py-1 border gap-1">
									<div className="w-full">
										<Label value={`Keywords : ${key}`} />
									</div>
									<div className="flex flex-col md:flex-row justify-between px-3 py-1 items-center gap-1">
										{console.log("URL:", url)}
										<ReactAudioPlayer src={url} controls className="w-full" />
										<button
											disabled={loading || imageUploading || audioUploading}
											type="button"
											onClick={() => handleRemoveAudio(index, url, key)}
											className="px-3 text-red-700 rounded-lg uppercase hover:opacity-75">
											Delete
										</button>
									</div>
								</div>
							))}
					</div>

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<span className="text-lg text-center my-2">
							{"Your Prices ("}
							<span className="font-bold">$</span>
							{")"}
						</span>
						<div className="flex flex-col mb-4 gap-4 items-center justify-between">
							<div className="flex gap-2 items-center">
								<Label value="Voice for 10 - 20 seconds" />
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
								<Label value="Voice for 30 - 40 seconds" />
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
								<Label value="Voice for 1 minute" />
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
							About
							<span className="text-sm ml-2">(optional)</span>
						</span>
						<Textarea
							className="mb-2 mt-1"
							rows="4"
							placeholder="Write something about you...."
							onChange={(e) =>
								setFormData({ ...formData, about: e.target.value })
							}
							disabled={loading || imageUploading || audioUploading}
						/>
					</div>

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<span className="text-lg text-center my-2">
							Social Media (optional)
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
									placeholder="Instagram link"
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
									placeholder="facebook link"
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
									placeholder="twitter link"
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
									placeholder="whatsapp number"
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
								<span className="pl-3">Loading.... Please Wait!</span>
							</>
						) : (
							"Become Speaker"
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
