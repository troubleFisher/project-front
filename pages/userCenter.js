import React from "react";
import { Button } from "antd";
import axios from "../utils/axios";
import "antd/dist/antd.css";

const UserCenter = () => {
  const test = async () => {
    const ret = await axios.get("/user/info");
  };

  return (
    <div style={{ width: "80%" }}>
      <Button onClick={test}>test</Button>
    </div>
  );
};

export default UserCenter;
