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
	Textarea,
	TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import { MdCancelPresentation } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { app } from "../firebase";
import { countries } from "countries-list";
import ReactPlayer from "react-player";
import ReactAudioPlayer from "react-audio-player";
import { updateUserSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";

const DashEditSpeaker = ({ stripeAccountId }) => {
	const [file, setFile] = useState(null);
	const [imageUploadProgress, setImageUploadProgress] = useState(null);
	const [imageUploadErrorMsg, setImageUploadErrorMsg] = useState(null);
	const [speakerErrorMsg, setSpeakerErrorMsg] = useState(null);
	const [imageUploading, setImageUploading] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		demos: [],
		prices: {},
		stripeAccountId,
	});
	const navigate = useNavigate();
	const { theme } = useSelector((state) => state.theme);
	const [audioFile, setAudioFile] = useState(null);
	const [audioUploadErrorMsg, setAudioUploadErrorMsg] = useState(null);
	const [audioUploading, setAudioUploading] = useState(false);
	const { currentUser } = useSelector((state) => state.user);
	const dispatch = useDispatch();
	const [updateLoading, setUpdateLoading] = useState(false);
	const [updateMsg, setUpdateMsg] = useState(null);

	const countryOptions = Object.values(countries).map(
		(country) => country.name
	);

	useEffect(() => {
		try {
			const fetchSpeaker = async () => {
				const res = await fetch(`/api/speaker/getspeaker/${currentUser._id}`);
				const data = await res.json();
				if (!res.ok) {
					console.log(data.message);
					return;
				}
				if (res.ok) {
					if (stripeAccountId == "" || stripeAccountId == null) {
						setFormData(data);
					} else {
						setFormData({ ...data, stripeAccountId });
					}
				}
			};

			fetchSpeaker();
		} catch (error) {
			console.log(error.message);
		}
	}, [currentUser._id]);

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
			setAudioUploadErrorMsg(error.message);
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

	const handleRemoveAudio = (index) => {
		setFormData({
			...formData,
			demos: formData.demos.filter((x, i) => i !== index),
		});
	};

	// console.log(formData);

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
				"Only Youtube Video Link & About are optional.\nAll other fields are required."
			);
			return;
		}

		try {
			const res = await fetch(
				`/api/speaker/update-speaker/${currentUser._id}/${formData._id}`,
				{
					method: "PUT",
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
				setUpdateMsg("Speaker Account updaded successfully!");
			}
		} catch (error) {
			setSpeakerErrorMsg(error.message);
			setLoading(false);
		}
	};

	const handleStripeLogin = async () => {
		try {
			const response = await fetch(`/api/auth/signin-stripe?tab=edit-speaker`);
			const result = await response.json();
			window.location.href = result.url;
		} catch (error) {
			console.log(error);
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
					Edit your Speaker Account
				</h1>
				<form
					className={`flex py-5 flex-col gap-6 ${theme}`}
					onSubmit={handleSubmit}>
					<div className="w-full flex gap-1 flex-col items-center py-2">
						<p>
							Don&apos;t change your Stripe account during any uncompleted
							orders.
						</p>
						<Button
							type="button"
							gradientDuoTone=""
							outline
							className="focus:ring-1 w-full"
							disabled={loading || imageUploading || audioUploading}
							onClick={handleStripeLogin}>
							Login with Stripe{" "}
							{formData.stripeAccountId == "" ||
							formData.stripeAccountId == null
								? ""
								: "✅"}
						</Button>
					</div>
					<div className="flex flex-col gap-4 sm:flex-row justify-around items-center">
						<div className="flex flex-col gap-1">
							<Label value="Select your gender" />
							<Select
								disabled={loading || imageUploading || audioUploading}
								className="w-56"
								required
								value={formData?.gender || ""}
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
								value={formData.country || ""}
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

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<Label value="Your youtube video link (optional)" />
						<TextInput
							className="mb-4"
							type="text"
							placeholder="Youtube Link"
							value={formData.video || ""}
							onChange={(e) =>
								setFormData({ ...formData, video: e.target.value })
							}
							disabled={loading || imageUploading || audioUploading}
						/>
						{formData?.video && (
							<div className="video-wrapper-form w-full">
								<ReactPlayer
									url={formData.video}
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

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
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
						<Label value="Upload demos maximum 5 (required minimum 1) " />
						<div className="flex flex-col mb-4 sm:flex-row gap-4 items-center justify-between">
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
								disabled={loading || imageUploading || audioUploading}>
								{audioUploading ? "Uploading... Please Wait!" : "Upload Demos"}
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
						{formData.demos?.length > 0 &&
							formData.demos.map((url, index) => (
								<div
									key={url}
									className="flex flex-col md:flex-row justify-between px-3 py-1 border items-center gap-1">
									<ReactAudioPlayer src={url} controls className="w-full" />
									<button
										disabled={loading || imageUploading || audioUploading}
										type="button"
										onClick={() => handleRemoveAudio(index)}
										className="px-3 text-red-700 rounded-lg uppercase hover:opacity-75">
										Delete
									</button>
								</div>
							))}
					</div>

					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-lg p-3 flex flex-col gap-2  dark:shadow-whiteLg">
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
									value={formData.prices.small}
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
									value={formData.prices.medium}
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
									value={formData.prices.large}
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
							value={formData.about || ""}
							onChange={(e) =>
								setFormData({ ...formData, about: e.target.value })
							}
							disabled={loading || imageUploading || audioUploading}
						/>
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
							"Update account"
						)}
					</Button>
				</form>
				{speakerErrorMsg && (
					<Alert className="flex-auto" color="failure" withBorderAccent>
						<div className="flex justify-between">
							<span>{speakerErrorMsg}</span>
							<span className="w-5 h-5">
								<MdCancelPresentation
									className="cursor-pointer w-6 h-6"
									onClick={() => setSpeakerErrorMsg(null)}
								/>
							</span>
						</div>
					</Alert>
				)}
				{updateMsg && (
					<Alert className="flex-auto" color="success" withBorderAccent>
						<div className="flex justify-between">
							<span>{updateMsg}</span>
							<span className="w-5 h-5">
								<MdCancelPresentation
									className="cursor-pointer w-6 h-6"
									onClick={() => setUpdateMsg(null)}
								/>
							</span>
						</div>
					</Alert>
				)}
			</div>
		</div>
	);
};
export default DashEditSpeaker;
