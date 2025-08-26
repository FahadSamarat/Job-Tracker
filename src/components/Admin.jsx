import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { Table, Card, Typography, Tag, Button, Alert } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { onAuthStateChanged } from "firebase/auth";

const { Title, Text } = Typography;

export default function Admin() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchAllApplications();
      } else {
        setError("You must be logged in to access this page");
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const fetchAllApplications = async () => {
    try {
      setLoading(true);
      setError("");

      // Get all applications ordered by creation date
      const q = query(
        collection(db, "jobApplications"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const apps = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        apps.push({
          id: doc.id,
          ...data,
          // Add safe date handling
          createdAt: data.createdAt || new Date(),
        });
      });

      setApplications(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError(`Failed to fetch applications: ${error.message}`);

      if (error.code === "permission-denied") {
        setError(
          "Permission denied. You need admin privileges to view all applications."
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      render: (userId) => <Text copyable>{userId?.substring(0, 8)}...</Text>,
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
  ];

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
          <Title level={2}>All Job Applications</Title>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAllApplications}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            style={{ marginBottom: 16 }}
            showIcon
            closable
            onClose={() => setError("")}
          />
        )}

        {applications.length === 0 && !loading && !error && (
          <Alert
            message="No Applications Found"
            description="There are no job applications in the database yet."
            type="info"
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}

        <Table
          dataSource={applications}
          columns={columns}
          loading={loading}
          rowKey="id"
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
}
