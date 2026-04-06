import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { EffortRecord } from '../types/database';
import { Table, Search, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function RecordsTable() {
  const [records, setRecords] = useState<EffortRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<EffortRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [filterToolUsed, setFilterToolUsed] = useState('All');

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterState, filterToolUsed, records]);

  const loadRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('effort_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setRecords(data);
        setFilteredRecords(data);
      }
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.developer_name.toLowerCase().includes(term) ||
          r.story_number.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term)
      );
    }

    if (filterState !== 'All') {
      filtered = filtered.filter((r) => r.state === filterState);
    }

    if (filterToolUsed !== 'All') {
      const usedTool = filterToolUsed === 'Yes';
      filtered = filtered.filter((r) => r.tool_used === usedTool);
    }

    setFilteredRecords(filtered);
  };

  const uniqueStates = ['All', ...Array.from(new Set(records.map((r) => r.state)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Table className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">All Records</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, story, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {uniqueStates.map((state) => (
              <option key={state} value={state}>
                {state === 'All' ? 'All States' : state}
              </option>
            ))}
          </select>

          <select
            value={filterToolUsed}
            onChange={(e) => setFilterToolUsed(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Tool Usage</option>
            <option value="Yes">Tool Used</option>
            <option value="No">Tool Not Used</option>
          </select>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredRecords.length} of {records.length} records
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Developer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Story #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  State
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  AI Tool
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Tool Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  With Tool
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Without Tool
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Saved
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{record.developer_name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.story_number}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-sm text-gray-600 truncate" title={record.description}>
                        {record.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.state === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : record.state === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : record.state === 'Blocked'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {record.state}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {record.tool_used ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.tool_name || (
                          <span className="text-gray-400 italic">
                            {record.reason_not_used ? 'N/A' : '-'}
                          </span>
                        )}
                      </div>
                      {record.reason_not_used && (
                        <div className="text-xs text-gray-500 mt-1" title={record.reason_not_used}>
                          {record.reason_not_used.substring(0, 30)}
                          {record.reason_not_used.length > 30 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center justify-end gap-1">
                        {record.effort_with_tool ? (
                          <>
                            <Clock className="w-4 h-4 text-blue-600" />
                            {record.effort_with_tool}h
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center justify-end gap-1">
                        {record.effort_without_tool ? (
                          <>
                            <Clock className="w-4 h-4 text-gray-600" />
                            {record.effort_without_tool}h
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {record.effort_with_tool && record.effort_without_tool ? (
                        <div className="text-sm font-bold text-green-600">
                          {(record.effort_without_tool - record.effort_with_tool).toFixed(1)}h
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(record.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
