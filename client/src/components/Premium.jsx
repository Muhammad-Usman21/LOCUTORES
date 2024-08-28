import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserSuccess } from "../redux/user/userSlice";
import { loadStripe } from "@stripe/stripe-js";



const Premium = ({ updateUser }) => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        const updateUserFunc = async () => {
            if (updateUser) {
                const response = await fetch(`/api/user/getuser/${currentUser._id}`);
                const data = await response.json();
                dispatch(updateUserSuccess(data));
            }
        }
        updateUserFunc();
    }, [updateUser]);

    const handlePremium = async () => {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
        const response = await fetch(`/api/user/subscribe?userId=${currentUser._id}`);
        const session = await response.json();
        const result = stripe.redirectToCheckout({ sessionId: session.id });
        if (result.error) {
            console.error(result.error.message);
        }
    }

    return (
        <div>
            <h1>Premium</h1>
            <p>Get access to premium features!</p>
            <button onClick={handlePremium}>Premium</button>
        </div>
    );
}

export default Premium;