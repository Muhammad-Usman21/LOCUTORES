import { Footer } from "flowbite-react";
import { Link } from "react-router-dom";
import {
	BsFacebook,
	BsInstagram,
	BsTwitter,
	BsTwitterX,
	BsGithub,
	BsLinkedin,
	BsDiscord,
} from "react-icons/bs";

const FooterComp = () => {
	return (
		<Footer
			container
			className="rounded-none border-t-4 border-teal-700 dark:border-[#374151] bg-cover bg-center 
			bg-[url('../../h&f-light.jpg')] dark:bg-[url('../../footer-dark.jpg')]">
			<div className="w-full max-w-7xl mx-auto">
				<div className="flex flex-col items-center gap-4 w-full sm:flex-row sm:justify-between">
					<div className="mt-4 sm:mt-0">
						<Link
							to="/"
							className="font-semibold dark:text-white text-md sm:text-xl flex items-center">
							<img
								src="logo3.png"
								alt="logo"
								className="object-cover w-20 h-20 sm:w-24 sm:h-24"
							/>
							<img
								src="logo2.png"
								alt="logo"
								className="object-cover h-8 sm:h-14"
							/>
							{/* <span className="ml-1 text-xl sm:ml-2 sm:3xl">CASEVOX</span> */}
						</Link>
					</div>
					<div
						className="flex flex-col gap-3 md:flex-row md:gap-8 sm:gap-10 mt-4 sm:mt-0 text-center dark:shadow-whiteLg
						bg-transparent border-2 border-white/20 backdrop-blur-[9px] rounded-lg shadow-xl px-7 py-4">
						{/* <div>
							<Footer.LinkGroup col className="space-y-2">
								<div className="flex flex-col gap-3 md:gap-8 md:flex-row">
									<Link to="/instructions">Instructions</Link>
								</div>
							</Footer.LinkGroup>
						</div> */}
						<div>
							<Footer.LinkGroup col className="space-y-2">
								<div className="flex gap-8 md:gap-8 md:flex-row justify-around">
									<Link to="/practice">Guiones para practicar</Link>
									<Link to="/about">¿Quiénes somos?</Link>
								</div>
							</Footer.LinkGroup>
						</div>
						<div>
							<Footer.LinkGroup col className="space-y-2">
								<div className="flex gap-8 md:gap-8 md:flex-row justify-around">
									<Link to="/privacy">Política de privacidad</Link>
									<Link to="/legal">Términos legales</Link>
								</div>
							</Footer.LinkGroup>
						</div>
					</div>
				</div>
				{/* <Footer.Divider />
				<div className="flex flex-col justify-center items-center gap-4 sm:flex-row sm:justify-between sm:px-2">
					<Footer.Copyright
						href="/"
						by="CaseVox"
						year={new Date().getFullYear()}
					/>
					<div className="flex gap-4">
						<Footer.Icon href="#" icon={BsFacebook} />
						<Footer.Icon href="#" icon={BsInstagram} />
					</div>
				</div> */}
			</div>
		</Footer>
	);
};

export default FooterComp;
