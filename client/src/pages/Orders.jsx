import { useEffect, useState } from "react";
import OrderCard from "../components/OrderCard";

const Orders = () => {
	const [orders, setOrders] = useState([]);
	console.log(orders);

	useEffect(() => {
		const fetchOrders = async () => {
			const response = await fetch("/api/order/orders");
			const data = await response.json();
			setOrders(data);

			const orderInfo = data.map((order) => ({
				id: order._id,
				status: order.status,
				updatedAt: order.updatedAt,
			}));
			localStorage.setItem("orderInfo", JSON.stringify(orderInfo));
		};

		fetchOrders();
	}, []);

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
				{orders.map((order) => (
					<div
						key={order._id}
						className="order-card flex w-full p-10 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
						<OrderCard order={order} orderUpdated={orderUpdated} />
					</div>
				))}
			</div>
		</div>
	);
};

export default Orders;
