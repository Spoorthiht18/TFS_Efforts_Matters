import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { EffortRecord } from '../types/database';
import { Table } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function RecordsTable() {
  const [records, setRecords] = useState<EffortRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<EffortRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [filterToolUsed, setFilterToolUsed] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterState, filterToolUsed, startDate, endDate, records]);

  const loadRecords = async () => {
    const { data } = await supabase
      .from('effort_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setRecords(data);
      setFilteredRecords(data);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...records];

    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.developer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterState !== 'All') {
      filtered = filtered.filter((r) => r.state === filterState);
    }

    if (filterToolUsed !== 'All') {
      filtered = filtered.filter((r) =>
        filterToolUsed === 'Yes' ? r.tool_used : !r.tool_used
      );
    }

    if (startDate) {
      filtered = filtered.filter(
        (r) => new Date(r.created_at) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (r) => new Date(r.created_at) <= new Date(endDate)
      );
    }

    setFilteredRecords(filtered);
  };

  // DELETE
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this record?")) return;

    await supabase.from('effort_records').delete().eq('id', id);

    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    setFilteredRecords(updated);
  };

  // SAFE DECIMAL CALCULATION
  const calculateSaved = (r: EffortRecord) => {
    if (
      r.effort_with_tool !== null &&
      r.effort_without_tool !== null &&
      !isNaN(Number(r.effort_with_tool)) &&
      !isNaN(Number(r.effort_without_tool))
    ) {
      return (
        Number(r.effort_without_tool) - Number(r.effort_with_tool)
      ).toFixed(2);
    }
    return "-";
  };

  // LEADERBOARD
  const getLeaderboard = () => {
    const map: Record<string, number> = {};

    filteredRecords.forEach((r) => {
      if (r.effort_with_tool != null && r.effort_without_tool != null) {
        const saved =
          Number(r.effort_without_tool) - Number(r.effort_with_tool);

        if (!map[r.developer_name]) map[r.developer_name] = 0;
        map[r.developer_name] += saved;
      }
    });

    return Object.entries(map)
      .map(([name, saved]) => ({ name, saved }))
      .sort((a, b) => b.saved - a.saved);
  };

  const leaderboard = getLeaderboard();
  const top = leaderboard[0];

  // EXPORT
  const handleExport = () => {
    const headers = [
      "Date",
      "Developer",
      "Story",
      "Description",
      "State",
      "Tool Used",
      "Tool Name",
      "With Tool",
      "Without Tool",
      "Reason",
      "Saved"
    ];

    const rows = filteredRecords.map((r) => [
      new Date(r.created_at).toLocaleDateString(),
      r.developer_name,
      r.story_number,
      r.description,
      r.state,
      r.tool_used ? "Yes" : "No",
      r.tool_name || "",
      r.effort_with_tool ?? "",
      r.effort_without_tool ?? "",
      r.reason_not_used || "",
      calculateSaved(r)
    ]);

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "effort_report.csv";
    link.click();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Table className="w-6 h-6 text-blue-600" />
        Dashboard
      </h1>

      {/* TOP PERFORMER */}
      <div className="bg-green-100 p-4 rounded">
        🏆 <b>{top?.name || "N/A"}</b> saved {top ? top.saved.toFixed(2) : 0} hrs
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 flex-wrap">
        <input placeholder="Search" onChange={(e) => setSearchTerm(e.target.value)} />
        <select onChange={(e) => setFilterState(e.target.value)}>
          <option>All</option>
          <option>Completed</option>
          <option>In Progress</option>
          <option>Testing</option>
        </select>
        <select onChange={(e) => setFilterToolUsed(e.target.value)}>
          <option>All</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        <input type="date" onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" onChange={(e) => setEndDate(e.target.value)} />

        <button onClick={handleExport} className="bg-blue-500 text-white px-3 py-1 rounded">
          Export Excel
        </button>
      </div>

      {/* LEADERBOARD */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="font-bold mb-2">🏆 Leaderboard</h2>
        {leaderboard.slice(0, 5).map((d, i) => (
          <div key={d.name} className="flex justify-between">
            <span>{i + 1}. {d.name}</span>
            <span>{d.saved.toFixed(2)} hrs</span>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="bg-white p-4 shadow rounded overflow-x-auto">
        <BarChart width={600} height={300} data={leaderboard.slice(0, 5)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="saved" />
        </BarChart>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th>Date</th>
              <th>Developer</th>
              <th>Story</th>
              <th>Description</th>
              <th>State</th>
              <th>Tool Used</th>
              <th>Tool Name</th>
              <th>With Tool</th>
              <th>Without Tool</th>
              <th>Reason</th>
              <th>Saved</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.map((r) => (
              <tr key={r.id} className="border-t">
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>{r.developer_name}</td>
                <td>{r.story_number}</td>
                <td>{r.description}</td>
                <td>{r.state}</td>
                <td>{r.tool_used ? "Yes" : "No"}</td>
                <td>{r.tool_name || "-"}</td>
                <td>{r.effort_with_tool ?? "-"}</td>
                <td>{r.effort_without_tool ?? "-"}</td>
                <td>{r.reason_not_used || "-"}</td>
                <td className="text-green-600 font-semibold">
                  {calculateSaved(r)}
                </td>
                <td>
                  <button onClick={() => handleDelete(r.id)} className="text-red-500">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}