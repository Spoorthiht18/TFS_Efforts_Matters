import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { EffortRecord } from '../types/database';
import { BarChart3, Clock, Users, Zap, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalRecords: number;
  totalDevelopers: number;
  toolUsageRate: number;
  avgTimeSaved: number;
  totalEffortWithTool: number;
  totalEffortWithoutTool: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRecords: 0,
    totalDevelopers: 0,
    toolUsageRate: 0,
    avgTimeSaved: 0,
    totalEffortWithTool: 0,
    totalEffortWithoutTool: 0,
  });
  const [records, setRecords] = useState<EffortRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('effort_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setRecords(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: EffortRecord[]) => {
    const totalRecords = data.length;
    const uniqueDevelopers = new Set(data.map((r) => r.developer_name)).size;
    const toolUsedCount = data.filter((r) => r.tool_used).length;
    const toolUsageRate = totalRecords > 0 ? (toolUsedCount / totalRecords) * 100 : 0;

    const recordsWithBothEfforts = data.filter(
      (r) => r.tool_used && r.effort_with_tool && r.effort_without_tool
    );

    const totalTimeSaved = recordsWithBothEfforts.reduce(
      (sum, r) => sum + ((r.effort_without_tool || 0) - (r.effort_with_tool || 0)),
      0
    );

    const avgTimeSaved = recordsWithBothEfforts.length > 0
      ? totalTimeSaved / recordsWithBothEfforts.length
      : 0;

    const totalEffortWithTool = data.reduce((sum, r) => sum + (r.effort_with_tool || 0), 0);
    const totalEffortWithoutTool = data.reduce((sum, r) => sum + (r.effort_without_tool || 0), 0);

    setStats({
      totalRecords,
      totalDevelopers: uniqueDevelopers,
      toolUsageRate,
      avgTimeSaved,
      totalEffortWithTool,
      totalEffortWithoutTool,
    });
  };

  const getStateDistribution = () => {
    const distribution: { [key: string]: number } = {};
    records.forEach((r) => {
      distribution[r.state] = (distribution[r.state] || 0) + 1;
    });
    return distribution;
  };

  const getToolDistribution = () => {
    const distribution: { [key: string]: number } = {};
    records
      .filter((r) => r.tool_used && r.tool_name)
      .forEach((r) => {
        distribution[r.tool_name!] = (distribution[r.tool_name!] || 0) + 1;
      });
    return distribution;
  };

  const stateDistribution = getStateDistribution();
  const toolDistribution = getToolDistribution();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Team Effort Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="Total Records"
          value={stats.totalRecords.toString()}
          color="blue"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Team Members"
          value={stats.totalDevelopers.toString()}
          color="green"
        />
        <StatCard
          icon={<Zap className="w-6 h-6" />}
          title="AI Tool Usage"
          value={`${stats.toolUsageRate.toFixed(1)}%`}
          color="yellow"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Avg Time Saved"
          value={`${stats.avgTimeSaved.toFixed(1)}h`}
          color="teal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Effort Comparison
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-sm font-medium text-gray-700">Total Effort (with AI)</span>
              <span className="text-lg font-bold text-blue-600">
                {stats.totalEffortWithTool.toFixed(1)}h
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-700">Estimated Effort (without AI)</span>
              <span className="text-lg font-bold text-gray-600">
                {stats.totalEffortWithoutTool.toFixed(1)}h
              </span>
            </div>
            {stats.totalEffortWithoutTool > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="text-sm font-medium text-gray-700">Time Saved</span>
                <span className="text-lg font-bold text-green-600">
                  {(stats.totalEffortWithoutTool - stats.totalEffortWithTool).toFixed(1)}h (
                  {(((stats.totalEffortWithoutTool - stats.totalEffortWithTool) /
                    stats.totalEffortWithoutTool) *
                    100).toFixed(1)}
                  %)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Task State Distribution</h3>
          <div className="space-y-2">
            {Object.entries(stateDistribution).map(([state, count]) => (
              <div key={state} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{state}</span>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(count / stats.totalRecords) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {Object.keys(toolDistribution).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Tools Used</h3>
            <div className="space-y-2">
              {Object.entries(toolDistribution).map(([tool, count]) => (
                <div key={tool} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{tool}</span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(count / Object.values(toolDistribution).reduce((a, b) => a + b, 0)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {records.slice(0, 5).map((record) => (
              <div key={record.id} className="border-l-4 border-blue-600 pl-3 py-2">
                <div className="font-medium text-gray-800">{record.developer_name}</div>
                <div className="text-sm text-gray-600">{record.story_number}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(record.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: 'blue' | 'green' | 'yellow' | 'teal';
}

function StatCard({ icon, title, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    teal: 'bg-teal-50 text-teal-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-3`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}
