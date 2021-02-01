import { useState, useRef } from "react";
import { Button, message, Progress } from "antd";
import sparkMD5 from "spark-md5";
import axios from "../utils/axios";
import style from "./style.module.css";
import "antd/dist/antd.css";

const CHUNK_SIZE = 0.1 * 1024 * 1000; //文件切片大小

const UserCenter = () => {
  const [info, setInfo] = useState({});
  const [file, setFile] = useState(null);
  // const [percent, setPercent] = useState(0);
  const [step, setStep] = useState(0);
  const [hashPercent, setHashPercent] = useState(0);
  const [chunkPercent, setChunkPercent] = useState(0);
  const drag = useRef(null);
  const test = async () => {
    const { data } = await axios.get("/user/info");
    setInfo(data);
  };

  const handleFileChange = (e) => {
    setStep(0);
    setChunkPercent(0);
    setHashPercent(0);
    const [file] = e.target.files;
    if (!file) {
      return;
    }
    const step = Math.ceil(file.size / CHUNK_SIZE);
    setStep(step);
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

  const blobToString = async (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function () {
        const ret = reader.result
          .split("")
          .map((v) => v.charCodeAt())
          .map((i) => i.toString(16).toUpperCase())
          .join(" ");
        resolve(ret);
      };
      reader.readAsBinaryString(blob);
    });
  };

  const isGif = async (file) => {
    // 文件头标识(6bytes) 47 49 46 38 39(37) 61
    // GIF89(7)a
    const ret = await blobToString(file.slice(0, 6));
    const isGif = ret === "47 49 46 38 39 61" || ret === "47 49 46 38 37 61";
    return isGif;
  };

  const isPng = async (file) => {
    // 文件头标识 (8bytes) 89 50 4E 47 0D 0A 1A 0A
    const ret = await blobToString(file.slice(0, 8));
    const isPng = ret === "89 50 4E 47 0D 0A 1A 0A";
    return isPng;
  };

  const isJpeg = async (file) => {
    // 文件头标识 (2bytes): $ff, $d8 (SOI) (JPEG文件标识)
    // 文件结束标识 (2bytes): $ff, $d9 (EOI)
    const len = file.size;
    const start = await blobToString(file.slice(0, 2));
    const end = await blobToString(file.slice(-2, len));
    const isJpeg = start === "FF D8" && end === "FF D9";
    return isJpeg;
  };

  const isImage = async (file) => {
    // 通过文件流来判定
    return (await isGif(file)) || (await isPng(file)) || (await isJpeg(file));
  };

  const createFileChunk = (size = CHUNK_SIZE) => {
    const chunks = [];
    let cur = 0;
    while (cur < file.size) {
      chunks.push({ index: cur, file: file.slice(cur, cur + size) });
      cur += size;
    }
    return chunks;
  };

  // const calculateHashWorker = async (chunks) => {
  //   // web worker另开一个线程做计算
  //   return new Promise((resolve) => {
  //     const worker = new Worker("./hash.js");
  //     worker.postMessage({ chunks });
  //     worker.onmessage = (e) => {
  //       const { progress, hash } = e.data;
  //       setHashPercent(Number(progress.toFixed(2)));
  //       if (hash) {
  //         resolve(hash);
  //       }
  //     };
  //   });
  // };

  // const calculateHashIdle = async (chunks) => {
  //   return new Promise((resolve) => {
  //     const spark = new sparkMD5.ArrayBuffer();
  //     let count = 0;

  //     const appendToSpark = (chunk) => {
  //       return new Promise((resolve) => {
  //         const reader = new FileReader();
  //         reader.readAsArrayBuffer(chunk);
  //         reader.onload = (e) => {
  //           spark.append(e.target.result);
  //           resolve();
  //         };
  //       });
  //     };
  //     const workLoop = async (deadline) => {
  //       while (count < chunks.length && deadline.timeRemaining() > 1) {
  //         await appendToSpark(chunks[count].file);
  //         count++;
  //         if (count === chunks.length) {
  //           setHashPercent(100);
  //           resolve(spark.end());
  //         } else {
  //           const progress = Number(((100 * count) / chunks.length).toFixed(2));
  //           setHashPercent(progress);
  //         }
  //       }
  //       window.requestIdleCallback(workLoop);
  //     };
  //     window.requestIdleCallback(workLoop);
  //   });
  // };

  const calculateHashSample = () => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      const spark = new sparkMD5.ArrayBuffer();
      const size = file.size;
      const offset = 0.2 * 1024 * 1024;
      // 第一个区块2M,最后一个区块全要,中间区块取前中后的2字节
      const chunks = [file.slice(0, offset)];
      let cur = offset;
      while (cur < size) {
        if (cur + offset >= size) {
          chunks.push(file.slice(cur, size));
        } else {
          const mid = cur + offset / 2;
          chunks.push(file.slice(cur, cur + 2));
          chunks.push(file.slice(mid - 1, mid + 1));
          chunks.push(file.slice(cur + offset - 2, cur + offset));
        }
        cur += offset;
      }

      reader.readAsArrayBuffer(new Blob(chunks));
      reader.onload = (e) => {
        spark.append(e.target.result);
        setHashPercent(100);
        resolve(spark.end());
      };
    });
  };

  const mergeRequest = async (hash) => {
    await axios.post("/mergeFile", {
      ext: file.name.split(".").pop(),
      size: CHUNK_SIZE,
      hash,
    });
  };

  const sendRequest = (chunks, limit = 4) => {
    return new Promise((resolve, reject) => {
      const len = chunks.length; // 切片长度
      let count = 0;

      const start = async () => {
        const task = chunks.shift();
        if (task) {
          const { form } = task;
          await axios.post("/uploadFile", form, {
            // 不是整体进度条,而是单个进度条,整体进度条需单独计算
            onUploadProgress: (progress) => {
              const partPercent = Number(progress.loaded / progress.total);
              if (partPercent === 1) {
                const currentPercent = Math.ceil(100 / step);
                setChunkPercent(
                  (chunkPercent) => chunkPercent + currentPercent
                );
              }
            },
          });
          if (count == len - 1) {
            // 最后一个任务
            resolve();
          } else {
            count++;
            // 并且启动下一个任务
            start();
          }
        }
      };

      while (limit > 0) {
        //  启动limit个任务
        //  模拟时长不同的启动
        setTimeout(() => {
          start();
        }, Math.random() * 2000);
        limit -= 1;
      }
    });
  };

  const uploadChunks = async (chunksList, uploadedList, hash) => {
    const request = chunksList
      .filter((i) => uploadedList.indexOf(i.name) === -1)
      .map((item) => {
        const form = new FormData();
        form.append("chunk", item.chunk);
        form.append("hash", item.hash);
        form.append("name", item.name);
        const index = item.index;
        return { form, index };
      });
    // 尝试申请TCP链接过多,也会造成卡顿
    // 异步并发数控制
    await sendRequest(request);
    // await Promise.all(request);
    await mergeRequest(hash);
  };

  const upLoad = async () => {
    if (!file) return;
    if (!(await isImage(file))) {
      message.error("文件格式不对！");
      return;
    }

    const chunks = createFileChunk();
    // const hash = await calculateHashWorker(chunks);
    // const hash1 = await calculateHashIdle(chunks);
    // 抽样hash 不算全量
    // 布隆过滤器 牺牲一部分精度换取极大的性能提升（可以做预判断）
    const hash = await calculateHashSample();

    // 判断文件是否上传过，如果没有，是否有存在切片
    const {
      data: { uploaded, uploadedList },
    } = await axios.post("/checkFile", {
      hash,
      ext: file.name.split(".").pop(),
    });

    if (uploaded) {
      // 秒传
      message.success("秒传成功");
      setChunkPercent(100);
      return;
    } else {
      const percent = Math.ceil((uploadedList.length * 100) / step);

      setChunkPercent(percent);
    }
    const chunksList = chunks.map((i, index) => {
      // 切片的名字 hash+index
      const name = hash + "_" + index;
      return {
        hash,
        name,
        index,
        chunk: i.file,
      };
    });

    await uploadChunks(chunksList, uploadedList, hash);

    // const form = new FormData();
    // form.append("name", "file");
    // form.append("file", file);
    // await axios.post("uploadFile", form, {
    //   onUploadProgress: (progress) => {
    //     const progress1 = Number(
    //       ((progress.loaded / progress.total) * 100).toFixed(2)
    //     );
    //     setPercent(progress1);
    //   },
    // });
  };

  return (
    <div style={{ width: "80%" }}>
      <Button onClick={test}>{info.username || "请登录"}</Button>
      <div
        css={{ backgroundColor: "red" }}
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
      {/* <Progress
        percent={percent}
        strokeColor={{
          "0%": "#108ee9",
          "100%": "#87d068",
        }}
      /> */}
      <div>计算hash值的进度条</div>
      <Progress
        percent={hashPercent}
        strokeColor={{
          "0%": "#108ee9",
          "100%": "#87d068",
        }}
      />
      {!!step && (
        <>
          <div>文件切片上传的进度条</div>
          <Progress percent={chunkPercent} steps={step} strokeColor="#52c41a" />
        </>
      )}

      <Button onClick={upLoad}>上传</Button>
    </div>
  );
};

export default UserCenter;
