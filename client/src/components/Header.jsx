import {
	Avatar,
	Button,
	Dropdown,
	DropdownDivider,
	Navbar,
} from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { HiMoon, HiSun } from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signOutSuccess } from "../redux/user/userSlice";
import { useEffect, useState } from "react";
import { IoIosNotifications } from "react-icons/io";


const Header = () => {
	const path = useLocation().pathname;
	const { currentUser } = useSelector((state) => state.user);
	const dispatch = useDispatch();
	const { theme } = useSelector((state) => state.theme);

	const [hasNewUpdates, setHasNewUpdates] = useState(false);


	useEffect(() => {
		if(!currentUser) return;
		const checkForOrderUpdates = async () => {
			const storedOrderInfo = JSON.parse(localStorage.getItem('orderInfo'));
			if (!storedOrderInfo) return;

			const response = await fetch('/api/order/orders-notifications');
			const data = await response.json();
			console.log(data);

			const hasUpdates = data.some(order => {
				const storedOrder = storedOrderInfo.find(stored => stored.id === order._id);
				if (!storedOrder) return true;
				return storedOrder && (storedOrder.status !== order.status || new Date(storedOrder.updatedAt) < new Date(order.updatedAt));
			});
			console.log(hasUpdates);
			setHasNewUpdates(hasUpdates);
		};

		checkForOrderUpdates();

		const interval = setInterval(checkForOrderUpdates, 120000);

		return () => clearInterval(interval);
	}, []);

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
		<Navbar className="border-b-2 border-teal-600 lg:px-14 bg-cover bg-center sticky top-0 z-30">
			<Link
				to="/"
				className="font-semibold dark:text-white text-md sm:text-xl flex items-center">
				<span className="ml-1 text-xl sm:ml-2 sm:3xl">LOCUTORES</span>
			</Link>
			<div className=" flex gap-2 md:order-2 items-center">
				<Button
					className="w-8 h-8 sm:w-10 sm:h-10 focus:ring-1 items-center bg-transparent border-teal-400"
					color="gray"
					pill
					onClick={() => dispatch(toggleTheme())}>
					{theme === "light" ? <HiMoon /> : <HiSun />}
				</Button>
				{currentUser ? (
					<Dropdown
						className={`z-40 ${theme}`}
						arrowIcon={false}
						inline
						label={
							<Avatar img={currentUser.profilePicture} alt="user" rounded />
						}>
						<Dropdown.Header>
							<span className="block text-sm">{currentUser.name}</span>
							<span className="block text-sm font-medium">
								{currentUser.email}
							</span>
						</Dropdown.Header>
						<Link to={"/dashboard?tab=user"}>
							<Dropdown.Item>Dashboard</Dropdown.Item>
						</Link>
						<DropdownDivider />
						<Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
					</Dropdown>
				) : (
					<Link to="/sign-in">
						<Button
							gradientDuoTone="purpleToBlue"
							outline
							className="focus:ring-1">
							Sign In
						</Button>
					</Link>
				)}
				<Navbar.Toggle />
			</div>
			<Navbar.Collapse className={`${theme}`}>
				<Navbar.Link className="h-0 p-0 m-0"></Navbar.Link>
				<Link to="/">
					<Navbar.Link active={path === "/"} as={"div"}>
						Home
					</Navbar.Link>
				</Link>
				<Link to="/orders" onClick={() => setHasNewUpdates(false)} >
					<Navbar.Link active={path === "/orders"} as={"div"}>
						Orders {hasNewUpdates && <IoIosNotifications className="text-red-500 inline-block" />}
					</Navbar.Link>
				</Link>
				<Link to="/customers">
					<Navbar.Link active={path === "/customers"} as={"div"}>
						Customers
					</Navbar.Link>
				</Link>
				<Link to="/speaker">
					<Navbar.Link active={path === "/speaker"} as={"div"}>
						Are you a speaker?
					</Navbar.Link>
				</Link>
				<Link to="/podcast">
					<Navbar.Link active={path === "/podcast"} as={"div"}>
						Podcast
					</Navbar.Link>
				</Link>
				<Link to="/courses">
					<Navbar.Link active={path === "/courses"} as={"div"}>
						Courses
					</Navbar.Link>
				</Link>
			</Navbar.Collapse>
		</Navbar>
	);
};

export default Header;
