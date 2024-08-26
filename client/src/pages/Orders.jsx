import { useEffect, useState } from "react";
import OrderCard from "../components/OrderCard";

const Orders = () => {
	const [orders, setOrders] = useState([]);
	const [showMore, setShowMore] = useState(true);
	// console.log(orders);

	useEffect(() => {
		const fetchOrders = async () => {
			const response = await fetch("/api/order/orders?limit=10");
			const data = await response.json();
			setOrders(data);
			if (data.length < 10) {
				setShowMore(false);
			}

			const res = await fetch("/api/order/orders-notifications");
			const dataNoti = await res.json();
			const orderInfo = dataNoti.map((order) => ({
				id: order._id,
				status: order.status,
				updatedAt: order.updatedAt,
			}));
			localStorage.setItem("orderInfo", JSON.stringify(orderInfo));
		};

		fetchOrders();
	}, []);

	const handleShowMore = async () => {
		const startIndex = orders.length;
		const response = await fetch(
			`/api/order/orders?limit=10&startIndex${startIndex}`
		);
		const data = await response.json();
		setOrders([...orders, ...data]);
		if (data.length < 10) {
			setShowMore(false);
		}

		const orderInfo = data.map((order) => ({
			id: order._id,
			status: order.status,
			updatedAt: order.updatedAt,
		}));
		localStorage.setItem("orderInfo", JSON.stringify(orderInfo));
	};

	const orderUpdated = ({
		orderId,
		status,
		audioFile,
		rejectMessage,
		speakerMessage,
	}) => {
		setOrders((prevOrders) =>
			prevOrders.map((order) =>
				order._id === orderId
					? { ...order, status, audioFile, rejectMessage, speakerMessage }
					: order
			)
		);
	};

	return (
		<div className="min-h-screen w-full">
			<div className="max-w-6xl mx-auto items-center justify-center flex flex-col gap-10 py-14">
				<h1 className="font-semibold text-3xl">Your Orders</h1>
				{orders.length > 0 && (
					<div className="items-center justify-center flex flex-col gap-10">
						{orders.map((order) => (
							<div
								key={order._id}
								className="order-card flex w-full p-10 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
								<OrderCard order={order} orderUpdated={orderUpdated} />
							</div>
						))}
						{showMore && (
							<button
								onClick={handleShowMore}
								className="text-center self-center">
								Show More
							</button>
						)}
					</div>
				)}
				{orders.length === 0 && <p className="">No have no order yet</p>}
			</div>
		</div>
	);
};

export default Orders;
