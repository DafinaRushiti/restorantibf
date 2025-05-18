// src/App.jsx
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/auth';
import LoginAdmin from "./pages/LoginAdmin";
import LoginStaff from "./pages/LoginStaff";
import ManagerPanel from "./pages/ManagerPanel";
import OnlineOrders from "./pages/OnlineOrders";
import WaiterDashboard from "./pages/WaiterDashboard";
import HomePage from './pages/HomePage';
import Checkout from './components/checkout';
import About from './pages/About';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import InventoryManagement from './pages/InventoryManagement';
import Contact from './pages/contact';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<OnlineOrders/>}/>
          <Route path='/login/admin' element={<LoginAdmin/>} />
          <Route path="/login/staff" element={<LoginStaff />} />
          <Route path="/dashboard/waiter" element={<WaiterDashboard />} />
          <Route path="/orders/online" element={<HomePage />} />
          <Route path="/admin/manager" element={<ManagerPanel />} />
          <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin/inventory" element={<InventoryManagement />} />
          <Route path='/orders/online/checkout' element={<Checkout/>}/>
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
