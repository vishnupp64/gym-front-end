import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  Layers,
  BarChart3,
  Settings,
  ClipboardList,
  Salad,
  Calendar,
  TrendingUp,
  Bell,
  UserCircle,
  Wallet,
  Building2,
  BellRing,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '../types';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: string;
}

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/fee-reminders', label: 'Multi-Gym Fee Reminders', icon: BellRing, badge: 'Due' },
  { to: '/admin/gyms', label: 'Gym Branches', icon: Building2 },
  { to: '/admin/members', label: 'Members', icon: Users },
  { to: '/admin/trainers', label: 'Trainers', icon: Dumbbell },
  { to: '/admin/plans', label: 'Membership Plans', icon: Layers },
  { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/admin/attendance-insights', label: 'Attendance Insights', icon: BarChart3 },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/trainer-payments', label: 'Trainer Salaries', icon: Wallet },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const trainerNav: NavItem[] = [
  { to: '/trainer', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/trainer/members', label: 'Assigned Members', icon: Users },
  { to: '/trainer/workouts', label: 'Workout Plans', icon: ClipboardList },
  { to: '/trainer/diets', label: 'Diet Plans', icon: Salad },
  { to: '/trainer/schedule', label: 'Schedule', icon: Calendar },
  { to: '/trainer/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/trainer/progress', label: 'Member Progress', icon: TrendingUp },
  { to: '/trainer/payments', label: 'My Salary', icon: Wallet },
  { to: '/trainer/settings', label: 'Settings', icon: Settings },
];

const memberNav: NavItem[] = [
  { to: '/member', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/member/fee-reminders', label: 'My Gym Fees & Reminders', icon: BellRing, badge: 'Fees' },
  { to: '/member/membership', label: 'My Memberships', icon: Layers },
  { to: '/member/attendance', label: 'My Attendance', icon: CalendarCheck },
  { to: '/member/workouts', label: 'Workout Plans', icon: ClipboardList },
  { to: '/member/diets', label: 'Diet Plans', icon: Salad },
  { to: '/member/payments', label: 'Payment History', icon: CreditCard },
  { to: '/member/notifications', label: 'Notifications', icon: Bell },
  { to: '/member/profile', label: 'Profile', icon: UserCircle },
];

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  ADMIN: adminNav,
  TRAINER: trainerNav,
  MEMBER: memberNav,
};
