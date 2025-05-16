import React from "react"
import { Route, Routes, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserdashBoard";
import InvoiceDashboard from "./pages/InvoiceDashboard"

import { ToastContainer} from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';




function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/users" element={isAuthenticated ? <UserDashboard /> : <Navigate to="/" />} />
        <Route path="/invoices" element={isAuthenticated ? <InvoiceDashboard /> : <Navigate to="/" />} />
      </Routes>
      <ToastContainer />
    </>
  )
}

export default App
