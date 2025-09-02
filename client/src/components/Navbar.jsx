import { Layout, Menu, Button, Avatar, Dropdown, Space } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";

const { Header } = Layout;

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "/job-analyzer",
      icon: <UserOutlined />,
      label: "Job Analyzer",
    },
    {
      key: "/chatbot",
      icon: <UserOutlined />,
      label: "Chatbot",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const adminMenuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Admin",
    },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: "0 24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            marginRight: "40px",
            color: "#1890ff",
          }}
        >
          JobTracker
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            border: "none",
            background: "transparent",
          }}
        />
        {user && userRole === "admin" && (
          <Menu
            mode="horizontal"
            items={adminMenuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              border: "none",
              background: "transparent",
            }}
          />
        )}
      </div>

      {user && (
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button type="text" style={{ padding: "4px" }}>
            <Space>
              <Avatar
                icon={<UserOutlined />}
                size="small"
                style={{ backgroundColor: "#87d068" }}
              />
              <span>{user.email}</span>
            </Space>
          </Button>
        </Dropdown>
      )}
    </Header>
  );
}
