import ReactAudioPlayer from "react-audio-player";
import ReactPlayer from "react-player";
import { useEffect, useState } from "react";
import { Button, FileInput } from "flowbite-react";

const CardComponent = () => {
	const [file, setFile] = useState(null);
	const [fileUrl, setFileUrl] = useState(null);

	const handleChange = (e) => {
		const filee = e.target.files[0];
		if (filee) {
			setFile(filee);
		}
	};

	// console.log(imageFile, imageFileUrl);

	useEffect(() => {
		if (file) {
			setFileUrl(URL.createObjectURL(file));
		}
	}, [file]);

	return (
		<div
			className="bg-gray-300 dark:bg-gray-700 shadow-xl hover:shadow-2xl transition-shadow 
            overflow-hidden rounded-lg w-full sm:w-[360px] flex flex-col justify-center">
			{/* <FileInput onChange={handleChange} /> */}
			{file?.type.startsWith("image") ? (
				<img
					src={fileUrl}
					alt="img"
					className="h-[320px] sm:h-[200px] w-full object-cover
                    		hover:scale-105 transition-scale duration-300"
				/>
			) : file?.type.startsWith("video") ? (
				<ReactPlayer
					url={fileUrl}
					controls
					className="react-player hover:scale-105 transition-scale duration-300"
				/>
			) : (
				<p>Format not suppoted</p>
			)}
			<div className="p-3 flex flex-col gap-2 w-full">
				<ReactAudioPlayer
					src="../../why mona - Wannabe (Lyrics).mp3"
					controls
					className="w-full"
				/>
			</div>
			<Button
				className="w-[300px] self-center m-5"
				pill
				gradientDuoTone={"purpleToPink"}
				outline>
				CHOOSE
			</Button>
		</div>
	);
};

export default CardComponent;
