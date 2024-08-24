import { loadStripe } from "@stripe/stripe-js";

const Payment = () => {

    const makePayment = async () => {
        const stripe = await loadStripe("pk_test_51PrLnjISagHb5Xr13f8PuJs7EFOwxi5jIXxS4l0DTdT4vGtW6N8m09YOCckaR6vglbqEZitXvNFyoUOhSgR1EpUF00d7wABlaO");
        const response = await fetch("/api/payment/create-checkout-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: 100,
            }),
        });
        const session = await response.json();
        const result = await stripe.redirectToCheckout({
            sessionId: session.id,
        });

        if (result.error) {
            console.error(result.error.message);}
            
    }
    return <div>
        <button onClick={makePayment}>Checkout</button>
    </div>;
};

export default Payment;