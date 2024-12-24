import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Speaker from "./pages/Speaker";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Payment from "./pages/Payment";
import Orders from "./pages/Orders";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ResetPassword from "./components/ResetPassword";
import Instruction from "./pages/Instruction";
import CreatePost from "./pages/CreatePost";
import Annoucements from "./pages/Annoucements";
import FooterComp from "./components/FooterComp";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Legal from "./pages/Legal";
import Practice from "./pages/Practice";

const App = () => {
	return (
		<>
			<ToastContainer />
			<BrowserRouter>
				<ScrollToTop />
				<Header />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/sign-in" element={<SignIn />} />
					<Route path="/sign-up" element={<SignUp />} />
					<Route element={<PrivateRoute />}>
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/orders" element={<Orders />} />
						<Route path="/create-post" element={<CreatePost />} />
						<Route path="/annoucements" element={<Annoucements />} />
					</Route>
					<Route path="/speaker/:slug" element={<Speaker />} />
					<Route path="/payment" element={<Payment />} />
					<Route path="/reset-password" element={<ResetPassword />} />
					<Route path="/instructions" element={<Instruction />} />
					<Route path="/about" element={<About />} />
					<Route path="/privacy" element={<Privacy />} />
					<Route path="/legal" element={<Legal />} />
					<Route path="/practice" element={<Practice />} />
					<Route
						path="*"
						element={
							<h1 className="text-center text-3xl my-20 w-full">
								Página No Encontrada
							</h1>
						}
					/>
				</Routes>
				<FooterComp />
			</BrowserRouter>
		</>
	);
};

export default App;
