import { Alert, Button, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { MdCancelPresentation } from "react-icons/md";
import { useSelector } from "react-redux";

const CreatePost = () => {
	const [publishErrorMsg, setPublishErrorMsg] = useState(null);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({});
	const navigate = useNavigate();
	const { theme } = useSelector((state) => state.theme);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setPublishErrorMsg(null);
		setLoading(true);

		if (!formData.title || !formData.content) {
			setLoading(false);
			setPublishErrorMsg("Title and Content are required fields!");
		}

		try {
			const res = await fetch("/api/post/create-post", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});
			const data = await res.json();
			if (!res.ok) {
				setLoading(false);
				setPublishErrorMsg(data.message);
				return;
			} else {
				setLoading(false);
				setPublishErrorMsg(null);
				navigate(`/annoucements`);
			}
		} catch (error) {
			setPublishErrorMsg(error.message);
			setLoading(false);
		}
	};

	return (
		<div
			className="min-h-screen bg-cover bg-center py-14 
			bg-[url('../../bg-light.jpg')] dark:bg-[url('../../bg-dark.jpg')]">
			<div
				className="flex flex-col gap-4 px-7 max-w-3xl mx-7 sm:p-10 sm:mx-12 md:mx-auto dark:shadow-whiteLg
				bg-transparent border-2 border-white/40 dark:border-white/20 backdrop-blur-[9px] rounded-lg shadow-xl">
				<h1 className="text-center text-3xl mb-4 font-semibold">
					Create a Post
				</h1>
				<form
					className={`flex flex-col gap-4 ${theme}`}
					onSubmit={handleSubmit}>
					<div className="flex flex-col gap-4 sm:flex-row justify-between">
						<TextInput
							type="text"
							placeholder="Title"
							required
							id="title"
							className="flex-1"
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
						/>
					</div>

					<ReactQuill
						theme="snow"
						placeholder="Write something...."
						className="h-72 mb-16 sm:mb-12"
						required
						onChange={(value) => setFormData({ ...formData, content: value })}
					/>
					<Button
						type="submit"
						gradientDuoTone="purpleToPink"
						outline
						className="focus:ring-1 uppercase"
						disabled={loading}>
						{loading ? (
							<>
								<Spinner size="sm" />
								<span className="pl-3">Loading...</span>
							</>
						) : (
							"Publish"
						)}
					</Button>
				</form>
				{publishErrorMsg && (
					<Alert className="flex-auto" color="failure" withBorderAccent>
						<div className="flex justify-between">
							<span>{publishErrorMsg}</span>
							<span className="w-5 h-5">
								<MdCancelPresentation
									className="cursor-pointer w-6 h-6"
									onClick={() => setPublishErrorMsg(null)}
								/>
							</span>
						</div>
					</Alert>
				)}
			</div>
		</div>
	);
};

export default CreatePost;
