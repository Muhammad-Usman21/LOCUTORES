# Voice Over Web Application

-----

## Description
This is a **full-stack MERN web application** that connects **customers** with **speakers** to facilitate voice-over orders. Customers can place orders, specify their requirements, and receive completed audio files from speakers. **Users can create speaker accounts**, where they can showcase their demos, set pricing for different services, and receive orders. **Admins** can manage users, monitor orders, and handle subscriptions.

---

## Features

### For Customers:
- **Create Account & Profile**: Register, manage personal information, and update profiles.
- **Order Creation**: Specify voice-over requirements (e.g., service type, audio duration, amount) and place orders.
- **Order Tracking**: Monitor the status of orders and communicate with speakers.

### For Speakers:
- **Speaker Profile**: Create a profile, showcase demo samples, and set pricing for different order sizes.
- **Order Fulfillment**: Accept or reject customer orders and upload completed audio files.
- **Communication**: Communicate directly with customers regarding order specifics.
- **Subscription Management**: Subscribe to premium plans through Stripe for additional features.

### Admin Panel:
- **User Management**: Admins can view, and delete user accounts (customers and speakers).
- **Premium User Control**: Assign or revoke premium status for speakers.
- **Order Oversight**: Track the status of voice-over orders and ensure smooth platform operation.

---

## Technologies Used
- **Frontend**: React.js
- **Backend**: Node.js with Express.js  
- **Database**: MongoDB  
- **Authentication**: Firebase Authentication (email/password & Google Auth)  
- **Payment Processing**: Stripe  
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS, Flowbite

---

## Installation

Follow these steps to set up the project locally:

- ### Clone the Repository

First, clone the repository:

```bash
git clone https://github.com/Muhammad-Usman21/LOCUTORES.git
cd LOCUTORES
```

- ### Install Dependencies

For backend dependencies:
```bash
npm install
```
For frontend dependencies:
```bash
cd client
npm install
```

- ### Set Up Environment Variables

In the ***root*** directory, create a `.env` file with the following environment variables:
```env
MONGO="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret_key"
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_CLIENT_ID="your_stripe_client_id"
CLIENT_URL="http://localhost:3000"  # For local development
PREMIUM_AMOUNT=20  # The price for the premium subscription

```

Then in the ***client*** directory, create a `.env` file with the following environment variables:
```env
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_STRIPE_PUBLIC_KEY="your_stripe_public_key"
```

- ### Run the Servers
To run the ***backend*** server, in ***root*** directory use the following command:
```bash
npm run dev
```

To run the ***frontend*** server, in ***client*** directory use the following command:
```bash
cd client
npm run dev
```

