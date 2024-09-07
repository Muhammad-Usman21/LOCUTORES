import { Button, Modal, Spinner, Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { MdEmail } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Flag from "react-world-flags";

const Annoucements = () => {
	const { currentUser } = useSelector((state) => state.user);
	const [getPostsLoading, setGetPostsLoading] = useState(false);
	const [posts, setPosts] = useState([]);
	const [showMore, setShowMore] = useState(false);
	const { theme } = useSelector((state) => state.theme);
	const [showModal, setShowModal] = useState(false);
	const [postIdToDelete, setPostIdToDelete] = useState(null);

	useEffect(() => {
		setGetPostsLoading(true);
		const fetchPosts = async () => {
			try {
				const res = await fetch(`/api/post/getposts-public?limit=10`);
				const data = await res.json();
				if (res.ok) {
					setPosts(data);
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
	}, []);

	const handleShowMore = async () => {
		const startIndex = posts.length;
		try {
			const res = await fetch(
				`/api/post/getposts-public?startIndex=${startIndex}&limit=10`
			);
			const data = await res.json();
			if (res.ok) {
				setPosts((prevPosts) => [...prevPosts, ...data]);
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
				setPosts((prevPosts) =>
					prevPosts.filter((post) => post._id !== postIdToDelete)
				);
			}
		} catch (error) {
			console.log(error.message);
		}
	};

	return (
		<div
			className="p-3 sm:p-5 w-full bg-cover bg-center min-h-screen flex flex-col
			bg-[url('../../bg-light.jpg')] dark:bg-[url('../../bg2-dark.jpg')]">
			{getPostsLoading ? (
				<div className="flex mt-20 justify-center">
					<Spinner size="xl" />
				</div>
			) : posts.length > 0 ? (
				<div className="w-full items-center justify-center flex flex-col gap-12">
					{posts.map((post) => (
						<div
							key={post._id}
							className="max-w-6xl flex flex-col w-full p-3 lg:p-10 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
							{currentUser._id !== post.userId._id && (
								<div className="flex flex-col gap-1 p-5 bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-2xl dark:shadow-whiteLg">
									<span className="text-xl lg:text-2xl text-center mb-3">
										User&apos;s Information
									</span>
									<div className="flex gap-3 sm:justify-around sm:flex-row flex-col">
										<div className="flex items-center gap-3">
											<img
												src={post.userId.profilePicture}
												alt="profile pic"
												className="w-10 h-10 object-cover rounded-full"
											/>
											<span className="text-lg">{post.userId.name}</span>
										</div>
										<div className="flex items-center gap-3">
											<MdEmail className="w-10 h-10" />
											<span className="">{post.userId.email}</span>
										</div>
									</div>
								</div>
							)}
							<div className="flex-auto py-3 lg:py-5 flex flex-col">
								<div className="border w-full rounded-xl p-2 dark:border-gray-700 flex flex-col">
									<span className="text-center w-full text-3xl py-2 lg:py-4 font-semibold max-w-3xl self-center">
										{post.title}
									</span>
									<span className="text-center">
										{new Date(post.createdAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</span>
									<div className="p-3 mt-4">
										<div
											className="w-full post-content"
											dangerouslySetInnerHTML={{ __html: post.content }}></div>
									</div>
								</div>
								{(currentUser._id === post.userId._id ||
									currentUser.isAdmin) && (
									<Button
										type="button"
										onClick={() => {
											setShowModal(true);
											setPostIdToDelete(post._id);
										}}
										gradientDuoTone="purpleToPink"
										className="focus:ring-1 mt-3 mr-3 self-end w-40">
										Delete Post
									</Button>
								)}
							</div>
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
			) : (
				<div
					className="max-w-xl w-full mx-auto bg-transparent border-2 mt-10 dark:shadow-whiteLg
				border-white/40 dark:border-white/20 rounded-lg shadow-lg backdrop-blur-[9px]">
					<p className="p-10 text-center">There are no posts yet</p>
				</div>
			)}

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
								Delete Post
							</span>
						</div>
						<h3 className="my-5 text-lg text-gray-600 dark:text-gray-300">
							Are you sure you want to delete this Post?
						</h3>
						<div className="flex justify-around">
							<Button type="submit" color="failure" className="focus:ring-1">
								{"Yes, i'm sure"}
							</Button>
							<Button
								type="button"
								color="gray"
								onClick={() => setShowModal(false)}
								className="focus:ring-1 dark:text-gray-300">
								No, cancel
							</Button>
						</div>
					</form>
				</Modal.Body>
			</Modal>
		</div>
	);
};

export default Annoucements;
