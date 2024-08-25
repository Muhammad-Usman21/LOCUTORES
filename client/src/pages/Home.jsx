import { Button, Select } from "flowbite-react";
import { countries } from "countries-list";
import CardComponent from "../components/CardComponent";
import { useEffect, useState } from "react";

const Home = () => {
	const [speaker, setSpeaker] = useState([]);
	const [voiceType, setVoiceType] = useState("");
	const [country, setCountry] = useState("");
	const [showMore, setShowMore] = useState(true);

	const countryOptions = Object.values(countries).map(
		(country) => country.name
	);

	useEffect(() => {
		fetchSpeaker();
	}, []);

	const fetchSpeaker = async (voiceType = "", country = "") => {
		// console.log(voiceType, country);
		try {
			const response = await fetch(
				`/api/speaker/getspeakers?voiceType=${voiceType}&country=${country}`
			);
			const data = await response.json();
			// console.log(data);
			setSpeaker(data);
			if (speaker.length < 9) {
				setShowMore(false);
			}
		} catch (error) {
			console.error("Failed to fetch speaker", error);
		}
	};

	const handleSearch = () => {
		fetchSpeaker(voiceType, country);
	};

	const handleShowMore = async () => {
		try {
			const startIndex = speaker.length;
			const response = await fetch(
				`/api/speaker/getspeakers?voiceType=${voiceType}&country=${country}&startIndex=${startIndex}`
			);
			const data = await response.json();
			// console.log(data);
			if (data.length < 9) {
				setShowMore(false);
			}
			setSpeaker([...speaker, ...data]);
		} catch (error) {
			console.error("Failed to fetch speaker", error);
		}
	};

	return (
		<div className="min-w-screen w-full">
			<div className="max-w-7xl mx-auto items-center justify-center flex flex-col gap-24 my-24">
				<div
					className="flex flex-col items-center justify-center gap-8 p-10
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<span className="text-4xl">PROFESSIONALS VOICEOVERS</span>
					<span className="text-2xl text-center">
						Professional Voice-Over, Commercial Voice-Over, Institutional
						Voice-Over
					</span>
				</div>
				<div
					className="flex flex-col items-center justify-center gap-8 p-10
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<span className="text-2xl">
						What kind of voice are you looking for?
					</span>
					<div className="flex flex-col sm:flex-row gap-4">
						<Select
							className="w-48"
							value={voiceType}
							onChange={(e) => setVoiceType(e.target.value)}>
							<option value="" disabled>
								Type of Voice
							</option>
							<option value="all">All Voices</option>
							<option value="womenVoice">{"Women's Voice"}</option>
							<option value="menVoice">{"Men's Voice"}</option>
						</Select>
						<Select
							className="w-48"
							value={country}
							onChange={(e) => setCountry(e.target.value)}>
							<option value="" disabled>
								Select a Country
							</option>
							<option value="all">All Countries</option>
							{countryOptions.map((country, index) => (
								<option key={index} value={country}>
									{country}
								</option>
							))}
						</Select>
						<Button
							className=" w-full sm:w-28 focus:ring-1"
							gradientDuoTone={"purpleToPink"}
							onClick={handleSearch}>
							Search
						</Button>
					</div>
				</div>

				<div className="flex flex-col items-center justify-center gap-10 p-10 mb-20
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<div className="flex flex-wrap gap-5 items-center justify-center">
						{speaker.map((speaker) => (
							<CardComponent key={speaker._id} speaker={speaker} />
						))}
					</div>
					{showMore && (
						<button
							onClick={handleShowMore}
							className="text-center self-center">
							Show More
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default Home;
