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
import Payment from "./pages/Payment";

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
					<Route path="/speaker/:id" element={<Speaker />} />
				</Route>
				<Route path="/payment" element={<Payment/>} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
