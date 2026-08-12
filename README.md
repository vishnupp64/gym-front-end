# 🎨 Multi-Gym Frontend Web Dashboard

Modern, responsive web dashboard built with React 18, Vite, TypeScript, Lucide Icons, and Tailwind CSS for multi-branch gym owners and individual members.

---

## ✨ Features

- **🌐 Global Multi-Gym Network Switcher**: Top navigation badge dropdown allowing switching between aggregated **All Gyms Network View** and branch-specific views (*FitZone Downtown*, *CrossFit Apex*, *Gold Gym Club*).
- **🔔 Multi-Gym Fee Reminders Hub (`/admin/fee-reminders`)**: Real-time due date tracking, overdue fee highlights, instant WhatsApp/SMS alert sender, and payment receipt settlement.
- **⏸️ Membership Freeze & Date Recalculator**: Pause membership for 15 days, 1 month, 2 months, or custom duration. Automatically previews and recalculates extended expiry & fee due dates.
- **📊 Attendance Insights & Inactive Member Alerts (`/admin/attendance-insights`)**: Frequency score classification (High, Moderate, Inactive/At-Risk members with 0 visits in 14+ days) with one-click re-engagement alerts.
- **👤 Comprehensive Member Profile Modal**: Tabbed drawer for Personal Info, Payment History, Recorded Break History, and Check-In Logs.
- **🏛️ Branch Manager (`/admin/gyms`)**: Overview of all registered locations, member counts, revenue targets, and **Branch Deletion with Member Transfer/Reassignment** prompt.
- **📱 Responsive UI**: Dark mode ready, modern typography, glassmorphism cards, and interactive micro-animations.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Create `.env.local` if custom backend URL is required:
```env
VITE_API_URL="http://localhost:5000/api"
```

### 3. Run Development Server
```bash
npm run dev
```
Open **http://localhost:5173** in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Key Demo Accounts

| Role | Email | Password | Key Feature |
|---|---|---|---|
| **Admin / Gym Owner** | `admin@sector47.app` | `Admin@12345` | Manages multiple gym branches, fee reminders, member reassignment, and attendance reports. |
| **Multi-Gym Member** | `maya@example.com` | `Member@123` | Personal fee tracker enrolled in **FitZone Downtown** & **CrossFit Apex**. |
| **Single Gym Member** | `alex@example.com` | `Member@123` | **Gold Gym Club** VIP member. |

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI cards, modals, tables & layouts
│   ├── dashboard/       # Stat cards, chart cards & metrics
│   ├── layout/          # Navbar with Gym Switcher, Sidebar & PageHeader
│   ├── members/         # MemberDetailModal (Freeze calculator & history tabs)
│   └── ui/              # Buttons, Badges, Modals, Inputs & Dropdowns
├── context/             # GymContext (Active gym branch & fee summary state)
├── pages/               # Page components
│   ├── admin/           # MultiGymFeeReminders, GymManager, AttendanceInsights, AdminMembers, AdminPlans
│   └── member/          # MyMultiGymFees, MemberDashboard, MyAttendance
├── routes/              # AppRoutes & NavConfig role routing
└── types/               # TypeScript interfaces (Gym, Member, FeeReminder, MembershipBreak)
```
