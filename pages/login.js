import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Divider } from "antd";
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
  const onFinish = (values) => {
    console.log("Success:", values);
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
          rules={[{ required: true, message: "请填写用户名!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
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
          rules={[{ required: true, message: "请填写密码!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="确认密码"
          name="password1"
          rules={[{ required: true, message: "请填写确认密码!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item {...tailLayout} name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default login;
