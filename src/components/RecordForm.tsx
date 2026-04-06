import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus } from 'lucide-react';

interface RecordFormProps {
  onSuccess: () => void;
}

export default function RecordForm({ onSuccess }: RecordFormProps) {
  const [formData, setFormData] = useState({
    developer_name: '',
    story_number: '',
    description: '',
    state: 'In Progress',
    tool_used: false,
    tool_name: '',
    effort_with_tool: '',
    effort_without_tool: '',
    reason_not_used: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase.from('effort_records').insert([
        {
          developer_name: formData.developer_name,
          story_number: formData.story_number,
          description: formData.description,
          state: formData.state,
          tool_used: formData.tool_used,
          tool_name: formData.tool_used ? formData.tool_name : null,
          effort_with_tool: formData.tool_used && formData.effort_with_tool
            ? parseFloat(formData.effort_with_tool)
            : null,
          effort_without_tool: formData.effort_without_tool
            ? parseFloat(formData.effort_without_tool)
            : null,
          reason_not_used: !formData.tool_used ? formData.reason_not_used : null,
        },
      ]);

      if (insertError) throw insertError;

      setFormData({
        developer_name: '',
        story_number: '',
        description: '',
        state: 'In Progress',
        tool_used: false,
        tool_name: '',
        effort_with_tool: '',
        effort_without_tool: '',
        reason_not_used: '',
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Add New Record</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Developer Name *
            </label>
            <input
              type="text"
              required
              value={formData.developer_name}
              onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Story/Incident/Task Number *
            </label>
            <input
              type="text"
              required
              value={formData.story_number}
              onChange={(e) => setFormData({ ...formData, story_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>In Progress</option>
              <option>Completed</option>
              <option>Blocked</option>
              <option>On Hold</option>
              <option>Testing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual Effort (hrs) without Tool
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={formData.effort_without_tool}
              onChange={(e) => setFormData({ ...formData, effort_without_tool: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={formData.tool_used}
              onChange={(e) => setFormData({ ...formData, tool_used: e.target.checked })}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">AI Tool Used</span>
          </label>

          {formData.tool_used ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tool Name *
                </label>
                <select
                  required
                  value={formData.tool_name}
                  onChange={(e) => setFormData({ ...formData, tool_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Tool</option>
                  <option>Codex</option>
                  <option>ChatGPT</option>
                  <option>GitHub Copilot</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effort (hrs) with Tool
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.effort_with_tool}
                  onChange={(e) => setFormData({ ...formData, effort_with_tool: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Not Using Tool
              </label>
              <textarea
                rows={2}
                value={formData.reason_not_used}
                onChange={(e) => setFormData({ ...formData, reason_not_used: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional: Explain why an AI tool was not used"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
