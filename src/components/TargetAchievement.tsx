import React from 'react';
import { Target, TrendingUp, DollarSign, Flame, Trophy, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { Platform, Proposal } from '../App';

interface TargetAchievementProps {
  proposals: Proposal[];
  platforms: Platform[];
  selectedMonth: string;
  monthlyTarget: number;
}

export function TargetAchievement({
  proposals,
  platforms,
  selectedMonth,
  monthlyTarget,
}: TargetAchievementProps) {
  const monthProposals = proposals.filter(p => p.date.startsWith(selectedMonth));
  
  // Calculate metrics
  const totalEarnings = monthProposals
    .filter(p => p.isClosed)
    .reduce((sum, p) => sum + p.value, 0);

  const targetAchievement = monthlyTarget > 0 ? (totalEarnings / monthlyTarget) * 100 : 0;
  const remainingAmount = monthlyTarget - totalEarnings;
  
  // Calculate platform costs
  const platformCosts = platforms.reduce((sum, platform) => {
    const platformEarnings = monthProposals
      .filter(p => p.isClosed && p.platform === platform.name)
      .reduce((sum, p) => sum + p.value, 0);
    const commissionCost = platformEarnings * (platform.commission / 100);
    return sum + commissionCost + platform.planPrice;
  }, 0);

  const netProfit = totalEarnings - platformCosts;
  
  // Calculate days remaining in month
  const selectedDate = new Date(selectedMonth + '-01');
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const currentDay = today.getMonth() === month && today.getFullYear() === year ? today.getDate() : daysInMonth;
  const daysRemaining = Math.max(0, daysInMonth - currentDay);
  const daysElapsed = currentDay;
  
  // Calculate projection
  const dailyAverage = daysElapsed > 0 ? totalEarnings / daysElapsed : 0;
  const projectedTotal = dailyAverage * daysInMonth;
  const projectedAchievement = monthlyTarget > 0 ? (projectedTotal / monthlyTarget) * 100 : 0;
  
  // Daily target needed
  const dailyTargetNeeded = daysRemaining > 0 ? remainingAmount / daysRemaining : 0;

  // Best performing platform
  const platformEarnings = platforms.map(platform => ({
    name: platform.name,
    earnings: monthProposals
      .filter(p => p.platform === platform.name && p.isClosed)
      .reduce((sum, p) => sum + p.value, 0),
  }));
  const bestPlatform = platformEarnings.reduce((best, current) => 
    current.earnings > best.earnings ? current : best
  , { name: 'None', earnings: 0 });

  // Proposal streak
  const proposalDates = [...new Set(monthProposals.map(p => p.date))].sort();
  let streak = 0;
  if (proposalDates.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    let currentDate = today;
    
    for (let i = proposalDates.length - 1; i >= 0; i--) {
      if (proposalDates[i] === currentDate) {
        streak++;
        const date = new Date(currentDate);
        date.setDate(date.getDate() - 1);
        currentDate = date.toISOString().split('T')[0];
      } else {
        break;
      }
    }
  }

  // Conversion metrics
  const conversionRate = monthProposals.length > 0
    ? (monthProposals.filter(p => p.isClosed).length / monthProposals.length) * 100
    : 0;

  // Alerts
  const alerts = [];
  if (conversionRate < 10 && monthProposals.length >= 5) {
    alerts.push({
      type: 'warning',
      message: 'Conversion rate below 10%. Review your proposal strategy.',
    });
  }
  
  if (currentDay > daysInMonth / 2 && targetAchievement < 50) {
    alerts.push({
      type: 'danger',
      message: 'Less than 50% of target achieved mid-month. Increase activity.',
    });
  }

  if (daysRemaining > 0 && dailyTargetNeeded > dailyAverage * 3) {
    alerts.push({
      type: 'warning',
      message: `Need $${dailyTargetNeeded.toFixed(0)}/day to reach target. This is ${(dailyTargetNeeded / Math.max(dailyAverage, 1)).toFixed(1)}x your current pace.`,
    });
  }

  const getAchievementColor = (percentage: number) => {
    if (percentage >= 100) return { bg: 'from-green-500 to-emerald-600', text: 'text-green-600 dark:text-green-400', bar: 'bg-green-500' };
    if (percentage >= 75) return { bg: 'from-blue-500 to-indigo-600', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500' };
    if (percentage >= 50) return { bg: 'from-yellow-500 to-orange-600', text: 'text-yellow-600 dark:text-yellow-400', bar: 'bg-yellow-500' };
    return { bg: 'from-red-500 to-pink-600', text: 'text-red-600 dark:text-red-400', bar: 'bg-red-500' };
  };

  const achievementColor = getAchievementColor(targetAchievement);

  return (
    <div className="space-y-4">
      {/* Main Target Achievement */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Target Achievement
          </h3>
        </div>

        {/* Large circular progress */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-40 h-40">
            <svg className="transform -rotate-90 w-40 h-40">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-gray-200 dark:text-gray-800"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#targetGradient)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={`${(Math.min(targetAchievement, 100) / 100) * 440} 440`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="targetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={achievementColor.text} stopColor="currentColor" />
                  <stop offset="100%" className={achievementColor.text} stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${achievementColor.text}`}>
                {Math.round(targetAchievement)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                of target
              </span>
            </div>
          </div>
        </div>

        {/* Target stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Target</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              ${monthlyTarget.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Achieved</span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              ${totalEarnings.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Remaining</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              ${Math.max(0, remainingAmount).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">Net Profit</span>
            <span className={`text-sm font-semibold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ${netProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Projection */}
        {daysElapsed > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Projected End-of-Month
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${Math.round(projectedTotal).toLocaleString()}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({Math.round(projectedAchievement)}%)
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Based on ${dailyAverage.toFixed(0)}/day average
            </p>
          </div>
        )}
      </div>

      {/* Time Stats */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Time Analysis
          </h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Days Elapsed</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {daysElapsed} / {daysInMonth}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${(daysElapsed / daysInMonth) * 100}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Days Remaining</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {daysRemaining}
              </span>
            </div>
          </div>

          {daysRemaining > 0 && remainingAmount > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
                  Daily Target Needed
                </span>
              </div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ${dailyTargetNeeded.toFixed(0)}
              </p>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                per day to reach monthly target
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Streak & Performance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Streak</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-orange-500">{streak}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">days</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Top Platform</span>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {bestPlatform.name}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            ${bestPlatform.earnings.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`rounded-xl border p-4 ${
                alert.type === 'danger'
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                  : 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
              }`}
            >
              <div className="flex gap-3">
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 ${
                    alert.type === 'danger'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}
                />
                <p
                  className={`text-sm ${
                    alert.type === 'danger'
                      ? 'text-red-800 dark:text-red-300'
                      : 'text-yellow-800 dark:text-yellow-300'
                  }`}
                >
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">Conversion Rate</span>
            <span className="font-semibold">{conversionRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">Total Proposals</span>
            <span className="font-semibold">{monthProposals.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">Closed Projects</span>
            <span className="font-semibold">{monthProposals.filter(p => p.isClosed).length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">Avg. Daily Earnings</span>
            <span className="font-semibold">${dailyAverage.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
