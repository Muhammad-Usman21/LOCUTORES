import { Alert, Button, Label, Table, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { MdCancelPresentation } from "react-icons/md";
import ReactPlayer from "react-player";
import { Link } from "react-router-dom";

const DashAdmin = () => {
	const [formData, setFormData] = useState({ recommended: [] });
	const [speakers, setSpeakers] = useState([]);
	const [showMore, setShowMore] = useState();
	const [addRemoveError, setAddRemoveError] = useState(null);
	const [updatedMsg, setUpdatedMsg] = useState(null);
	const [updatedError, setUpdatedError] = useState(null);

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
					return setUpdatedMsg("Updated successfully");
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
					return setUpdatedMsg("Updated successfully");
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
		if (formData.recommended.length === 6) {
			return setAddRemoveError("You can add upto 6 speakers to recommended.");
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

	return (
		<div
			className="w-full bg-cover bg-center
			bg-[url('../../bg-light.jpg')] dark:bg-[url('../../bg2-dark.jpg')]">
			<div
				className="max-w-6xl my-10 mx-7 p-7 sm:mx-12 lg:mx-auto sm:p-10 self-center dark:shadow-whiteLg
			bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-xl">
				<h2 className="self-center text-2xl text-center font-semibold">
					For Admin Only
				</h2>
				<form className="my-10 flex flex-col gap-10" onSubmit={handleSubmit}>
					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<Label
							value="Youtube Link for home page video"
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
					<div className="bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-md p-3 flex flex-col gap-2  dark:shadow-whiteLg">
						<Label
							value="Select upto 6 Speaker to recommend on home page"
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
										className="backdrop-blur-[9px] bg-transparent border-2 border-white/20 
							rounded-lg shadow-lg dark:shadow-whiteLg">
										<Table.Head className=" xl:sticky xl:top-[68px]">
											<Table.HeadCell>Speaker Image</Table.HeadCell>
											<Table.HeadCell>Speaker Name</Table.HeadCell>
											<Table.HeadCell>Speaker Email</Table.HeadCell>
											<Table.HeadCell>Add/Remove</Table.HeadCell>
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
																Remove
															</Button>
														) : (
															<Button
																onClick={() => handleAddSpeaker(speaker._id)}
																size="sm"
																outline
																type="button"
																gradientDuoTone="purpleToBlue"
																className="focus:ring-1 w-20">
																Add
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
												onClick={handleShowMore}
												className="text-teal-400 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500 mx-auto text-sm py-4">
												Show more
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
					<Button
						type="submit"
						gradientDuoTone="purpleToPink"
						outline
						className="focus:ring-1 uppercase">
						Confirm
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
		</div>
	);
};

export default DashAdmin;
