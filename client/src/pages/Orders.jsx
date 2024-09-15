import { useEffect, useState } from "react";
import OrderCard from "../components/OrderCard";
import { Spinner } from "flowbite-react";

const Orders = () => {
	const [orders, setOrders] = useState([]);
	const [showMore, setShowMore] = useState(true);
	const [loading, setLoading] = useState(true);
	// console.log(orders);

	useEffect(() => {
		const fetchOrders = async () => {
			setLoading(true);
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
			setLoading(false);
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
			<div className="min-w-6xl max-w-6xl mx-auto items-center justify-center flex flex-col gap-4 lg:gap-10 py-5 lg:py-14">
				<h1 className="font-semibold text-xl lg:text-3xl">Tus pedidos</h1>
				{!loading && orders.length > 0 && (
					<div className="w-full items-center justify-center flex flex-col gap-12">
						{orders.map((order) => (
							<div
								key={order._id}
								className="order-card flex flex-col lg:flex-row w-full p-4 lg:p-10 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
								<OrderCard order={order} orderUpdated={orderUpdated} />
							</div>
						))}
						{showMore && (
							<button
								onClick={handleShowMore}
								className="text-center self-center">
								Mostrar más
							</button>
						)}
					</div>
				)}
				{!loading && orders.length === 0 && (
					<p className="">No tengo ningún pedido todavía</p>
				)}
				{loading && (
					<div className="self-center">
						<Spinner size="lg" />
						<span className="pl-3">Cargando...</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default Orders;
