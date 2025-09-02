import React, { useState, useRef, useEffect } from "react";
import { Card, Input, Button, Typography, Avatar, List, Spin } from "antd";
import { SendOutlined, UserOutlined, RobotOutlined } from "@ant-design/icons";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE_URL = "http://localhost:5000/api";

export default function CareerChatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your career assistant. How can I help with your job search today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = { role: "user", content: inputMessage.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: inputMessage.trim(),
        chatHistory: messages,
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Custom components for ReactMarkdown
  const markdownComponents = {
    h1: ({ node, ...props }) => <Typography.Title level={3} {...props} />,
    h2: ({ node, ...props }) => <Typography.Title level={4} {...props} />,
    h3: ({ node, ...props }) => <Typography.Title level={5} {...props} />,
    p: ({ node, ...props }) => (
      <Typography.Paragraph {...props} style={{ margin: 0 }} />
    ),
    ul: ({ node, ...props }) => (
      <ul {...props} style={{ paddingLeft: 20, margin: "8px 0" }} />
    ),
    ol: ({ node, ...props }) => (
      <ol {...props} style={{ paddingLeft: 20, margin: "8px 0" }} />
    ),
    li: ({ node, ...props }) => <li {...props} style={{ marginBottom: 4 }} />,
    strong: ({ node, ...props }) => (
      <strong {...props} style={{ fontWeight: 600 }} />
    ),
  };

  return (
    <Card style={{ margin: "24px" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <RobotOutlined /> Career Assistant
      </Title>

      <Text>
        Ask me anything about job searching, resumes, interviews, or career
        advice!
      </Text>

      <div
        style={{
          height: "400px",
          overflowY: "auto",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          padding: "16px",
          margin: "16px 0",
          backgroundColor: "#fafafa",
        }}
      >
        <List
          dataSource={messages}
          renderItem={(message, index) => (
            <List.Item
              key={index}
              style={{
                justifyContent:
                  message.role === "user" ? "flex-end" : "flex-start",
                padding: "8px 0",
                border: "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    message.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  maxWidth: "80%",
                }}
              >
                <Avatar
                  icon={
                    message.role === "user" ? (
                      <UserOutlined />
                    ) : (
                      <RobotOutlined />
                    )
                  }
                  style={{
                    backgroundColor:
                      message.role === "user" ? "#1890ff" : "#52c41a",
                    margin:
                      message.role === "user" ? "0 0 0 12px" : "0 12px 0 0",
                  }}
                />
                <div
                  style={{
                    backgroundColor:
                      message.role === "user" ? "#1890ff" : "#f0f0f0",
                    color: message.role === "user" ? "white" : "black",
                    padding: "12px 16px",
                    borderRadius: "18px",
                    maxWidth: "100%",
                    overflow: "hidden",
                  }}
                >
                  {message.role === "assistant" ? (
                    <ReactMarkdown components={markdownComponents}>
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {message.content}
                    </div>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />

        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              padding: "8px 0",
            }}
          >
            <Avatar
              icon={<RobotOutlined />}
              style={{ backgroundColor: "#52c41a", marginRight: "12px" }}
            />
            <div
              style={{
                padding: "12px",
                borderRadius: "18px",
                backgroundColor: "#f0f0f0",
              }}
            >
              <Spin size="small" /> Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <TextArea
          rows={2}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your career question here..."
          disabled={loading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          loading={loading}
          disabled={!inputMessage.trim()}
          style={{ height: "auto" }}
        >
          Send
        </Button>
      </div>
    </Card>
  );
}
