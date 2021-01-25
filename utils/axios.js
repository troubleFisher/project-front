import axios from "axios";
import { Modal } from "antd";
import "antd/dist/antd.css";

const instance = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 拦截器(响应拦截)
// 主要做token的管理
instance.interceptors.response.use(
  (response) => {
    let { data } = response;
    if (data.code === -666) {
      Modal.info({
        title: "登陆过期",
        content: (
          <div>
            <p>登陆已过期，请重新登陆</p>
          </div>
        ),
        onOk() {
          localStorage.removeItem("token");
          // redirect("/login");
        },
      });
    }

    return data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 拦截器(请求拦截)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.common["Authorization"] = "Bearer" + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default instance;
