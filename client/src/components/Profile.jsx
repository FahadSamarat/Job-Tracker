import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { Button, Card, Typography, Space, Divider } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={2}>Profile</Title>
        </div>

        {userData && (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Text strong>Name:</Text>
              <br />
              <Text>
                <UserOutlined /> {userData.username}
              </Text>
            </div>

            <div>
              <Text strong>Email:</Text>
              <br />
              <Text>{userData.email}</Text>
            </div>

            <div>
              <Text strong>Role:</Text>
              <br />
              <Text>{userData.role || "user"}</Text>
            </div>

            <Divider />

            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              block
            >
              Logout
            </Button>
          </Space>
        )}
      </Card>
    </div>
  );
}
