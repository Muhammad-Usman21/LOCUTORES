import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Courses from "./pages/Courses";
import Podcast from "./pages/Podcast";
import Services from "./pages/Services";
import Speaker from "./pages/Speaker";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<Header />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/sign-in" element={<SignIn />} />
				<Route path="/sign-up" element={<SignUp />} />
				<Route element={<PrivateRoute />}>
					<Route path="/dashboard" element={<Dashboard />} />
				</Route>
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
