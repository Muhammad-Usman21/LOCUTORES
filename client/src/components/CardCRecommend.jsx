import { Link } from "react-router-dom";

const CardCRecommend = ({ speaker }) => {
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
						<div className="flex gap-2 my-4 items-center justify-center bg-opacity-25">
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
