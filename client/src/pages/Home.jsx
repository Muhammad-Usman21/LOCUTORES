import { Button, Select } from "flowbite-react";
import { countries } from "countries-list";
import CardComponent from "../components/CardComponent";
import { useEffect, useState } from "react";
// import YouTube from 'react-youtube';
import YouTubePlayer from "react-player/youtube";
import CardCRecommend from "../components/CardCRecommend";

const Home = () => {
	const [speaker, setSpeaker] = useState([]);
	const [voiceType, setVoiceType] = useState("");
	const [country, setCountry] = useState("");
	const [sort, setSort] = useState("desc");
	const [showMore, setShowMore] = useState(true);
	const [storage, setStorage] = useState({ recommended: [] });
	const [speakerDetails, setSpeakerDetails] = useState({});

	useEffect(() => {
		const fetchStorage = async () => {
			try {
				const response = await fetch("/api/storage/get-storage");
				const data = await response.json();
				setStorage(data);
			} catch (error) {
				console.log(error.message);
			}
		};

		fetchStorage();
	}, []);

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
				`/api/speaker/getspeakers?voiceType=${voiceType}&country=${country}&sort=${sort}&limit=9`
			);
			const data = await response.json();
			// console.log(data);
			setSpeaker(data);
			if (data.length < 9) {
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
				`/api/speaker/getspeakers?voiceType=${voiceType}&country=${country}&startIndex=${startIndex}&sort=${sort}&limit=9`
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

	const getRecommendedSpeaker = async (speakerId) => {
		if (!speakerDetails[speakerId]) {
			try {
				// const res = await fetch(`/api/speaker/getspeakerrr/${speakerId}`);
				const res = await fetch(
					`/api/speaker/getspeakers?speakerId=${speakerId}&voiceType=${"all"}&country=${"all"}`
				);
				const data = await res.json();
				if (res.ok) {
					setSpeakerDetails((prevState) => ({
						...prevState,
						[speakerId]: data[0],
					}));
				} else {
					console.log(data.message);
				}
			} catch (error) {
				console.log(error.message);
			}
		}
	};

	useEffect(() => {
		// console.log(storage.found, storage.recommended?.length);
		if (
			storage.found &&
			Array.isArray(storage.recommended) &&
			storage.recommended.length > 0
		) {
			storage.recommended.forEach(async (speakerId) => {
				await getRecommendedSpeaker(speakerId);
			});
		}
	}, [storage.recommended]);

	// console.log(speakerDetails);
	// console.log(storage);
	// storage.recommended.map((speakerId) =>
	// 	console.log(speakerId, speakerDetails[speakerId])
	// );

	return (
		<div className="min-h-screen w-full">
			<div className="w-full h-[44vw] overflow-clip flex justify-center items-center">
				<div className="w-[120vw] h-[67vw]">
					<div className="w-full h-full  absolute z-20 bg-slate-300 opacity-0 "></div>
					<YouTubePlayer
						url={
							storage.found
								? storage.youtubeLink
								: "https://youtu.be/gXBwWU1mmmw?si=gZ5OvYMFGkMstCLq"
						}
						playing={true}
						loop={true}
						muted={true}
						controls={false}
						width="100%"
						height="100%"
					/>
				</div>
			</div>
			<div className="max-w-7xl mx-3 sm:mx-5 lg:mx-auto items-center justify-center flex flex-col gap-12 lg:gap-24 my-10 lg:my-24">
				<div
					className="flex flex-col items-center justify-center gap-4 md:gap-8 p-5 md:p-10
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<span className="text-2xl md:text-4xl text-center">
						PROFESSIONALS VOICEOVERS
					</span>
					<span className="text-lg md:text-2xl text-center">
						Professional Voice-Over, Commercial Voice-Over, Institutional
						Voice-Over
					</span>
				</div>
				<div
					className="flex flex-col items-center justify-center gap-4 md:gap-8 p-5 md:p-10
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<span className="text-lg md:text-2xl text-center px-5">
						What kind of voice are you looking for?
					</span>
					<div className="flex flex-col md:flex-row gap-2 md:gap-4">
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
						<Select
							className="w-48 md:w-28"
							value={sort}
							onChange={(e) => setSort(e.target.value)}>
							<option value="desc">Latest</option>
							<option value="asc">Oldest</option>
						</Select>
						<Button
							className="w-48 sm:w-28 focus:ring-1"
							gradientDuoTone={"purpleToPink"}
							onClick={handleSearch}>
							Search
						</Button>
					</div>
				</div>

				<div
					className="flex flex-col w-full items-center justify-center gap-6 lg:gap-10 p-3 lg:p-10 mb-10 
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<h1 className="font-semibold text-center text-3xl">Search Results</h1>
					{speaker.length > 0 && (
						<>
							<div className="flex flex-wrap gap-5 items-center justify-center w-full">
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
						</>
					)}
					{speaker.length === 0 && <p>There are no speakers yet</p>}
				</div>

				<div
					className="flex flex-col w-full items-center justify-center gap-6 lg:gap-10 p-3 lg:p-10 mb-10 lg:mb-20
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
					<h1 className="font-semibold text-center text-2xl">
						Recommended Speakers
					</h1>
					{storage.found &&
						storage.recommended &&
						storage.recommended?.length > 0 &&
						Object.keys(speakerDetails).length > 0 &&
						Object.keys(speakerDetails).length ===
							storage.recommended?.length && (
							<>
								<div className="flex flex-wrap gap-5 items-center justify-center w-full">
									{storage.recommended.map((speakerId) => (
										<CardCRecommend
											key={speakerId}
											speaker={speakerDetails[speakerId]}
										/>
									))}
								</div>
							</>
						)}
					{(!storage.found || storage.recommended?.length === 0) && (
						<p>There are no recommended speakers yet</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default Home;
