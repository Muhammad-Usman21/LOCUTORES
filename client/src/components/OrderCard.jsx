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
import { Link } from "react-router-dom";

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

	const handleFileUpload = async (orderId, statuss) => {
		// Update the order in your backend with the file URL and status
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
				orderUpdated({
					orderId,
					status: statuss,
					audioFile: audioUrl,
					rejectMessage,
					speakerMessage,
				});
				setAudioUrl(null);
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
				<div className="border rounded-xl p-2 dark:border-gray-700">
					<div>
						<span className="font-semibold mr-12">Created Date:</span>
						<span>
							{new Date(order.createdAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</span>
					</div>
					<div>
						<span className="font-semibold mr-11">Order Service:</span>
						<span>{order.service}</span>
					</div>
					<div>
						<span className="font-semibold mr-8">Audio Duration:</span>
						<span>{order.audioDuration === "small" && "10 ~ 20 seconds"}</span>
						<span>{order.audioDuration === "medium" && "30 ~ 40 seconds"}</span>
						<span>{order.audioDuration === "large" && "1 minute"}</span>
					</div>
					<div>
						<span className="font-semibold mr-4">Payment Amount:</span>
						<span className="font-semibold">$ {order.amount}</span>
					</div>
					<div>
						<span className="font-semibold mr-[53px]">Order Status:</span>
						<span
							className={
								order.status === "Rejected"
									? "text-red-500 font-semibold"
									: order.status === "Completed"
									? "text-green-500 font-semibold"
									: order.status === "Pending Delivery"
									? "text-yellow-500 font-semibold"
									: "font-semibold"
							}>
							{order.status}
						</span>
					</div>
					<div>
						<span className="font-semibold mr-[98px]">Quote:</span>
						<span className="font-semibold">{order.quote}</span>
					</div>
					<div>
						<span className="font-semibold mr-[102px]">Specs:</span>
						<span>{order.specs ? `${order.specs}` : "None"}</span>
					</div>
				</div>

				{(order.status === "Completed" ||
					order.status === "Rejected" ||
					order.status === "Delivered") && (
					<div className="p-2 rounded-xl mt-2 border dark:border-gray-700">
						{(order.status === "Delivered" || order.status === "Rejected") &&
							order.speakerId.userId._id === currentUser._id && (
								<p className="text-center py-2">
									Customer recieved this audio <br />
									But you can update this if there is any issue with this file
								</p>
							)}
						{order.status === "Delivered" &&
							order.userId._id === currentUser._id && (
								<p className="text-center py-2">
									Order {order.status} and Speaker send this audio <br />
									If there are any issues in the file then you can contact with
									your Speaker.
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
									Order {order.status}. Waiting for Customer to ACCEPT
								</p>
							)}
						{(order.status === "Delivered" || order.status === "Rejected") &&
							order.userId._id === currentUser._id && (
								<div className="flex flex-col gap-2">
									{order.speakerMessage && (
										<div className="my-2 p-2 border rounded-xl dark:border-gray-700">
											<p className="text-xxs">Message from Speaker</p>
											<p>{order.speakerMessage}</p>
										</div>
									)}

									{status === "Delivered" && (
										<>
											<p className="text-center">
												You can download above audio after ACCEPT
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
													Accept
												</Button>
												<Button
													type="button"
													gradientDuoTone="purpleToPink"
													size="sm"
													outline
													className="focus:ring-1 flex-1"
													onClick={() => setStatus("Reject")}>
													Reject
												</Button>
											</div>
										</>
									)}

									{status === "Reject" && (
										<div className="w-full">
											<span className="text-sm">
												Write an message for Speaker
											</span>
											<form
												onSubmit={() => handleFileUpload(order._id, "Rejected")}
												className="mt-1 w-full">
												<Textarea
													className="mb-2"
													rows="2"
													placeholder="Write reason for rejection...."
													onChange={(e) => setRejectMessage(e.target.value)}
													disabled={audioUploading}
												/>
												<div className="flex gap-2">
													<Button
														type="submit"
														gradientDuoTone="purpleToPink"
														size="sm"
														outline
														className="focus:ring-1 w-full">
														SEND
													</Button>
													<Button
														type="button"
														gradientDuoTone="purpleToPink"
														size="sm"
														outline
														className="focus:ring-1 w-full"
														onClick={() => setStatus(order.status)}>
														CANCEL
													</Button>
												</div>
											</form>
										</div>
									)}
									{order.status === "Rejected" && (
										<p className="text-center py-2">
											Order {order.status}. Waiting for Speaker to send another
											Audio.
										</p>
									)}
								</div>
							)}
						{order.status === "Rejected" &&
							order.speakerId.userId._id === currentUser._id &&
							order.rejectMessage && (
								<div className="my-2 p-2 border rounded-xl dark:border-gray-700">
									<p className="text-xxs">Message from Customer</p>
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
									{audioUploading ? "Uploading... Please Wait!" : "Upload"}
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
												Delete
											</button>
										</div>
										<div>
											<span className="text-sm">
												Write an message for Customer (optional)
											</span>
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
								onClick={() => {
									handleFileUpload(order._id, "Delivered");
								}}
								disabled={audioUploading}>
								{order.status === "Delivered" ? "Update" : "Confirm"}
							</Button>
						</div>
					)}
				{order.status === "Completed" && (
					<div className="w-full flex items-center justify-center bg-green-600 my-2 rounded-full p-1">
						<span className="text-3xl text-center text-green-200 self-center">
							ORDER COMPLETED
						</span>
					</div>
				)}
			</div>

			{currentUser._id === order.userId._id && (
				<div className="w-96 flex flex-col gap-1 p-5 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<span className="text-2xl text-center mb-3">
						<Link to={`/speaker/${order.speakerId._id}`}>
							Speaker&apos;s Information
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
						<span className="text-lg">
							<Link to={`/speaker/${order.speakerId._id}`}>
								{order.speakerId.userId.name}
							</Link>
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
