import ReactAudioPlayer from "react-audio-player";
import ReactPlayer from "react-player";
import { useState } from "react";
import { Button } from "flowbite-react";
import Flag from "react-world-flags";
import { TiThMenuOutline } from "react-icons/ti";
import { IoMdClose } from "react-icons/io";
import { countries } from "countries-list";
import { Link } from "react-router-dom";

const CardCRecommend = ({ speaker }) => {
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
					<Link to={`/speaker/${speaker._id}`}>
						<div className="h-[180px] w-full bg-slate-400">
							<img
								src={speaker.image}
								alt="img"
								className="h-[180px] w-full object-cover
                    		hover:scale-105 transition-scale duration-300"
							/>
						</div>
						<div className="flex gap-2 my-4 items-center justify-center">
							<Link to={`/speaker/${speaker._id}`}>
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
					</Link>
				</div>
			)}
		</>
	);
};

export default CardCRecommend;
