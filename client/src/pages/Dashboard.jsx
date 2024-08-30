import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSidebar from "../components/DashSidebar";
import { useSelector } from "react-redux";
import DashSpeaker from "../components/DashSpeaker";
import DashUser from "../components/DashUser";
import DashEditSpeaker from "../components/DashEditSpeaker";
import Premium from "../components/Premium";
import DashAdmin from "../components/DashAdmin";

const Dashboard = () => {
	const location = useLocation();
	const [tab, setTab] = useState("");
	const [stripeAccountId, setStripeAccountId] = useState("");
	const [updateUser, setUpdateUser] = useState(false);
	const { currentUser } = useSelector((state) => state.user);

	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		const tabFromUrl = urlParams.get("tab");
		const stripeAccountIdFromUrl = urlParams.get("stripeAccountId");
		const updateUserFromUrl = urlParams.get("updateUser");
		// console.log(tabFromUrl);
		if (tabFromUrl) {
			setTab(tabFromUrl);
		}
		if (stripeAccountIdFromUrl) {
			setStripeAccountId(stripeAccountIdFromUrl);
		}
		if (updateUserFromUrl) {
			setUpdateUser(updateUserFromUrl);
		}
	}, [location.search]);

	return (
		<div className="min-h-screen flex flex-col md:flex-row">
			<div className="md:w-64">
				<DashSidebar />
			</div>
			{tab === "user" && <DashUser />}
			{tab === "speaker" && <DashSpeaker stripeAccountId={stripeAccountId} />}
			{currentUser.isSpeaker && tab === "edit-speaker" && (
				<DashEditSpeaker stripeAccountId={stripeAccountId} />
			)}
			{tab === "premium" && <Premium updateUser={updateUser} />}
			{currentUser.isAdmin && tab === "admin" && <DashAdmin />}
			{/* update above line */}
		</div>
	);
};

export default Dashboard;
