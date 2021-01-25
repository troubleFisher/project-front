import axios from "axios";

const instance = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 拦截器(响应拦截)
// 主要做token的管理
instance.interceptors.response.use(
  (response) => {
    let { data } = response;
    return data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 拦截器(请求拦截)
instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
