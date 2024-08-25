import { Button, FileInput } from "flowbite-react";
import { useEffect, useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import { useSelector } from "react-redux";
import { app } from "../firebase";
import {
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable,
} from "firebase/storage";
import { MdEmail } from "react-icons/md";
import Flag from "react-world-flags";
import { countries } from "countries-list";

const Orders = () => {
	const { currentUser } = useSelector((state) => state.user);
	const [orders, setOrders] = useState([]);
	const [file, setFile] = useState(null);
	const [audioUploading, setAudioUploading] = useState(false);

	console.log(orders);

	useEffect(() => {
		const fetchOrders = async () => {
			const response = await fetch("/api/order/orders");
			const data = await response.json();
			setOrders(data);

			const orderInfo = data.map((order) => ({
				id: order._id,
				status: order.status,
				updatedAt: order.updatedAt,
			}));
			localStorage.setItem("orderInfo", JSON.stringify(orderInfo));
		};

		fetchOrders();
	}, []);

	const handleFileUpload = async (orderId) => {
		if (!file) return;

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
			},
			async () => {
				// Handle successful uploads
				const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
				console.log("File available at", downloadURL);

				// Update the order in your backend with the file URL and status
				const response = await fetch(`/api/order/orders/${orderId}/upload`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ audioFile: downloadURL }),
				});

				if (response.ok) {
					console.log("Order updated successfully");
					setOrders((prevOrders) =>
						prevOrders.map((order) =>
							order._id === orderId
								? { ...order, status: "Completed", audioFile: downloadURL }
								: order
						)
					);
				} else {
					console.error("Failed to update order");
				}
			}
		);
	};

	const getCountryCodeFromName = (countryName) => {
		for (const [code, { name }] of Object.entries(countries)) {
			if (name.toLowerCase() === countryName.toLowerCase()) {
				return code; // Return the country code if a match is found
			}
		}
		return null;
	};

	return (
		<div className="min-h-screen w-full">
			<div className="max-w-6xl mx-auto items-center justify-center flex flex-col gap-10 my-14">
				<h1 className="font-semibold text-3xl">Your Orders</h1>
				{orders.map((order) => (
					<div
						key={order._id}
						className="order-card flex w-full p-10 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
						{currentUser._id === order.userId._id && (
							<div className="flex-1 flex flex-col gap-1 p-5 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
								<span className="text-2xl text-center mb-3">
									User&apos;s Information
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
									<span className="">
										{order.userCity}, {order.userContry}
									</span>
								</div>
							</div>
						)}

						<div className="flex-1 p-5">
							<p>
								<strong>Service:</strong> {order.service}
							</p>
							<p>
								<strong>Audio Duration:</strong> {order.audioDuration}
							</p>
							<p>
								<strong>Status:</strong> {order.status}
							</p>

							{order.status === "Completed" && (
								<ReactAudioPlayer
									src={order.audioFile}
									controls
									className="w-full"
								/>
							)}

							{order.speakerId.userId._id === currentUser._id &&
								(order.status === "Completed" ||
									order.status === "Pending Delivery") && (
									<div>
										<FileInput
											type="file"
											accept="audio/mp3"
											onChange={(e) => setFile(e.target.files[0])}
											className="w-full sm:w-auto"
										/>
										<Button
											type="button"
											gradientDuoTone="purpleToBlue"
											size="sm"
											outline
											className="focus:ring-1 w-full sm:w-auto"
											onClick={() => handleFileUpload(order._id)}
											disabled={audioUploading}>
											{order.status === "Completed" ? "Update" : "Confirm"}
										</Button>
									</div>
								)}
						</div>

						{currentUser._id === order.speakerId.userId._id && (
							<div className="flex-1 flex flex-col gap-1 p-5 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
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
					</div>
				))}
			</div>
		</div>
	);
};

export default Orders;
