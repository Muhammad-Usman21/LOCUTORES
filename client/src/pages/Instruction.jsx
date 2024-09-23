import { useEffect, useState } from "react";

const Instruction = () => {
	const [pdfs, setPdfs] = useState([]);

	useEffect(() => {
		const fetchPdfs = async () => {
			try {
				const response = await fetch("/api/storage/get-storage");
				const data = await response.json();
				console.log(data.pdfs);
				setPdfs(data.pdfs);
			} catch (error) {
				console.log(error.message);
			}
		};
		fetchPdfs();
	}, []);

	return (
		<div className="w-full min-h-screen py-5 lg:py-10">
			<div className="mx-4 lg:mx-20 p-3 lg:p-10 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[20px] rounded-lg shadow-xl">
				<h1 className="text-center text-2xl mb-5 md:mb-10 font-semibold">
				Instrucciones
				</h1>
				<div className="w-full flex flex-wrap gap-10 items-center justify-center">
					{pdfs.map((pdf, index) => (
						<div key={index} className="max-w-xl w-full">
							<iframe
								src={pdf}
								width="100%"
								className="lg:h-[600px] h-[400px]"
								title="PDF Viewer"></iframe>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Instruction;
