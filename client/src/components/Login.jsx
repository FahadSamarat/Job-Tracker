import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography, Divider } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Assume you have firebase configured
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3}>Welcome Back</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form name="login" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              loading={loading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider>Or</Divider>

        <div style={{ textAlign: "center" }}>
          <Text>Don't have an account? </Text>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => navigate("/register")}
          >
            Create one now
          </Button>
        </div>
      </Card>
    </div>
  );
}
