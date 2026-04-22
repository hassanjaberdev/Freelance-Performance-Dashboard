import React, { useState } from 'react';
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  Percent,
  Wallet,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { Proposal, Platform } from '../App';

interface KPICardsProps {
  monthlyTarget: number;
  setMonthlyTarget: (value: number) => void;
  proposals: Proposal[];
  platforms: Platform[];
  selectedMonth: string;
}

export function KPICards({
  monthlyTarget,
  setMonthlyTarget,
  proposals,
  platforms,
  selectedMonth,
}: KPICardsProps) {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(monthlyTarget.toString());

  // Filter proposals for selected month
  const monthProposals = proposals.filter(p => p.date.startsWith(selectedMonth));

  // Calculate metrics
  const totalEarnings = monthProposals
    .filter(p => p.isClosed)
    .reduce((sum, p) => sum + p.value, 0);

  const totalProposals = monthProposals.length;
  const discussions = monthProposals.filter(p => p.hasDiscussion).length;
  const closedProjects = monthProposals.filter(p => p.isClosed).length;
  const conversionRate = totalProposals > 0 ? (closedProjects / totalProposals) * 100 : 0;

  // Calculate net profit (earnings - platform costs)
  const platformCosts = platforms.reduce((sum, platform) => {
    const platformEarnings = monthProposals
      .filter(p => p.isClosed && p.platform === platform.name)
      .reduce((sum, p) => sum + p.value, 0);
    const commissionCost = platformEarnings * (platform.commission / 100);
    return sum + commissionCost + platform.planPrice;
  }, 0);

  const netProfit = totalEarnings - platformCosts;
  const targetAchievement = monthlyTarget > 0 ? (totalEarnings / monthlyTarget) * 100 : 0;

  const handleSaveTarget = () => {
    const newTarget = parseFloat(tempTarget);
    if (!isNaN(newTarget) && newTarget > 0) {
      setMonthlyTarget(newTarget);
      setIsEditingTarget(false);
    }
  };

  const handleCancelEdit = () => {
    setTempTarget(monthlyTarget.toString());
    setIsEditingTarget(false);
  };

  const kpis = [
    {
      id: 'target',
      label: 'Monthly Target',
      value: `$${monthlyTarget.toLocaleString()}`,
      icon: Target,
      color: 'indigo',
      editable: true,
    },
    {
      id: 'earnings',
      label: 'Current Earnings',
      value: `$${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
      trend: totalEarnings > 0 ? 'up' : 'neutral',
    },
    {
      id: 'achievement',
      label: 'Target Achievement',
      value: `${targetAchievement.toFixed(1)}%`,
      icon: TrendingUp,
      color: targetAchievement >= 100 ? 'green' : targetAchievement >= 50 ? 'yellow' : 'red',
      progress: Math.min(targetAchievement, 100),
    },
    {
      id: 'proposals',
      label: 'Total Proposals',
      value: totalProposals.toString(),
      icon: FileText,
      color: 'blue',
    },
    {
      id: 'discussions',
      label: 'Client Discussions',
      value: discussions.toString(),
      icon: MessageSquare,
      color: 'purple',
    },
    {
      id: 'closed',
      label: 'Closed Projects',
      value: closedProjects.toString(),
      icon: CheckCircle,
      color: 'green',
    },
    {
      id: 'conversion',
      label: 'Conversion Rate',
      value: `${conversionRate.toFixed(1)}%`,
      icon: Percent,
      color: conversionRate >= 30 ? 'green' : conversionRate >= 15 ? 'yellow' : 'red',
    },
    {
      id: 'net',
      label: 'Net Profit',
      value: `$${netProfit.toLocaleString()}`,
      icon: Wallet,
      color: netProfit > 0 ? 'green' : 'red',
      subtitle: `After fees & plans`,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; border: string }> = {
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950', icon: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
      green: { bg: 'bg-green-50 dark:bg-green-950', icon: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
      yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950', icon: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
      red: { bg: 'bg-red-50 dark:bg-red-950', icon: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
      blue: { bg: 'bg-blue-50 dark:bg-blue-950', icon: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-950', icon: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const colors = getColorClasses(kpi.color);
        const isTarget = kpi.id === 'target';

        return (
          <div
            key={kpi.id}
            className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 ${colors.bg} rounded-lg border ${colors.border}`}>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              {isTarget && !isEditingTarget && (
                <button
                  onClick={() => setIsEditingTarget(true)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Edit target"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              )}
              {isTarget && isEditingTarget && (
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveTarget}
                    className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                    aria-label="Save target"
                  >
                    <Check className="w-4 h-4 text-green-600" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                    aria-label="Cancel edit"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{kpi.label}</p>
              {isTarget && isEditingTarget ? (
                <input
                  type="number"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  className="w-full px-2 py-1 text-2xl font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  autoFocus
                />
              ) : (
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                  {kpi.value}
                </p>
              )}
              {kpi.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-500">{kpi.subtitle}</p>
              )}
            </div>

            {kpi.progress !== undefined && (
              <div className="mt-3">
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.bg} border-r-2 ${colors.border} transition-all duration-500`}
                    style={{ width: `${kpi.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
