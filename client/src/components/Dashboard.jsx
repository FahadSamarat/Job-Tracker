import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Table,
  Select,
  Space,
  Typography,
  Modal,
  Tag,
  message,
  Spin,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const { Title, Text } = Typography;
const { Option } = Select;
const API_BASE_URL = "http://localhost:5000/api";

// Dashboard Insights Component
function DashboardInsights({ applications }) {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      if (applications.length === 0) {
        setInsights("");
        return;
      }

      setLoading(true);
      setError("");
      const stats = {
        applied: applications.filter((app) => app.status === "applied").length,
        interview: applications.filter((app) => app.status === "interview")
          .length,
        rejected: applications.filter((app) => app.status === "rejected")
          .length,
        hired: applications.filter((app) => app.status === "hired").length,
      };

      const jobTitles = [...new Set(applications.map((app) => app.position))];

      try {
        const response = await axios.post(`${API_BASE_URL}/career-insights`, {
          stats,
          jobTitles,
        });

        setInsights(response.data.insights);
      } catch (err) {
        console.error("Error fetching insights:", err);
        setError(
          err.response?.data?.error ||
            "Failed to load insights. Please try again later."
        );
        setInsights("");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [applications]);

  // Custom components for ReactMarkdown
  const markdownComponents = {
    h1: ({ node, ...props }) => <Title level={4} {...props} />,
    h2: ({ node, ...props }) => <Title level={5} {...props} />,
    h3: ({ node, ...props }) => (
      <Text strong {...props} style={{ display: "block", marginTop: 8 }} />
    ),
    p: ({ node, ...props }) => (
      <Text
        {...props}
        style={{ display: "block", marginBottom: 8, lineHeight: 1.6 }}
      />
    ),
    ul: ({ node, ...props }) => (
      <ul {...props} style={{ paddingLeft: 20, margin: "8px 0" }} />
    ),
    ol: ({ node, ...props }) => (
      <ol {...props} style={{ paddingLeft: 20, margin: "8px 0" }} />
    ),
    li: ({ node, ...props }) => (
      <li {...props} style={{ marginBottom: 4, lineHeight: 1.6 }} />
    ),
    strong: ({ node, ...props }) => (
      <strong {...props} style={{ fontWeight: 600 }} />
    ),
  };

  if (applications.length === 0) {
    return (
      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>
          <BulbOutlined /> AI Career Insights
        </Title>
        <Text>Start adding job applications to get personalized insights!</Text>
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: 24 }}>
      <Title level={3}>
        <BulbOutlined /> AI Career Insights
      </Title>

      {loading && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <Spin />
          <Text style={{ display: "block", marginTop: 8 }}>
            Analyzing your job search progress...
          </Text>
        </div>
      )}

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

      {insights && !loading && (
        <div style={{ lineHeight: 1.6 }}>
          <ReactMarkdown components={markdownComponents}>
            {insights}
          </ReactMarkdown>
        </div>
      )}

      {!insights && !loading && !error && applications.length > 0 && (
        <Text>
          No insights available at the moment. Please try again later.
        </Text>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [userId, setUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchApplications(user.uid);
      } else {
        navigate("/login");
      }
    });

    return unsubscribe;
  }, [navigate, statusFilter]);

  const fetchApplications = async (userId) => {
    try {
      setLoading(true);
      setError("");
      let q;

      if (statusFilter === "all") {
        q = query(
          collection(db, "jobApplications"),
          where("userId", "==", userId)
        );
      } else {
        q = query(
          collection(db, "jobApplications"),
          where("userId", "==", userId),
          where("status", "==", statusFilter)
        );
      }

      const querySnapshot = await getDocs(q);
      const apps = [];
      querySnapshot.forEach((doc) => {
        apps.push({ id: doc.id, ...doc.data() });
      });

      setApplications(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError("Failed to fetch applications. Please check your connection.");
      message.error("Failed to fetch applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (values) => {
    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "jobApplications"), {
        ...values,
        userId,
        createdAt: new Date(),
      });

      // Add to local state
      const newApplication = {
        id: docRef.id,
        ...values,
        userId,
        createdAt: new Date(),
      };

      setApplications((prev) => [...prev, newApplication]);
      message.success("Application created successfully!");
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error creating application:", error);
      message.error("Failed to create application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateApplication = async (values) => {
    setSubmitting(true);
    try {
      await updateDoc(
        doc(db, "jobApplications", editingApplication.id),
        values
      );

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === editingApplication.id ? { ...app, ...values } : app
        )
      );

      message.success("Application updated successfully!");
      setEditingApplication(null);
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error updating application:", error);
      message.error("Failed to update application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteApplication = async (id) => {
    try {
      await deleteDoc(doc(db, "jobApplications", id));

      // Remove from local state
      setApplications((prev) => prev.filter((app) => app.id !== id));

      message.success("Application deleted successfully!");
    } catch (error) {
      console.error("Error deleting application:", error);
      message.error("Failed to delete application. Please try again.");
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingApplication(null);
    form.resetFields();
  };

  const handleEdit = (application) => {
    setEditingApplication(application);
    form.setFieldsValue(application);
    setIsModalVisible(true);
  };

  // Filter applications based on status filter
  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter((app) => app.status === statusFilter);

  const columns = [
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "applied") color = "blue";
        if (status === "interview") color = "orange";
        if (status === "rejected") color = "red";
        if (status === "hired") color = "green";

        return <Tag color={color}>{status?.toUpperCase() || "UNKNOWN"}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (timestamp) => {
        try {
          if (timestamp?.toDate) {
            return timestamp.toDate().toLocaleDateString();
          } else if (timestamp instanceof Date) {
            return timestamp.toLocaleDateString();
          } else {
            return "Invalid date";
          }
        } catch (error) {
          return "Error parsing date";
        }
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteApplication(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (loading && applications.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <DashboardInsights applications={applications} />

      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={2}>Job Applications</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
            Add Application
          </Button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Select
            value={statusFilter}
            style={{ width: 200 }}
            onChange={(value) => setStatusFilter(value)}
          >
            <Option value="all">All Statuses</Option>
            <Option value="applied">Applied</Option>
            <Option value="interview">Interview</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="hired">Hired</Option>
          </Select>
        </div>

        {error && <div style={{ marginBottom: 16, color: "red" }}>{error}</div>}

        <Table
          dataSource={filteredApplications}
          columns={columns}
          loading={loading}
          rowKey="id"
          locale={{
            emptyText: "No job applications found. Add your first application!",
          }}
        />
      </Card>

      <Modal
        title={editingApplication ? "Edit Application" : "Add Application"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={
            editingApplication
              ? handleUpdateApplication
              : handleCreateApplication
          }
        >
          <Form.Item
            name="company"
            label="Company"
            rules={[
              { required: true, message: "Please input the company name!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true, message: "Please input the position!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select a status!" }]}
          >
            <Select>
              <Option value="applied">Applied</Option>
              <Option value="interview">Interview</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="hired">Hired</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginRight: 8 }}
              loading={submitting}
            >
              {editingApplication ? "Update" : "Create"}
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
