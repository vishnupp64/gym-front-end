export type Role = 'ADMIN' | 'TRAINER' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  avatarUrl?: string;
}

export interface Gym {
  id: string;
  name: string;
  code: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  monthlyTarget?: number;
  _count?: {
    members: number;
    feeReminders: number;
    payments: number;
  };
}

export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'FROZEN' | 'CANCELLED';
export type FeeStatus = 'PAID' | 'DUE_SOON' | 'OVERDUE' | 'UPCOMING' | 'PENDING';
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'BIWEEKLY';

export interface MembershipPlan {
  id: string;
  gymId?: string;
  name: string;
  price: number;
  duration: number;
  description?: string | null;
  features?: string[];
  isActive?: boolean;
  isPopular?: boolean;
}

export interface MembershipBreak {
  id: string;
  memberId: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface AttendanceInsights {
  totalMembersAnalyzed: number;
  highAttendanceCount: number;
  moderateAttendanceCount: number;
  inactiveCount: number;
  inactiveMembers: {
    memberId: string;
    fullName: string;
    email: string;
    phone?: string;
    gymName: string;
    visitCount30Days: number;
    lastVisitDate: string;
    daysSinceLastVisit: number;
    status: string;
  }[];
}

export interface Member {
  id: string;
  userId: string;
  gymId?: string;
  gymName?: string;
  fullName: string;
  email: string;
  phone: string;
  plan: string;
  feeAmount?: number;
  nextDueDate?: string;
  billingCycle?: BillingCycle;
  feeStatus?: FeeStatus;
  status: MembershipStatus;
  totalFrozenDays?: number;
  joinDate: string;
  expiryDate: string;
  emergencyContact?: string;
  address?: string;
  avatarUrl?: string;
  breaks?: MembershipBreak[];
}

export interface FeeReminder {
  id: string;
  memberId: string;
  gymId: string;
  gym?: Gym;
  member?: Member & { user?: User };
  title: string;
  amount: number;
  dueDate: string;
  billingCycle: BillingCycle;
  status: FeeStatus;
  reminderDaysBefore: number;
  autoSend: boolean;
  lastSentAt?: string;
  notes?: string;
  createdAt: string;
}

export interface FeeSummary {
  overdueCount: number;
  overdueAmount: number;
  dueSoonCount: number;
  dueSoonAmount: number;
  paidCount: number;
  paidAmount: number;
  totalGyms: number;
  totalMonthlyCommitment: number;
}

export interface Trainer {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  yearsOfExperience: number;
  salary?: number;
  rating?: number;
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
}

export type PaymentStatus =
  | 'PAID'
  | 'PENDING'
  | 'PENDING_VERIFICATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'FAILED'
  | 'REFUNDED';
export type PaymentMethod = 'CARD' | 'CASH' | 'BANK_TRANSFER' | 'UPI';

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  gymId?: string;
  gymName?: string;
  memberEmail?: string;
  membershipPlanId?: string | null;
  planName?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
  dueDateFor?: string;
  transactionId?: string | null;
  screenshotUrl?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
}

export type TrainerPaymentStatus = 'PAID' | 'PENDING';

export interface TrainerPayment {
  id: string;
  trainerId: string;
  trainerName: string;
  trainerEmail?: string;
  amount: number;
  status: TrainerPaymentStatus;
  paymentDate: string;
  notes?: string | null;
}

export interface WorkoutPlan {
  id: string;
  memberId: string;
  memberName?: string;
  trainerId?: string | null;
  trainerName?: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface DietPlan {
  id: string;
  memberId: string;
  memberName?: string;
  trainerId?: string | null;
  trainerName?: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface LoginResponse {
  user: User;
  token: string;
}

