import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Courses from "./pages/Courses";
import Podcast from "./pages/Podcast";
import Services from "./pages/Services";
import Speaker from "./pages/Speaker";

const App = () => {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<Header />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/customers" element={<Customers />} />
				<Route path="/courses" element={<Courses />} />
				<Route path="/podcast" element={<Podcast />} />
				<Route path="/services" element={<Services />} />
				<Route path="/speaker" element={<Speaker />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
