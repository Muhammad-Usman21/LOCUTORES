import { useEffect } from "react";

const Customers = () => {
  useEffect(() => {
    localStorage.setItem("orderInfo", JSON.stringify([]));
  }
    , []);

  const func = async () => {

    const data = {
      speaker: {
        _id: "123456"
      }
    };
    const response = await fetch(`/api/auth/signin-stripe?speakerId=${data.speaker._id}`);
    const result = await response.json();
    console.log(result);
    window.location.href = result.url;
  }

  return <div><button onClick={
    func
  }>click</button></div>;
};

export default Customers;
