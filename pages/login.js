import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useRouter } from "next/router";
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
  const [form] = Form.useForm();
  const router = useRouter();
  const [captchaSrc, setCaptchaSrc] = useState("/api/captcha");
  const [text, setText] = useState("发送");
  const [disabled, setDisabled] = useState(false);

  const onFinish = async (values) => {
    let params = { ...values, password: md5(values.password) };
    let ret = await axios.post("/user/login", params);

    if (ret.code === 0) {
      // 登陆成功，返回token
      localStorage.setItem("token", ret.data.token);
      message.success("登陆成功", 1.5, () => {
        router.push("/userCenter");
      });
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("失败", errorInfo);
    // 失败
  };

  const changeCaptcha = () => {
    const src = "/api/captcha?_t=" + new Date().getTime();
    setCaptchaSrc(src);
  };

  const sendEmailCode = async () => {
    const { getFieldValue } = form;
    const email = getFieldValue("email");
    await axios.get(`/sendCode?email=${email}`);
    let time = 10;
    setDisabled(true);
    setText(`${time}s后再重试`);
    const timer = setInterval(() => {
      time -= 1;
      setText(`${time}s后再重试`);
      if (time === 0) {
        clearInterval(timer);
        setText("发送");
        setDisabled(false);
      }
    }, 1000);
  };

  return (
    <div style={{ width: "80%" }}>
      <Form
        form={form}
        {...layout}
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="邮箱"
          name="email"
          initialValue="951325316@qq.com"
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

        <Form.Item label="邮箱验证">
          <Form.Item
            name="emailCode"
            noStyle
            rules={[{ required: true, message: "请填写邮箱验证码!" }]}
          >
            <Input style={{ width: "70%" }} placeholder="请填写邮箱验证码" />
          </Form.Item>
          <span style={{ margin: "0 8px" }}>
            <Button
              type="primary"
              disabled={disabled}
              onClick={sendEmailCode}
              style={{ width: 120 }}
            >
              {text}
            </Button>
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
