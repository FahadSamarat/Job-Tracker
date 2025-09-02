import "./App.css";
import "@ant-design/v5-patch-for-react-19";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Admin from "./components/Admin";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { Layout, Spin } from "antd";
import Navbar from "./components/Navbar";

import ResumeHelper from "./components/ResumeHelper";
import JobAnalyzer from "./components/JobAnalyzer";
import CareerChatbot from "./components/Chatbot";

const { Content } = Layout;

function AppLayout({ children }) {
  return (
    <Layout>
      <Navbar />
      <Content style={{ minHeight: "100vh" }}>{children}</Content>
    </Layout>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <Spin
            size="large"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          />
        }
        persistor={persistor}
      >
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              <Route
                path="/resume-helper"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ResumeHelper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/job-analyzer"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <JobAnalyzer />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chatbot"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CareerChatbot />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AppLayout>
                      <Admin />
                    </AppLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
