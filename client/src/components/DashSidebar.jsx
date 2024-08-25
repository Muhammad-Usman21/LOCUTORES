import { Sidebar } from "flowbite-react";
import { useEffect, useState } from "react";
import { HiArrowSmRight, HiUser } from "react-icons/hi";
import { RiUserVoiceFill } from "react-icons/ri";
import { Link, useLocation } from "react-router-dom";
import { signOutSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const DashSidebar = () => {
	const { currentUser } = useSelector((state) => state.user);
	const location = useLocation();
	const [tab, setTab] = useState("");
	const dispatch = useDispatch();
	const { theme } = useSelector((state) => state.theme);

	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		const tabFromUrl = urlParams.get("tab");
		// console.log(tabFromUrl);
		if (tabFromUrl) {
			setTab(tabFromUrl);
		}
	}, [location.search]);

	const handleSignOut = async () => {
		try {
			const res = await fetch("/api/auth/signout", {
				method: "POST",
			});

			const data = await res.json();
			if (!res.ok) {
				return console.log(data.message);
			} else {
				dispatch(signOutSuccess(data));
			}
		} catch (error) {
			console.log(error.message);
		}
	};

	return (
		<Sidebar className={`w-full md:w-64 ${theme}`}>
			<Sidebar.Items>
				<Sidebar.ItemGroup className="flex flex-col">
					<Link to="/dashboard?tab=user">
						<Sidebar.Item active={tab === "user"} icon={HiUser} as="div">
							User
						</Sidebar.Item>
					</Link>
					{currentUser.isSpeaker ? (
						<Link to="/dashboard?tab=edit-speaker">
							<Sidebar.Item
								active={tab === "edit-speaker"}
								icon={RiUserVoiceFill}
								as="div">
								Speaker
							</Sidebar.Item>
						</Link>
					) : (
						<Link to="/dashboard?tab=speaker">
							<Sidebar.Item
								active={tab === "speaker"}
								icon={RiUserVoiceFill}
								as="div">
								Speaker
							</Sidebar.Item>
						</Link>
					)}
					<Sidebar.Item
						icon={HiArrowSmRight}
						className="cursor-pointer"
						onClick={handleSignOut}>
						Sign Out
					</Sidebar.Item>
				</Sidebar.ItemGroup>
			</Sidebar.Items>
		</Sidebar>
	);
};

export default DashSidebar;
