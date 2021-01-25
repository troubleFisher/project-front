import React, { useState } from "react";
import md5 from "md5";
import { Form, Input, Button, message } from "antd";
import { useRouter } from "next/router";
import axios from "../utils/axios";
import "antd/dist/antd.css";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const register = () => {
  const [captchaSrc, setCaptchaSrc] = useState("/api/captcha");
  const router = useRouter();
  const onFinish = async (values) => {
    let params = { ...values, password: md5(values.password) };
    let ret = await axios.post("/user/register", params);

    if (ret.code === 0) {
      message.success("注册成功", 1.5, () => {
        router.push("/login");
      });
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
          label="用户名"
          name="username"
          initialValue="张三"
          rules={[{ required: true, message: "请填写用户名!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          initialValue="124@qq.com"
          rules={[
            { required: true, message: "请填写邮箱!" },
            { type: "email" },
          ]}
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
          rules={[
            {
              required: true,
              pattern: /^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![\W_]+$)\S{6,16}$/,
              message: "请填写密码!",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="确认密码"
          name="password1"
          initialValue="123@123"
          rules={[
            {
              required: true,
              message: "请填写确认密码!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("两次密码不匹配!");
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            注册
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default register;
