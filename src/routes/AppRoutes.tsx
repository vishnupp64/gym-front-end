import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { homePathForRole } from './roleRoutes';

import Login from '../pages/Login';

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import MultiGymFeeReminders from '../pages/admin/MultiGymFeeReminders';
import GymManager from '../pages/admin/GymManager';
import AdminMembers from '../pages/admin/AdminMembers';
import AdminTrainers from '../pages/admin/AdminTrainers';
import AdminPlans from '../pages/admin/AdminPlans';
import AdminAttendance from '../pages/admin/AdminAttendance';
import AttendanceInsights from '../pages/admin/AttendanceInsights';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminTrainerPayments from '../pages/admin/AdminTrainerPayments';
import AdminReports from '../pages/admin/AdminReports';
import AdminNotifications from '../pages/admin/AdminNotifications';
import AdminSettings from '../pages/admin/AdminSettings';

// Trainer
import TrainerDashboard from '../pages/trainer/TrainerDashboard';
import TrainerMembers from '../pages/trainer/TrainerMembers';
import TrainerWorkouts from '../pages/trainer/TrainerWorkouts';
import TrainerDiets from '../pages/trainer/TrainerDiets';
import TrainerSchedule from '../pages/trainer/TrainerSchedule';
import TrainerAttendance from '../pages/trainer/TrainerAttendance';
import TrainerProgress from '../pages/trainer/TrainerProgress';
import TrainerSettings from '../pages/trainer/TrainerSettings';
import TrainerPayments from '../pages/trainer/TrainerPayments';

// Member
import MemberDashboard from '../pages/member/MemberDashboard';
import MyMultiGymFees from '../pages/member/MyMultiGymFees';
import MyMembership from '../pages/member/MyMembership';
import MyAttendance from '../pages/member/MyAttendance';
import MyWorkouts from '../pages/member/MyWorkouts';
import MyDiets from '../pages/member/MyDiets';
import MyPayments from '../pages/member/MyPayments';
import MyNotifications from '../pages/member/MyNotifications';
import MyProfile from '../pages/member/MyProfile';

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homePathForRole(user.role) : '/login'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Admin */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/fee-reminders" element={<MultiGymFeeReminders />} />
        <Route path="/admin/gyms" element={<GymManager />} />
        <Route path="/admin/members" element={<AdminMembers />} />
        <Route path="/admin/trainers" element={<AdminTrainers />} />
        <Route path="/admin/plans" element={<AdminPlans />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/attendance-insights" element={<AttendanceInsights />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/trainer-payments" element={<AdminTrainerPayments />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* Trainer */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['TRAINER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/trainer" element={<TrainerDashboard />} />
        <Route path="/trainer/members" element={<TrainerMembers />} />
        <Route path="/trainer/workouts" element={<TrainerWorkouts />} />
        <Route path="/trainer/diets" element={<TrainerDiets />} />
        <Route path="/trainer/schedule" element={<TrainerSchedule />} />
        <Route path="/trainer/attendance" element={<TrainerAttendance />} />
        <Route path="/trainer/progress" element={<TrainerProgress />} />
        <Route path="/trainer/payments" element={<TrainerPayments />} />
        <Route path="/trainer/settings" element={<TrainerSettings />} />
      </Route>

      {/* Member */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['MEMBER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/member" element={<MemberDashboard />} />
        <Route path="/member/fee-reminders" element={<MyMultiGymFees />} />
        <Route path="/member/membership" element={<MyMembership />} />
        <Route path="/member/attendance" element={<MyAttendance />} />
        <Route path="/member/workouts" element={<MyWorkouts />} />
        <Route path="/member/diets" element={<MyDiets />} />
        <Route path="/member/payments" element={<MyPayments />} />
        <Route path="/member/notifications" element={<MyNotifications />} />
        <Route path="/member/profile" element={<MyProfile />} />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RootRedirect />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

