import { Link } from "react-router-dom";

const CardCRecommend = ({ speaker }) => {
	return (
		<>
			{speaker && (
				<div
					className="bg-gray-300 dark:bg-gray-700 shadow-xl hover:shadow-2xl dark:shadow-whiteLg transition-shadow 
            			overflow-hidden rounded-lg w-full md:w-[360px] flex flex-col justify-center">
					<Link to={`/speaker/${speaker._id}`}>
						<div className="relative flex">
							<div className="h-[350px] w-full bg-slate-400">
								<img
									src={speaker.image}
									alt="img"
									className="h-[350px] w-full object-cover
                    		hover:scale-105 transition-scale duration-300"
								/>
							</div>
							<div className="absolute bottom-[15%] z-20 w-full flex flex-col items-center justify-center bg-black bg-opacity-50 font-serif text-white dark:text-white">
								<span className="text-3xl">{speaker.userId.name}</span>
								<span className="text-sm">{speaker.country}</span>
							</div>
						</div>
					</Link>
				</div>
			)}
		</>
	);
};

export default CardCRecommend;
