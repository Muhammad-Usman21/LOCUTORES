const About = () => {
	return (
		<div className="w-full bg-cover bg-center">
			<div
				className="max-w-3xl my-10 mx-7 p-7 sm:mx-12 lg:mx-auto sm:p-10 self-center dark:shadow-whiteLg items-center justify-center flex flex-col
			bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-xl">
				<h1 className="text-2xl font-semibold">Buy Premium</h1>
				<h2>For Speakers</h2>
				<div className="flex flex-col text-justify mt-10 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-xl p-4 dark:shadow-whiteLg">
					<h2 className="text-xl font-semibold">Free Plan</h2>
					<p>Our Free Plan provides everything you need to get started:</p>
					<p className="mt-2">
						<span className="font-semibold">YouTube Links Upload:</span>
						<span>
							{" "}
							You can upload{" "}
							<span className="font-semibold">1 YouTube link</span> to show your
							best content
						</span>
					</p>
					<p>
						<span className="font-semibold">Audio File Uploads:</span>
						<span>
							{" "}
							You can upload up to{" "}
							<span className="font-semibold">4 audio files</span> to give a
							taste of your work.
						</span>
					</p>
					<p className="mt-2">
						This plan is perfect for those who are just beginning their journey
						and want to test without any cost.
					</p>
				</div>
				<div className="flex flex-col text-justify mt-6 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-xl p-4 dark:shadow-whiteLg">
					<h2 className="text-xl font-semibold">Upgrade to Premium</h2>
					<p>
						For those who need more space and flexibility, our Premium Plan
						offers enhanced features:
					</p>
					<p className="mt-2">
						<span className="font-semibold">More YouTube Links:</span>
						<span>
							{" "}
							You can upload up to{" "}
							<span className="font-semibold">10 YouTube links</span> to display
							a broader range of your content.
						</span>
					</p>
					<p>
						<span className="font-semibold">Extended Audio Uploads: </span>
						<span>
							{" "}
							Upload up to <span className="font-semibold">15 audio files</span>
							, allowing you to present a more comprehensive portfolio.
						</span>
					</p>
					<p className="mt-2">
						Ready to unlock these additional features?{" "}
						<span className="font-semibold">Upgrade to Premium</span> today and
						take your account to the next level!
					</p>
				</div>
			</div>
		</div>
	);
};

export default About;
