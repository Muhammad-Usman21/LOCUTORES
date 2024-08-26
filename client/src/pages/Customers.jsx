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
    //https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_QiqSecb7nGIXyLyms9A4FYL9vkEiPoy6&scope=read_write&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fstripe-callback&state=123456
    window.location.href = result.url;
  }

  return <div><button onClick={
    func
  }>click</button></div>;
};

export default Customers;
