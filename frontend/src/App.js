
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public
import LoginPage from "./pages/LoginPage";

// Admin & VP & Driver
import AdminDashboard from "./pages/AdminDashboard";
import VPDashboard from "./pages/VPDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import VehicleMonitoringPage from "./Module/Dispatch/Pages/VehicleMonitoringPage";

// Dispatch
import DispatchHome from "./Module/Dispatch/Pages/DispatchHome";
import DispatchDashboard from "./Module/Dispatch/Pages/DispatchDashboard";
import AddRoute from "./Module/Dispatch/Pages/AddRoute";
import ViewRoutes from "./Module/Dispatch/Pages/ViewRoutes";
import Drivers from "./Module/Dispatch/Pages/Drivers";
import VehicleStatusImages from "./Module/Dispatch/Pages/VehicleStatusImages";
import CancellationInfo from "./Module/Dispatch/Pages/CancellationInfo";
import VehiclePortalPage from "./Module/Dispatch/Pages/VehiclePortalPage";
import WindowManagerPage from "./Module/Dispatch/Pages/WindowManagerPage";
// Other Dashboards
import ProductionDashboard from "./pages/ProductionDashbaord";
import SiteSupervisorDashboard from "./pages/SiteSupervisorDashboard";
import PurchaseDashboard from "./pages/PurchaseDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboad";
import PowderCoatingDashboard from "./pages/PowderCoatingDashboard";

// Vehicle Requisition
import AddVehicleRequisition from "./Module/Requisition/Pages/AddVehicleRequisition";
import VehicleRequisitionList from "./Module/Requisition/Pages/VehicleRequisitionList";
import LiveTrackingPage from "./Module/Dispatch/Pages/LiveTrackingPage";
import VehicleExpensesPage from "./Module/Dispatch/Pages/VehicleExpensesPage";
import TripHistoryPage from "./Module/Dispatch/Pages/TripHistoryPage";
import ActiveVehiclePage from "./Module/Dispatch/Pages/ActiveVehiclePage";
import InactiveVehiclePage from "./Module/Dispatch/Pages/InActiveVehiclePage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/" element={<LoginPage />} />

                {/* Admin */}
                <Route path="/admin-dashboard" element={<AdminDashboard />} />

                {/* VP */}
                <Route path="/vp-dashboard" element={<VPDashboard />} />

                {/* Driver */}
                <Route path="/driver-dashboard" element={<DriverDashboard />} />

                {/* Dispatch Layout */}
                <Route path="/dispatch-dashboard" element={<DispatchHome />}>
                    {/* Vehicles */}
                    <Route path="vehicles" element={<DispatchDashboard />} />
                    <Route path="active-vehicles" element={<ActiveVehiclePage />} />
                    <Route path="inactive-vehicles" element={<InactiveVehiclePage />} />
                    {/* Routes */}
                    <Route path="routes/add" element={<AddRoute />} />
                    <Route path="routes" element={<ViewRoutes />} />
                    <Route path="routes/history/:tripId" element={<TripHistoryPage />} />
                    <Route path="vehicle-portal" element={<VehiclePortalPage />} />
                    {/* Drivers */}
                    <Route path="drivers" element={<Drivers />} />
                    <Route path="/dispatch-dashboard/vehicle-monitoring" element={<VehicleMonitoringPage />} />
                     <Route path="vehicle-status-images" element={<VehicleStatusImages />} />
                     <Route path="/dispatch-dashboard/routes/cancellation/:id" element={<CancellationInfo />} />
                    {/* Live Tracking */}
                    <Route path="live-tracking" element={<LiveTrackingPage />} />
                    <Route path="expenses" element={<VehicleExpensesPage />} />

                    {/* DC  */}
                    <Route path="/dispatch-dashboard/window-dc" element={<WindowManagerPage />}/>
                </Route>

                {/* Other Dashboards */}
                <Route path="production-dashboard" element={<ProductionDashboard />} />
                <Route path="purchase-dashboard" element={<PurchaseDashboard />} />
                <Route path="site_supervisor-dashboard" element={<SiteSupervisorDashboard />} />
                <Route path="coordinator-dashboard" element={<CoordinatorDashboard />} />
                <Route path="powder_coating-dashboard" element={<PowderCoatingDashboard />} />

                {/* Vehicle Requisition */}
                <Route path="/vehicle-requisition" element={<AddVehicleRequisition />} />
                <Route path="/vehicle-requisition-list" element={<VehicleRequisitionList />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;