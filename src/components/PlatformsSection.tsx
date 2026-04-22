import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Platform, Proposal } from '../App';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PlatformsSectionProps {
  platforms: Platform[];
  proposals: Proposal[];
  selectedMonth: string;
}

export function PlatformsSection({ platforms, proposals, selectedMonth }: PlatformsSectionProps) {
  const monthProposals = proposals.filter(p => p.date.startsWith(selectedMonth));

  const platformStats = platforms.map(platform => {
    const platformProposals = monthProposals.filter(p => p.platform === platform.name);
    const closedProposals = platformProposals.filter(p => p.isClosed);
    const totalEarnings = closedProposals.reduce((sum, p) => sum + p.value, 0);
    const commissionCost = totalEarnings * (platform.commission / 100);
    const netEarnings = totalEarnings - commissionCost - platform.planPrice;
    const profitMargin = totalEarnings > 0 ? ((netEarnings / totalEarnings) * 100) : 0;

    return {
      ...platform,
      totalEarnings,
      netEarnings,
      commissionCost,
      profitMargin,
      proposalCount: platformProposals.length,
    };
  });

  const getProfitBadge = (margin: number) => {
    if (margin >= 80) return { label: 'Excellent', color: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800' };
    if (margin >= 60) return { label: 'Good', color: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800' };
    if (margin >= 40) return { label: 'Fair', color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800' };
    return { label: 'Low', color: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800' };
  };

  const getPlanBadge = (planType: string) => {
    const badges: Record<string, string> = {
      'Free': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700',
      'Plus': 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800',
      'Pro': 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800',
    };
    return badges[planType] || badges.Free;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Platform Performance</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Compare profitability across platforms</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {platformStats.map((platform) => {
            const profitBadge = getProfitBadge(platform.profitMargin);
            const chartData = [{ value: platform.totalEarnings }];

            return (
              <div
                key={platform.id}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {platform.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getPlanBadge(platform.planType)}`}>
                        {platform.planType}
                      </span>
                      {platform.planPrice > 0 && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          ${platform.planPrice}/mo
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${profitBadge.color}`}>
                    {profitBadge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Earnings</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      ${platform.totalEarnings.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Net Earnings</p>
                    <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                      ${platform.netEarnings.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Commission: <span className="font-medium text-gray-900 dark:text-white">{platform.commission}%</span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Proposals: <span className="font-medium text-gray-900 dark:text-white">{platform.proposalCount}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {platform.netEarnings > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        <Cell fill={platform.netEarnings > 0 ? '#10b981' : '#6b7280'} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
