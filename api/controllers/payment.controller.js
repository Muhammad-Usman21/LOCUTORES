import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

export const createCheckoutSession = async (req, res, next) => {
  const { amount } = req.body;

  console.log(amount);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
  });

  // Create a new order with "Pending Delivery" status
  // const order = new Order({
  //   productId,
  //   userId,
  //   amount,
  //   status: "Pending Delivery",
  //   paymentIntentId: session.payment_intent,
  // });
  // await order.save();

  res.status(200).json(session);
};

export const orderDelivered = async (req, res) => {
  const { orderId, speakerStripeAccountId } = req.body;

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send({ error: "Order not found" });
    }

    if (order.status !== "Pending Delivery") {
      return res.status(400).send({ error: "Order is not pending delivery" });
    }

    // Mark the order as delivered
    order.status = "Delivered";
    await order.save();

    // Transfer funds to the speaker's Stripe-connected account
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const transfer = await stripe.transfers.create({
      amount: order.amount * 100, // amount in cents
      currency: "usd",
      destination: speakerStripeAccountId, // Speaker's Stripe Account ID
      transfer_group: `ORDER_${order._id}`, // Optional: Grouping for related transfers
    });

    res
      .status(200)
      .send({ message: "Order delivered and funds transferred", transfer });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
