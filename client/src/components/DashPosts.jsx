import { Button, Modal, Spinner, Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const DashPosts = () => {
	const { currentUser } = useSelector((state) => state.user);
	const { theme } = useSelector((state) => state.theme);
	const [userPosts, setUserPosts] = useState([]);
	const [showMore, setShowMore] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [postIdToDelete, setPostIdToDelete] = useState(null);
	const [getPostsLoading, setGetPostsLoading] = useState(false);

	useEffect(() => {
		setGetPostsLoading(true);
		const fetchPosts = async () => {
			try {
				const res = await fetch(
					`/api/post/getposts-public?userId=${currentUser._id}&limit=10`
				);
				const data = await res.json();
				if (res.ok) {
					setUserPosts(data);
					if (data.length < 10) {
						setShowMore(false);
					}
					setGetPostsLoading(false);
				}
			} catch (error) {
				console.log(error.message);
				setGetPostsLoading(false);
			}
		};

		if (currentUser) {
			fetchPosts();
		}
	}, [currentUser._id]);

	const handleShowMore = async () => {
		const startIndex = userPosts.length;
		try {
			const res = await fetch(
				`/api/post/getposts-public?userId=${currentUser._id}&startIndex=${startIndex}&limit=10`
			);
			const data = await res.json();
			if (res.ok) {
				setUserPosts((prevPosts) => [...prevPosts, ...data]);
				if (data.length < 10) {
					setShowMore(false);
				}
			}
		} catch (error) {
			console.log(error.message);
		}
	};

	const handleDeletePostSubmit = async (e) => {
		e.preventDefault();
		setShowModal(false);
		try {
			const res = await fetch(
				`/api/post/delete-post/${postIdToDelete}/${currentUser._id}`,
				{
					method: "DELETE",
				}
			);
			const data = await res.json();
			if (!res.ok) {
				console.log(data.message);
			} else {
				setUserPosts((prevPosts) =>
					prevPosts.filter((post) => post._id !== postIdToDelete)
				);
			}
		} catch (error) {
			console.log(error.message);
		}
	};

	return (
		<div
			className="p-5 w-full bg-cover bg-center min-h-screen flex flex-col
			bg-[url('../../bg-light.jpg')] dark:bg-[url('../../bg2-dark.jpg')]">
			{getPostsLoading ? (
				<div className="flex mt-20 justify-center">
					<Spinner size="xl" />
				</div>
			) : userPosts.length > 0 ? (
				<>
					<div
						className="overflow-x-scroll p-4 xl:overflow-visible md:max-w-md lg:max-w-5xl w-full mx-auto
					scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300
					 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500 dark:shadow-whiteLg
					 bg-transparent border-2 border-white/40 dark:border-white/20 rounded-lg shadow-xl">
						<Table
							hoverable
							className="backdrop-blur-[9px] bg-transparent border-2 border-white/20 
							rounded-lg shadow-lg dark:shadow-whiteLg">
							<Table.Head className=" xl:sticky xl:top-[60px]">
								<Table.HeadCell>Fecha de creación</Table.HeadCell>
								<Table.HeadCell>Título de la publicación</Table.HeadCell>
								<Table.HeadCell>Borrar</Table.HeadCell>
							</Table.Head>
							<Table.Body>
								{userPosts.map((post) => (
									<Table.Row key={post._id} className="border border-gray-400">
										<Table.Cell>
											{new Date(post.createdAt).toLocaleDateString()}
										</Table.Cell>
										<Table.Cell>
											<span className="text-gray-900 dark:text-gray-300 font-semibold">
												{post.title}
											</span>
										</Table.Cell>
										<Table.Cell>
											<button
												onClick={() => {
													setShowModal(true);
													setPostIdToDelete(post._id);
												}}
												className="font-medium text-red-500 hover:cursor-pointer">
												Borrar
											</button>
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table>
						{showMore && (
							<div className="flex w-full">
								<button
									onClick={handleShowMore}
									className="text-teal-400 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500 mx-auto text-sm py-4">
									Mostrar más
								</button>
							</div>
						)}
					</div>
				</>
			) : (
				<div
					className="max-w-xl w-full mx-auto bg-transparent border-2 mt-10 dark:shadow-whiteLg
				border-white/40 dark:border-white/20 rounded-lg shadow-lg backdrop-blur-[9px]">
					<p className="p-10 text-center">Aún no tienes publicaciones</p>
				</div>
			)}
			<div className="max-w-xl self-center w-full my-4">
				<Link to={"/create-post"}>
					<Button
						type="button"
						gradientDuoTone="purpleToPink"
						className="uppercase focus:ring-1 mt-4 w-full">
						Crear una nueva publicación
					</Button>
				</Link>
			</div>

			<Modal
				className={`${theme}`}
				show={showModal}
				onClose={() => {
					setShowModal(false);
				}}
				popup
				size="lg">
				<Modal.Header />
				<Modal.Body>
					<form
						className={`flex flex-col text-center ${theme}`}
						onSubmit={handleDeletePostSubmit}>
						<div className="flex items-center mb-8 gap-8 self-center">
							<HiOutlineExclamationCircle className="h-14 w-14 text-gray-500 dark:text-gray-200" />
							<span className="text-2xl text-gray-600 dark:text-gray-200">
							Eliminar publicación
							</span>
						</div>
						<h3 className="my-5 text-lg text-gray-600 dark:text-gray-300">
						¿Estás seguro de que deseas eliminar esta publicación?
						</h3>
						<div className="flex justify-around">
							<Button type="submit" color="failure" className="focus:ring-1">
								{"Si estoy seguro"}
							</Button>
							<Button
								type="button"
								color="gray"
								onClick={() => setShowModal(false)}
								className="focus:ring-1 dark:text-gray-300">
								No, cancelar
							</Button>
						</div>
					</form>
				</Modal.Body>
			</Modal>
		</div>
	);
};

export default DashPosts;
