import { useState } from 'react';

const DEFAULT = {
  title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: ''
};

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState(
    task
      ? {
          title:       task.title,
          description: task.description || '',
          status:      task.status,
          priority:    task.priority,
          dueDate:     task.dueDate
            ? new Date(task.dueDate).toISOString().split('T')[0]
            : '',
        }
      : { ...DEFAULT }
  );
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate ? form.dueDate + 'T00:00:00' : null,
      };
      await onSave(payload, task?.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{task ? '// EDIT TASK' : '// NEW TASK'}</div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              name="title" value={form.title} onChange={handleChange}
              placeholder="What needs to be done?" required maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              placeholder="Add details (optional)…" maxLength={2000}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="TODO">To-Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Due Date (optional)</label>
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={loading}>
              {loading ? <><span className="loader" /> Saving…</> : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
