import React, { createContext, useContext, useState, useEffect } from 'react';
import { Gym, FeeSummary } from '../types';

interface GymContextType {
  gyms: Gym[];
  activeGymId: string; // 'ALL' or specific gymId
  setActiveGymId: (id: string) => void;
  activeGym: Gym | null;
  feeSummary: FeeSummary | null;
  refreshGyms: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  isLoading: boolean;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

// Initial fallback mock gyms for smooth immediate presentation
const DEFAULT_GYMS: Gym[] = [
  {
    id: 'gym-1',
    name: 'FitZone Downtown',
    code: 'FZ-01',
    city: 'Downtown Metro',
    address: '102 Main Street, Central Plaza',
    phone: '+91 98765 11111',
    monthlyTarget: 15000,
    _count: { members: 42, feeReminders: 3, payments: 18 },
  },
  {
    id: 'gym-2',
    name: 'CrossFit Apex',
    code: 'CF-02',
    city: 'Uptown Tech Hub',
    address: '505 Innovation Way, Sector 47',
    phone: '+91 98765 22222',
    monthlyTarget: 20000,
    _count: { members: 28, feeReminders: 5, payments: 12 },
  },
  {
    id: 'gym-3',
    name: 'Gold Gym Club',
    code: 'GG-03',
    city: 'Westside Heights',
    address: '88 Ocean Boulevard',
    phone: '+91 98765 33333',
    monthlyTarget: 25000,
    _count: { members: 65, feeReminders: 2, payments: 40 },
  },
];

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gyms, setGyms] = useState<Gym[]>(DEFAULT_GYMS);
  const [activeGymId, setActiveGymId] = useState<string>('ALL');
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>({
    overdueCount: 2,
    overdueAmount: 2798,
    dueSoonCount: 3,
    dueSoonAmount: 3997,
    paidCount: 8,
    paidAmount: 11992,
    totalGyms: 3,
    totalMonthlyCommitment: 18787,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const activeGym = gyms.find((g) => g.id === activeGymId) || null;

  const refreshGyms = async () => {
    setIsLoading(true);
    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiHost}/gyms`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setGyms(json.data);
        }
      }
    } catch (err) {
      console.warn('API unavailable, using multi-gym local state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSummary = async () => {
    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiHost}/fee-reminders/summary?gymId=${activeGymId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setFeeSummary(json.data);
        }
      }
    } catch (err) {
      console.warn('Fee summary fallback active');
    }
  };

  useEffect(() => {
    refreshGyms();
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [activeGymId]);

  return (
    <GymContext.Provider
      value={{
        gyms,
        activeGymId,
        setActiveGymId,
        activeGym,
        feeSummary,
        refreshGyms,
        refreshSummary,
        isLoading,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
