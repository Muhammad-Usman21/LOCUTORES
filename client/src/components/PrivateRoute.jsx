import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PrivateRoute = () => {
	const { currentUser } = useSelector((state) => state.user);

	if (!currentUser) {
		toast.error("Please sign in to continue.");
		return <Navigate to="sign-in" />;
	}

	return <Outlet />;
};

export default PrivateRoute;
