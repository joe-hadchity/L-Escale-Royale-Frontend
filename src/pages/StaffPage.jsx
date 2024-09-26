import React from 'react';
import Sidebar from '../components/staff/Sidebar';
import StaffHome from '../components/staff/StaffHome';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../components/staff/Dashboard';
import Order from '../components/staff/Order';
import Grosspage from '../components/staff/GrossPage'

const StaffPage = () => {
    return (
        <div className="staff-page">
            <Sidebar />
            <div className="staff-content">
                <Routes>
                    <Route path="/" element={<StaffHome />} />
                    <Route path='/dashboard' element={<Dashboard/>}/>
                    <Route path="/order" element={<Order />} />
                    <Route path="/gross" element={<Grosspage />} />
                    
                </Routes>
            </div>
        </div>
    );
};

export default StaffPage;
