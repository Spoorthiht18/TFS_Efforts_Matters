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
          effort_with_tool:
            formData.tool_used && formData.effort_with_tool !== ''
              ? parseFloat(formData.effort_with_tool)
              : null,
          effort_without_tool:
            formData.effort_without_tool !== ''
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

        {/* Developer + Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            required
            placeholder="Developer Name"
            value={formData.developer_name}
            onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />

          <input
            type="text"
            required
            placeholder="Story Number"
            value={formData.story_number}
            onChange={(e) => setFormData({ ...formData, story_number: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* Description */}
        <textarea
          required
          rows={3}
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />

        {/* State + Without Tool */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          >
            <option>In Progress</option>
            <option>Completed</option>
            <option>Blocked</option>
            <option>On Hold</option>
            <option>Testing</option>
          </select>

          {/* FIXED INPUT */}
          <input
            type="number"
            step="any"
            min="0"
            placeholder="Effort without tool (e.g. 1.25)"
            value={formData.effort_without_tool}
            onChange={(e) =>
              setFormData({
                ...formData,
                effort_without_tool: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* Tool Used */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.tool_used}
            onChange={(e) => setFormData({ ...formData, tool_used: e.target.checked })}
          />
          AI Tool Used
        </label>

        {formData.tool_used ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <select
              value={formData.tool_name}
              onChange={(e) => setFormData({ ...formData, tool_name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Tool</option>
              <option>Codex</option>
              <option>ChatGPT</option>
              <option>GitHub Copilot</option>
            </select>

            {/* FIXED INPUT */}
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Effort with tool (e.g. 0.25)"
              value={formData.effort_with_tool}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  effort_with_tool: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        ) : (
          <textarea
            rows={2}
            placeholder="Reason for not using tool"
            value={formData.reason_not_used}
            onChange={(e) =>
              setFormData({ ...formData, reason_not_used: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
          />
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? 'Submitting...' : 'Submit Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
