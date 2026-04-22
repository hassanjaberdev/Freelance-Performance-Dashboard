import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { PlatformsSection } from './components/PlatformsSection';
import { ProposalsSection } from './components/ProposalsSection';
import { TargetAchievement } from './components/TargetAchievement';
import { AddProposalModal } from './components/AddProposalModal';

export interface Platform {
  id: string;
  name: string;
  planType: 'Free' | 'Plus' | 'Pro';
  planPrice: number;
  commission: number;
}

export interface Proposal {
  id: string;
  date: string;
  platform: string;
  title: string;
  hasDiscussion: boolean;
  isClosed: boolean;
  value: number;
}

export interface DashboardData {
  monthlyTarget: number;
  platforms: Platform[];
  proposals: Proposal[];
}

const DEFAULT_PLATFORMS: Platform[] = [
  { id: '1', name: 'Upwork', planType: 'Plus', planPrice: 49.99, commission: 10 },
  { id: '2', name: 'Fiverr', planType: 'Pro', planPrice: 29.99, commission: 20 },
  { id: '3', name: 'Toptal', planType: 'Free', planPrice: 0, commission: 0 },
  { id: '4', name: 'Freelancer', planType: 'Free', planPrice: 0, commission: 10 },
];

const INITIAL_PROPOSALS: Proposal[] = [
  { id: '1', date: '2026-02-01', platform: 'Upwork', title: 'E-commerce Website Development', hasDiscussion: true, isClosed: true, value: 2500 },
  { id: '2', date: '2026-02-03', platform: 'Fiverr', title: 'Logo Design Package', hasDiscussion: true, isClosed: true, value: 450 },
  { id: '3', date: '2026-02-05', platform: 'Upwork', title: 'Mobile App UI/UX', hasDiscussion: true, isClosed: false, value: 0 },
  { id: '4', date: '2026-02-06', platform: 'Toptal', title: 'React Dashboard', hasDiscussion: false, isClosed: false, value: 0 },
  { id: '5', date: '2026-02-08', platform: 'Fiverr', title: 'Brand Identity Design', hasDiscussion: true, isClosed: true, value: 800 },
  { id: '6', date: '2026-02-09', platform: 'Upwork', title: 'WordPress Plugin Development', hasDiscussion: false, isClosed: false, value: 0 },
  { id: '7', date: '2026-02-10', platform: 'Freelancer', title: 'SEO Optimization', hasDiscussion: true, isClosed: false, value: 0 },
];

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [monthlyTarget, setMonthlyTarget] = useState(() => {
    const saved = localStorage.getItem('monthlyTarget');
    return saved ? parseFloat(saved) : 10000;
  });

  const [platforms, setPlatforms] = useState<Platform[]>(() => {
    const saved = localStorage.getItem('platforms');
    return saved ? JSON.parse(saved) : DEFAULT_PLATFORMS;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('proposals');
    return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('monthlyTarget', monthlyTarget.toString());
  }, [monthlyTarget]);

  useEffect(() => {
    localStorage.setItem('platforms', JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem('proposals', JSON.stringify(proposals));
  }, [proposals]);

  const addProposal = (proposal: Omit<Proposal, 'id'>) => {
    const newProposal = {
      ...proposal,
      id: Date.now().toString(),
    };
    setProposals([...proposals, newProposal]);
  };

  const updateProposal = (id: string, updates: Partial<Proposal>) => {
    setProposals(proposals.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProposal = (id: string) => {
    setProposals(proposals.filter(p => p.id !== id));
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          onAddProposal={() => setIsModalOpen(true)}
        />

        <main className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">
              <KPICards
                monthlyTarget={monthlyTarget}
                setMonthlyTarget={setMonthlyTarget}
                proposals={proposals}
                platforms={platforms}
                selectedMonth={selectedMonth}
              />

              <PlatformsSection
                platforms={platforms}
                proposals={proposals}
                selectedMonth={selectedMonth}
              />

              <ProposalsSection
                proposals={proposals}
                selectedMonth={selectedMonth}
                updateProposal={updateProposal}
                deleteProposal={deleteProposal}
              />
            </div>

            <div className="xl:sticky xl:top-8 xl:self-start">
              <TargetAchievement
                proposals={proposals}
                platforms={platforms}
                selectedMonth={selectedMonth}
                monthlyTarget={monthlyTarget}
              />
            </div>
          </div>
        </main>

        {isModalOpen && (
          <AddProposalModal
            platforms={platforms}
            onClose={() => setIsModalOpen(false)}
            onAdd={addProposal}
          />
        )}
      </div>
    </div>
  );
}