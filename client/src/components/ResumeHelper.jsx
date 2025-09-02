import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Spin,
  Alert,
  Space,
} from "antd";
import { FileTextOutlined, SendOutlined } from "@ant-design/icons";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE_URL = "http://localhost:5000/api";

export default function ResumeHelper() {
  const [resumeText, setResumeText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!resumeText.trim()) {
      setError("Please enter your resume text");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/resume-feedback`, {
        resumeText: resumeText.trim(),
      });

      setFeedback(response.data.feedback);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to get resume feedback");
    } finally {
      setLoading(false);
    }
  };

  // Custom components for ReactMarkdown
  const markdownComponents = {
    h1: ({ node, ...props }) => <Typography.Title level={3} {...props} />,
    h2: ({ node, ...props }) => <Typography.Title level={4} {...props} />,
    h3: ({ node, ...props }) => <Typography.Title level={5} {...props} />,
    p: ({ node, ...props }) => <Typography.Paragraph {...props} />,
    ul: ({ node, ...props }) => <ul {...props} style={{ paddingLeft: 20 }} />,
    ol: ({ node, ...props }) => <ol {...props} style={{ paddingLeft: 20 }} />,
    li: ({ node, ...props }) => <li {...props} style={{ marginBottom: 4 }} />,
    strong: ({ node, ...props }) => (
      <strong {...props} style={{ fontWeight: 600 }} />
    ),
  };

  return (
    <Card style={{ margin: "24px" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <FileTextOutlined /> Resume Helper
      </Title>

      <Text>
        Paste your resume text below to get AI-powered feedback and improvement
        suggestions.
      </Text>

      <Form layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item label="Resume Text">
          <TextArea
            rows={8}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
            disabled={loading}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={loading}
            disabled={!resumeText.trim()}
          >
            Analyze Resume
          </Button>
        </Form.Item>
      </Form>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setError("")}
        />
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin size="large" />
          <Text style={{ display: "block", marginTop: 8 }}>
            Analyzing your resume...
          </Text>
        </div>
      )}

      {feedback && !loading && (
        <Card title="Resume Feedback" style={{ marginTop: 24 }} type="inner">
          <ReactMarkdown components={markdownComponents}>
            {feedback}
          </ReactMarkdown>
        </Card>
      )}
    </Card>
  );
}
