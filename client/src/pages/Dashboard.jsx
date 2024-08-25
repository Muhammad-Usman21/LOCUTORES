import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSidebar from "../components/DashSidebar";
import { useSelector } from "react-redux";
import DashSpeaker from "../components/DashSpeaker";
import DashUser from "../components/DashUser";
import DashEditSpeaker from "../components/DashEditSpeaker";

const Dashboard = () => {
	const location = useLocation();
	const [tab, setTab] = useState("");
	const { currentUser } = useSelector((state) => state.user);

	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		const tabFromUrl = urlParams.get("tab");
		// console.log(tabFromUrl);
		if (tabFromUrl) {
			setTab(tabFromUrl);
		}
	}, [location.search]);

	return (
		<div className="min-h-screen flex flex-col md:flex-row">
			<div className="md:w-64">
				<DashSidebar />
			</div>
			{tab === "user" && <DashUser />}
			{tab === "speaker" && <DashSpeaker />}
			{tab === "edit-speaker" && <DashEditSpeaker />}
		</div>
	);
};

export default Dashboard;
