import { useEffect } from "react";

const Customers = () => {

  useEffect(() => {
    localStorage.setItem("orderInfo", JSON.stringify([]));
  }
    , []);

  return <div>Customers</div>;
};

export default Customers;
