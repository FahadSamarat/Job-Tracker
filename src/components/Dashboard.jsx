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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

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
      
      setApplications(prev => [...prev, newApplication]);
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
      setApplications(prev => prev.map(app => 
        app.id === editingApplication.id 
          ? { ...app, ...values }
          : app
      ));

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
      setApplications(prev => prev.filter(app => app.id !== id));

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

        {error && (
          <div style={{ marginBottom: 16, color: "red" }}>
            {error}
          </div>
        )}

        <Table
          dataSource={filteredApplications}
          columns={columns}
          loading={loading}
          rowKey="id"
          locale={{
            emptyText: "No job applications found. Add your first application!"
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
            <Button onClick={handleCancel}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}