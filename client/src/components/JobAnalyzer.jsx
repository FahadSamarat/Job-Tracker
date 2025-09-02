import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Spin,
  Alert,
  List,
  Progress,
  Tag,
} from "antd";
import { SearchOutlined, BarChartOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE_URL = "http://localhost:5000/api";

export default function JobAnalyzer() {
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze-job`, {
        jobDescription: jobDescription.trim(),
      });

      setAnalysis(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to analyze job description"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ margin: "24px" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <BarChartOutlined /> Job Description Analyzer
      </Title>

      <Text>
        Paste a job description to analyze key skills, recommended keywords, and
        get a suitability rating.
      </Text>

      <Form layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item label="Job Description">
          <TextArea
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            disabled={loading}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSubmit}
            loading={loading}
            disabled={!jobDescription.trim()}
          >
            Analyze Job
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
            Analyzing job description...
          </Text>
        </div>
      )}

      {analysis && !loading && (
        <Card title="Analysis Results" style={{ marginTop: 24 }} type="inner">
          {analysis.suitability && (
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Suitability Rating</Title>
              <Progress
                type="circle"
                percent={analysis.suitability}
                format={(percent) => `${percent}%`}
                status={
                  analysis.suitability >= 80
                    ? "success"
                    : analysis.suitability >= 60
                    ? "normal"
                    : "exception"
                }
              />
              {analysis.explanation && (
                <Text style={{ display: "block", marginTop: 8 }}>
                  {analysis.explanation}
                </Text>
              )}
            </div>
          )}

          {analysis.skills && (
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Key Required Skills</Title>
              <List
                dataSource={
                  Array.isArray(analysis.skills)
                    ? analysis.skills
                    : [analysis.skills]
                }
                renderItem={(skill) => (
                  <List.Item>
                    <Tag color="blue" style={{ margin: 4 }}>
                      {skill}
                    </Tag>
                  </List.Item>
                )}
              />
            </div>
          )}

          {analysis.keywords && (
            <div>
              <Title level={4}>Recommended Keywords</Title>
              <List
                dataSource={
                  Array.isArray(analysis.keywords)
                    ? analysis.keywords
                    : [analysis.keywords]
                }
                renderItem={(keyword) => (
                  <List.Item>
                    <Tag color="green" style={{ margin: 4 }}>
                      {keyword}
                    </Tag>
                  </List.Item>
                )}
              />
            </div>
          )}

          {analysis.analysis && typeof analysis.analysis === "string" && (
            <div style={{ marginTop: 24 }}>
              <Title level={4}>Detailed Analysis</Title>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {analysis.analysis}
              </div>
            </div>
          )}
        </Card>
      )}
    </Card>
  );
}
