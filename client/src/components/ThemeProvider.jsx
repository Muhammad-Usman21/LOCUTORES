import { useSelector } from "react-redux";

const ThemeProvider = ({ children }) => {
	const { theme } = useSelector((state) => state.theme);
	return (
		<div className={theme}>
			<div
				className="min-h-screen bg-[url('../../public/light.jpg')] dark:bg-[url('../../public/dark.jpg')] bg-fixed bg-center bg-no-repeat bg-cover text-gray-700
                dark:text-[#f7f8f8]">
				{children}
			</div>
		</div>
	);
};

export default ThemeProvider;
