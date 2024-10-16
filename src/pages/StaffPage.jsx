import React from 'react';
import Sidebar from '../components/staff/Sidebar';
import StaffHome from '../components/staff/StaffHome';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../components/staff/Dashboard';
import Order from '../components/staff/Order';
import Grosspage from '../components/staff/GrossPage'
import Payment from '../components/staff/Payment'
import History from '../components/staff/History'
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
                    <Route path="/payment" element={<Payment />}/>
                    <Route path="/history" element={<History />}/>
                </Routes>
            </div>
        </div>
    );
};

export default StaffPage;
