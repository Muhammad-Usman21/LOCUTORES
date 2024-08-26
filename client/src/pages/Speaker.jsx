import { loadStripe } from "@stripe/stripe-js";
import { countries } from "countries-list";
import {
	Alert,
	Button,
	Label,
	Select,
	Spinner,
	Textarea,
	TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import { MdCancelPresentation, MdEmail } from "react-icons/md";
import { FaRegUser, FaFemale, FaMale } from "react-icons/fa";

import ReactPlayer from "react-player";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Flag from "react-world-flags";

const Speaker = () => {
	const { id } = useParams();
	const [speaker, setSpeaker] = useState(null);

	const { currentUser } = useSelector((state) => state.user);
	const [formData, setFormData] = useState({
		name: currentUser.name,
		email: currentUser.email,
		number: "",
		company: "",
		city: "",
		country: "",
		service: "",
		duration: "",
		specs: "",
	});
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);

	const [message, setMessage] = useState("");

	const onChange = (e) => {
		setMessage(e.target.value);
	};

	const { theme } = useSelector((state) => state.theme);
	const countryOptions = Object.values(countries).map(
		(country) => country.name
	);

	const [showMore, setShowMore] = useState(false);
	const toggleShowMore = () => setShowMore(!showMore);

	useEffect(() => {
		const fetchSpeaker = async () => {
			try {
				const response = await fetch(`/api/speaker/getspeakerrr/${id}`);
				const data = await response.json();
				setSpeaker(data);
			} catch (error) {
				console.error("Error fetching speaker:", error);
			}
		};

		fetchSpeaker();
	}, [id]);

	const handleChange = (e) => {
		setLoading(false);
		setErrorMessage(null);
		setFormData((prevFormData) => ({
			...prevFormData,
			[e.target.id]: e.target.value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (
			!formData.email ||
			!formData.name ||
			!formData.number ||
			!formData.company ||
			!formData.city ||
			!formData.country ||
			!formData.service ||
			!formData.quote ||
			!formData.duration
		) {
			return setErrorMessage("All fields are required!");
		}
		console.log(formData);
		try {
			setLoading(true);
			setErrorMessage(null);
			const stripe = await loadStripe(
				"pk_test_51PrLnjISagHb5Xr13f8PuJs7EFOwxi5jIXxS4l0DTdT4vGtW6N8m09YOCckaR6vglbqEZitXvNFyoUOhSgR1EpUF00d7wABlaO"
			);
			const response = await fetch("/api/order/create-new-order", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					user: currentUser,
					speaker: speaker,
					data: formData,
					amount: speaker.prices[formData.duration],
				}),
			});
			const session = await response.json();
			const result = await stripe.redirectToCheckout({
				sessionId: session.id,
			});

			if (result.error) {
				console.error(result.error.message);
			}

			setLoading(false);
		} catch (error) {
			setErrorMessage(error.message);
			setLoading(false);
		}
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
		<div className="flex lg:flex-row flex-col p-5">
			{speaker ? (
				<div className="container mx-auto p-4 lg:w-2/5 w-full">
					<div className="flex flex-col items-center gap-4">
						<div className=" w-full mt-10 flex flex-row gap-5 justify-between content-between place-content-between">
							<img
								src={speaker.image}
								alt={speaker.userId.name}
								className="rounded-3xl shadow-2xl w-64 h-44 self-center dark:shadow-whiteLg flex-1 object-cover"
							/>
							<div className="w-3/5 flex flex-col justify-center gap-3 flex-1">
								<p className="text-xl">
									<FaRegUser className="inline-block mr-2" />
									{speaker.userId.name}
								</p>
								<p className="text-xl">
									<MdEmail className="inline-block mr-2" />
									{speaker.userId.email}
								</p>
								<p className="text-xl">
									{speaker.gender == "male" ? (
										<FaMale className="inline-block mr-2" />
									) : (
										<FaFemale className="inline-block mr-2" />
									)}
									{speaker.gender}
								</p>
								<p className="text-xl">
									<Flag
										code={getCountryCodeFromName(speaker.country)}
										className="w-8 inline-block mr-2"
									/>
									{speaker.country}
								</p>
							</div>
						</div>

						<div className="text-lg self-start mt-3 mb-3 flex flex-col">
							<span className="text-2xl">Speaker&apos;s About: </span>
							<span>{speaker.about}</span>
						</div>
						<div className=" flex justify-center align-middle flex-col items-center w-full my-2">
							<h3 className="text-2xl mb-4 font-semibold">Prices</h3>
							<div className="overflow-x-auto w-3/4">
								<table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md text-center">
									<thead>
										<tr>
											<th className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border-r">
												Duration
											</th>
											<th className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
												Price
											</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-r">
												10 ~ 20 seconds
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
												$ {speaker.prices.small}
											</td>
										</tr>
										<tr className="bg-gray-50 dark:bg-gray-700">
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-r">
												30 ~ 40 seconds
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
												$ {speaker.prices.medium}
											</td>
										</tr>
										<tr>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-r">
												1 minute
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
												$ {speaker.prices.large}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						{speaker.video && (
							<div className="self-center my-5">
								<ReactPlayer
									url={speaker.video}
									controls
									loop
									config={{
										youtube: {
											playerVars: {
												modestbranding: 1,
												rel: 0,
												showinfo: 0,
												disablekb: 1,
											},
										},
									}}
									className="react-player-form"
								/>
							</div>
						)}
						<div className="w-full my-2">
							<h3 className="text-2xl mb-3 pl-4">Example Audio</h3>
							<div className="flex flex-wrap justify-between">
								{speaker.demos.length > 0 ? (
									speaker.demos.map((demo, index) => (
										<ReactAudioPlayer
											key={index}
											src={demo}
											controls
											className="w-[350px] mb-4"
										/>
									))
								) : (
									<p>No demos available</p>
								)}
							</div>
						</div>
					</div>
				</div>
			) : (
				<>
					<Spinner size="sm" />
					<span className="pl-3">Loading...</span>
				</>
			)}

			<div className="flex w-1/2 h-min self-center m-4 p-10 max-w-2xl flex-col md:items-center gap-10">
				<div
					className="flex flex-col md:flex-row md:items-center gap-10 p-10 py-14 w-full
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<div className="flex-1">
						<h1 className="flex self-center justify-center text-3xl font-semibold mb-6">
							Place an Order
						</h1>
						<form
							className={`flex flex-col gap-4 ${theme}`}
							onSubmit={handleSubmit}>
							<div className="flex flex-col gap-1">
								<Label value="Name" />
								<TextInput
									type="text"
									placeholder="Name"
									id="name"
									value={formData.name}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="flex flex-col gap-1">
								<Label value="Email" />
								<TextInput
									type="text"
									placeholder="Email"
									id="email"
									value={formData.email}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="flex flex-col gap-1">
								<Label value="Phone" />
								<TextInput
									type="text"
									placeholder="Number"
									id="number"
									value={formData.number}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="flex flex-col gap-1">
								<Label value="Company" />
								<TextInput
									type="text"
									placeholder="Company"
									id="company"
									value={formData.company}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="flex flex-row content-between justify-between">
								<div className="flex flex-col gap-1 w-1/2">
									<Label value="City" />
									<TextInput
										type="text"
										placeholder="City"
										id="city"
										value={formData.city}
										onChange={handleChange}
										required
									/>
								</div>
								<div className="flex flex-col gap-1 w-2/5">
									<Label value="Country" />
									<Select
										className="w-full"
										value={formData.country}
										id="country"
										required
										onChange={handleChange}>
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

							<div className="flex flex-row content-between justify-between">
								<div className="flex flex-col gap-1 w-2/5">
									<Label value="Type of Service" />
									<Select
										className="w-full"
										id="service"
										required
										value={formData.service}
										onChange={handleChange}>
										<option value="" disabled>
											Select a Service
										</option>
										<option value="voiceOver">Voice Over</option>
										<option value="womenVoice">Video Debbing</option>
										<option value="holdswitch">Message on HOLD/SWITCH</option>
										<option value="auditoryLogos">
											Auditory Logos (Branding)
										</option>
									</Select>
								</div>
								<div className="flex flex-col gap-1 w-2/5">
									<Label value="Audio Duration" />
									<Select
										className="w-full"
										required
										id="duration"
										value={formData.duration}
										onChange={handleChange}>
										<option value="" disabled>
											Select a Duration
										</option>
										<option value="small">Voice for 10~20 sec </option>
										<option value="medium">Voice for 30~40 sec</option>
										<option value="large">Voice for 1 min</option>
									</Select>
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<Label value="Quote" />
								<Textarea
									rows={5}
									placeholder="Write your quote for voice-over"
									id="quote"
									value={formData.quote}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="flex flex-col gap-1">
								<Label value="Specs" />
								<Textarea
									rows={3}
									placeholder="Optional additional information (length, voice type, broadcast medium, etc.)"
									id="specs"
									value={formData.specs}
									onChange={handleChange}
								/>
							</div>
							<Button
								gradientDuoTone="purpleToBlue"
								type="submit"
								className="uppercase focus:ring-1 mt-1"
								disabled={loading || errorMessage}>
								{loading ? (
									<>
										<Spinner size="sm" />
										<span className="pl-3">Loading...</span>
									</>
								) : (
									"Next"
								)}
							</Button>
						</form>
						{errorMessage && (
							<div className="flex items-center gap-1 mt-4">
								<Alert className="flex-auto" color="failure" withBorderAccent>
									<div className="flex justify-between">
										<span>{errorMessage}</span>
										<span className="w-5 h-5">
											<MdCancelPresentation
												className="cursor-pointer w-6 h-6"
												onClick={() => setErrorMessage(null)}
											/>
										</span>
									</div>
								</Alert>
							</div>
						)}
					</div>
				</div>

				<div
					className="flex flex-col w-full md:flex-row md:items-center gap-10 p-10 
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					{speaker && (
						<div className="flex flex-col gap-2 mt-2 w-full">
							<p>
								Contact{" "}
								<span className="font-semibold">{speaker.userId.name}</span> for
								any questions realated Voice-Over
							</p>
							<Textarea
								name="message"
								id="message"
								rows="3"
								value={message}
								onChange={onChange}
								placeholder="Enter your message here..."
								className="w-full border p-3 rounded-lg"></Textarea>

							<Link
								to={`mailto:${speaker.userId.email}?subject=Regarding Voice-Over &body=${message}`}
								className="bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3 text-center">
								Send Message
							</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Speaker;
