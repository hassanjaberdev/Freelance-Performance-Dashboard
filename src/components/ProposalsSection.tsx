import React, { useState } from 'react';
import { Filter, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Proposal } from '../App';

interface ProposalsSectionProps {
  proposals: Proposal[];
  selectedMonth: string;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  deleteProposal: (id: string) => void;
}

export function ProposalsSection({
  proposals,
  selectedMonth,
  updateProposal,
  deleteProposal,
}: ProposalsSectionProps) {
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const monthProposals = proposals.filter(p => p.date.startsWith(selectedMonth));

  // Get unique platforms
  const platforms = Array.from(new Set(proposals.map(p => p.platform)));

  // Apply filters
  const filteredProposals = monthProposals.filter(p => {
    if (filterPlatform !== 'all' && p.platform !== filterPlatform) return false;
    if (filterStatus === 'closed' && !p.isClosed) return false;
    if (filterStatus === 'discussion' && !p.hasDiscussion) return false;
    if (filterStatus === 'pending' && (p.isClosed || !p.hasDiscussion)) return false;
    return true;
  });

  const totalProposals = monthProposals.length;
  const discussionRate = totalProposals > 0 
    ? ((monthProposals.filter(p => p.hasDiscussion).length / totalProposals) * 100).toFixed(1)
    : '0.0';
  const closingRate = totalProposals > 0
    ? ((monthProposals.filter(p => p.isClosed).length / totalProposals) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Proposals Tracker</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitor your proposal pipeline</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalProposals}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{discussionRate}%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Discussion</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{closingRate}%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Closing</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            {platforms.map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="discussion">In Discussion</option>
            <option value="closed">Closed</option>
          </select>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredProposals.length} results
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Proposal Title
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Discussion
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Closed
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredProposals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No proposals found for the selected filters.
                </td>
              </tr>
            ) : (
              filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(proposal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg">
                      {proposal.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {proposal.title}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => updateProposal(proposal.id, { hasDiscussion: !proposal.hasDiscussion })}
                      className={`inline-flex items-center justify-center w-20 px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                        proposal.hasDiscussion
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      {proposal.hasDiscussion ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => updateProposal(proposal.id, { isClosed: !proposal.isClosed })}
                      className={`inline-flex items-center justify-center w-20 px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                        proposal.isClosed
                          ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      {proposal.isClosed ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {proposal.isClosed ? (
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ${proposal.value.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this proposal?')) {
                          deleteProposal(proposal.id);
                        }
                      }}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      aria-label="Delete proposal"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
