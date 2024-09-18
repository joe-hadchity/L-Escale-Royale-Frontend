import React from 'react';
import Sidebar from '../components/common/Sidebar';
import AdminHome from '../components/admin/AdminHome';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../components/admin/Dashboard';
import UserManagement from '../components/admin/UserManagement';
import ItemManagement from '../components/admin/ItemManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import History from '../components/admin/History';
import SupplierPayments from '../components/admin/SupplierPayments';
import Logout from '../components/admin/Logout';

const AdminPage = () => {
    return (
        <div className="admin-page">
            <Sidebar />
            <div className="admin-content">
                <Routes>
                    <Route path="/" element={<AdminHome />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/user-management" element={<UserManagement />} />
                    <Route path="/item-management" element={<ItemManagement />} />
                    <Route path="/category-management" element={<CategoryManagement />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/supplier-payments" element={<SupplierPayments />} />
                    <Route path="/logout" element={<Logout />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminPage;
