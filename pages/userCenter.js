import React, { useState, useRef } from "react";
import { Button, Progress } from "antd";
import axios from "../utils/axios";
import style from "./style.module.css";
import "antd/dist/antd.css";

const UserCenter = () => {
  const [file, setFile] = useState(null);
  const [percent, setPercent] = useState(0);
  const drag = useRef(null);
  const test = async () => {
    const ret = await axios.get("/user/info");
  };

  const handleFileChange = (e) => {
    const [file] = e.target.files;
    if (!file) {
      return;
    }
    setFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const fileList = e.dataTransfer.files;
    setFile(fileList[0]);
    e.target.style.border = "2px dashed #eee";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.target.style.border = "2px dashed aqua";
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.target.style.border = "2px dashed #eee";
  };

  const upLoad = async () => {
    const form = new FormData();
    form.append("name", "file");
    form.append("file", file);
    await axios.post("uploadFile", form, {
      onUploadProgress: (progress) => {
        const progress1 = Number(
          ((progress.loaded / progress.total) * 100).toFixed(2)
        );
        setPercent(progress1);
      },
    });
  };

  return (
    <div style={{ width: "80%" }}>
      <Button onClick={test}>test</Button>
      <div
        ref={drag}
        id="drag"
        className={style.drag}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input type="file" name="file" onChange={handleFileChange} />
      </div>
      <Progress
        percent={percent}
        strokeColor={{
          "0%": "#108ee9",
          "100%": "#87d068",
        }}
      />
      <Button onClick={upLoad}>上传</Button>
    </div>
  );
};

export default UserCenter;
