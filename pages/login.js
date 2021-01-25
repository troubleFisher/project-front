import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "../utils/axios";
import md5 from "md5";

import "antd/dist/antd.css";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const login = () => {
  const [captchaSrc, setCaptchaSrc] = useState("/api/captcha");
  const onFinish = async (values) => {
    let params = { ...values, password: md5(values.password) };
    let ret = await axios.post("/user/login", params);

    if (ret.code === 0) {
      // 登陆成功，返回token
      message.success("登陆成功");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const changeCaptcha = () => {
    const src = "/api/captcha?_t=" + new Date().getTime();
    setCaptchaSrc(src);
  };

  return (
    <div style={{ width: "80%" }}>
      <Form
        {...layout}
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="邮箱"
          name="email"
          initialValue="124@qq.com"
          rules={[{ required: true, message: "请填写邮箱!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="验证码">
          <Form.Item
            name="captcha"
            noStyle
            rules={[{ required: true, message: "请填写验证码!" }]}
          >
            <Input style={{ width: "70%" }} placeholder="请填写验证码" />
          </Form.Item>
          <span style={{ margin: "0 8px" }}>
            <img src={captchaSrc} onClick={changeCaptcha} />
          </span>
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          initialValue="123@123"
          rules={[{ required: true, message: "请填写密码!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            登陆
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default login;
