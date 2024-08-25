import { Button, FileInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { useSelector } from 'react-redux';
import { app } from "../firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

const Orders = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await fetch('/api/order/orders');
      const data = await response.json();
      setOrders(data);

      const orderInfo = data.map(order => ({
        id: order._id,
        status: order.status,
        updatedAt: order.updatedAt,
      }));
      localStorage.setItem('orderInfo', JSON.stringify(orderInfo));

    }

    fetchOrders();
  }, []);


  const handleFileUpload = async (orderId) => {
    if (!file) return;

    // Initialize Firebase storage
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Track the upload progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Upload failed:", error);
      },
      async () => {
        // Handle successful uploads
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("File available at", downloadURL);

        // Update the order in your backend with the file URL and status
        const response = await fetch(`/api/order/orders/${orderId}/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audioFile: downloadURL }),
        });

        if (response.ok) {
          console.log("Order updated successfully");
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === orderId
                ? { ...order, status: "Completed", audioFile: downloadURL }
                : order
            )
          );
        } else {
          console.error("Failed to update order");
        }
      }
    );
  };

  return (
    <div>
      <h1>Your Orders</h1>
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <p><strong>Service:</strong> {order.service}</p>
          <p><strong>Audio Duration:</strong> {order.audioDuration}</p>
          <p><strong>Status:</strong> {order.status}</p>


          {order.status === 'Completed' && (
            <ReactAudioPlayer
              src={order.audioFile}
              controls
              className="w-full"
            />
          )}

          {order.speakerId._id === currentUser._id && (order.status === 'Completed' || order.status === 'Pending Delivery')(
            <div>
              <FileInput
                type="file"
                accept="audio/mp3"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full sm:w-auto"
              />
              <Button
                type="button"
                gradientDuoTone="purpleToBlue"
                size="sm"
                outline
                className="focus:ring-1 w-full sm:w-auto"
                onClick={() => handleFileUpload(order._id)}
              // disabled={
              // 	imageUploadProgress ||
              // 	loading ||
              // 	imageUploading ||
              // 	audioUploading
              // }
              >
                {order.status === 'Completed' ? 'Update' : 'Confirm'}
              </Button>
            </div>
          )}

        </div>
      ))}
    </div>
  );
};

export default Orders;
