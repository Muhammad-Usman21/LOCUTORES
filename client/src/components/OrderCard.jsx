import { countries } from "countries-list";
import {
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable,
} from "firebase/storage";
import { Button, FileInput, Textarea } from "flowbite-react";
import { useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import { MdEmail } from "react-icons/md";
import { useSelector } from "react-redux";
import Flag from "react-world-flags";
import { app } from "../firebase";

const OrderCard = ({ order, orderUpdated }) => {
	const { currentUser } = useSelector((state) => state.user);
	const [file, setFile] = useState(null);
	const [audioUploading, setAudioUploading] = useState(false);
	const [audioUrl, setAudioUrl] = useState(order.audioFile);

	const [status, setStatus] = useState(order.status);
	const [rejectMessage, setRejectMessage] = useState(order.rejectMessage);
	const [speakerMessage, setSpeakerMessage] = useState(order.speakerMessage);

	const getCountryCodeFromName = (countryName) => {
		for (const [code, { name }] of Object.entries(countries)) {
			if (name.toLowerCase() === countryName.toLowerCase()) {
				return code; // Return the country code if a match is found
			}
		}
		return null;
	};

	const handleUploadAudio = async () => {
		if (!file) return;
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
			},
			async () => {
				// Handle successful uploads
				const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
				console.log("File available at", downloadURL);
				setAudioUrl(downloadURL);
				setAudioUploading(false);
			}
		);
	};

	const handleFileUpload = async (orderId) => {
		// Update the order in your backend with the file URL and status
		try {
			if (rejectMessage === "") {
				setRejectMessage(null);
			}
			if (speakerMessage === "") {
				setSpeakerMessage(null);
			}

			const response = await fetch(
				`/api/order/status?orderId=${orderId}&status=${status}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						audioFile: audioUrl,
						rejectMessage,
						speakerMessage,
					}),
				}
			);

			if (response.ok) {
				console.log("Order updated successfully");
				setAudioUrl(null);
				orderUpdated({
					orderId,
					status,
					audioFile: audioUrl,
					rejectMessage,
					speakerMessage,
				});
			} else {
				console.error("Failed to update order");
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<>
			{currentUser._id === order.speakerId.userId._id && (
				<div className="w-96 flex flex-col gap-1 p-5 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<span className="text-2xl text-center mb-3">
						Customer&apos;s Information
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

			<div className="flex-auto p-5">
				<p>
					<strong>Service:</strong> {order.service}
				</p>
				<p>
					<strong>Audio Duration:</strong> {order.audioDuration}
				</p>
				<p>
					<strong>Status:</strong> {order.status}
				</p>

				{(order.status === "Completed" ||
					order.status === "Rejected" ||
					order.status === "Delivered") && (
					<div className="p-2 rounded-xl mt-2 border">
						{order.status === "Delivered" &&
							order.speakerId.userId._id === currentUser._id && (
								<p className="text-center py-2">
									Customer recieved this audio, but you can update this if there
									is any issue with this file.
								</p>
							)}
						{order.status === "Delivered" ||
							(order.status === "Completed" && 
								order.userId._id === currentUser._id && (
								<p className="text-center py-2">
									Order {order.status} and Speaker send this audio. If there are
									any issues in the file then you can contact with your Speaker.
								</p>
							))}
						{order.status === "Delivered" ||
							(order.status === "Completed" && (
								<ReactAudioPlayer
									src={order.audioFile}
									controls
									controlsList={
										order.status === "Completed" ? "" : "nodownload"
									}
									className="w-full"
								/>
							))}
						{order.status === "Delivered" && 
							order.userId._id === currentUser._id && (
							<div className="flex flex-col gap-2">
								{order.message && (
									<div className="my-2 p-2 border rounded-xl">
										<p>Message from Speaker</p>
										<p>{order.message}</p>
									</div>
								)}
								<p className="text-center">
									You can download above audio after clicking ACCEPT
								</p>
								<div className="flex w-full gap-4">
									<Button
										type="button"
										gradientDuoTone="purpleToBlue"
										size="sm"
										outline
										className="focus:ring-1 flex-1"
										onClick={() => setStatus("Completed")}>
										Accept
									</Button>
									<Button
										type="button"
										gradientDuoTone="purpleToPink"
										size="sm"
										outline
										className="focus:ring-1 flex-1"
										onClick={() => setStatus("Rejected")}>
										Reject
									</Button>

									{status === "Rejected" && (
										<div className="w-full">
											<span>Write an message for Speaker</span>
											<Textarea
												className="mb-2 mt-1"
												rows="2"
												placeholder="Write reason for rejection...."
												onChange={(e) => setRejectMessage(e.target.value)}
												disabled={audioUploading}
											/>
											<Button
												type="button"
												gradientDuoTone="purpleToPink"
												size="sm"
												outline
												className="focus:ring-1 w-full"
												onClick={() => handleFileUpload(order._id)}>
												SEND
											</Button>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				)}

				{order.speakerId.userId._id === currentUser._id &&
					(order.status === "Rejected" ||
						order.status === "Delivered" ||
						order.status === "Pending Delivery") && (
						<div className="flex flex-col w-full gap-3 mt-4 border rounded-xl p-2">
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
									{audioUploading ? "Uploading... Please Wait!" : "Upload"}
								</Button>
							</div>
							{audioUrl && (
								<div className="flex flex-col gap-2">
									<div className="flex justify-between px-3 py-1 border items-center">
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
											Delete
										</button>
									</div>
									<div>
										<span>Write an message for Customer (optional)</span>
										<Textarea
											className="mb-2 mt-1"
											rows="2"
											placeholder="Write something to customers...."
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
								onClick={() => handleFileUpload(order._id)}
								disabled={audioUploading}>
								{order.status === "Completed" ? "Update" : "Confirm"}
							</Button>
						</div>
					)}
			</div>

			{currentUser._id === order.userId._id && (
				<div className="w-96 flex flex-col gap-1 p-5 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<span className="text-2xl text-center mb-3">
						Speaker&apos;s Information
					</span>
					<div className="flex items-center gap-3">
						<img
							src={order.speakerId.userId.profilePicture}
							alt="profile pic"
							className="w-10 h-10 object-cover rounded-full"
						/>
						<span className="text-lg">{order.speakerId.userId.name}</span>
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
