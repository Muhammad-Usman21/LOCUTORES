import ReactAudioPlayer from "react-audio-player";
import ReactPlayer from "react-player";
import { useState } from "react";
import { Button } from "flowbite-react";
import Flag from "react-world-flags";
import { TiThMenuOutline } from "react-icons/ti";
import { IoMdClose } from "react-icons/io";
import { countries } from "countries-list";
import { Link } from "react-router-dom";

const CardComponent = ({ speaker }) => {
	const [isMenuVisible, setIsMenuVisible] = useState(false);
	console.log(speaker);
	const handleMenuToggle = () => {
		setIsMenuVisible((prevState) => !prevState);
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
		<>
			{speaker && (
				<div
					className="bg-gray-300 dark:bg-gray-700 shadow-xl hover:shadow-2xl dark:shadow-whiteLg transition-shadow 
            			overflow-hidden rounded-lg w-full md:w-[360px] flex flex-col justify-center relative">
					<Link to={`/speaker/${speaker.slug}`}>
						<div className="h-[180px] w-full bg-slate-400">
							{/* {speaker.videos?.length !== 0 ? (
							<ReactPlayer
								url={speaker.videos[0]}
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
								className="react-player"
							/>
						) : (
							<img
								src={speaker.image}
								alt="img"
								className="h-[180px] w-full object-cover
                    		hover:scale-105 transition-scale duration-300"
							/>
						)} */}
							<img
								src={speaker.image}
								alt="img"
								className="h-[180px] w-full object-cover
                    		hover:scale-105 transition-scale duration-300"
							/>
						</div>
					</Link>
					<div className="flex gap-2 mt-2 items-center justify-center">
						<Link to={`/speaker/${speaker.slug}`}>
							<span className="text-lg">{speaker.userId.name}</span>
						</Link>
						{speaker.userId.isPremium && (
							<img
								className="w-7 h-7"
								src="../../icons8-blue-tick.svg"
								alt="Premium"
							/>
						)}
					</div>
					<div className="p-3 flex flex-col gap-2 w-full">
						<ReactAudioPlayer
							src={speaker.demos.length > 0 ? speaker.demos[0].url : ""} // Get the URL from the first demo object
							controls
							className="w-full"
						/>
					</div>
					<div className="flex flex-row content-evenly justify-evenly">
						<div className=" flex w-[100px] items-center content-center justify-center self-center">
							{isMenuVisible ? (
								<IoMdClose
									size={30}
									className="cursor-pointer z-20 bg-transparent"
									onClick={handleMenuToggle}
								/>
							) : (
								<TiThMenuOutline
									size={30}
									className="cursor-pointer z-20 bg-transparent"
									onClick={handleMenuToggle}
								/>
							)}
						</div>
						<Link
							to={`/speaker/${speaker.slug}`}
							className="w-[300px] self-center mx-5 my-2">
							<Button
								className="w-full"
								pill
								gradientDuoTone={"purpleToPink"}
								outline>
								ELEGIR
							</Button>
						</Link>
						<div className="w-[100px] flex flex-col gap-1 content-center justify-center items-center mr-2">
							<Flag
								code={getCountryCodeFromName(speaker.country)}
								className="w-8"
							/>
							<span className="text-xxs text-center">{speaker.country}</span>
						</div>
					</div>
					<div
						className={`absolute right-0 bottom-0 w-full h-4/5 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center transition-transform duration-300 ease-in-out transform ${
							isMenuVisible ? "translate-y-0" : "translate-y-full"
						}`}>
						{isMenuVisible && (
							<>
								{speaker.demos
									.slice(1, 4) // Extract demos from index 1 to 3
									.map((demo, index) => (
										<ReactAudioPlayer
											key={index}
											src={demo.url} // Access the URL from the demo object
											controls
											className="w-full mb-2 lg:mb-4"
										/>
									))}
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default CardComponent;
