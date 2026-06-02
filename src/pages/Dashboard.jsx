import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, userAPI } from '../services/api';
import TaskModal from '../components/TaskModal';

const STATUS_FILTERS = [
  { label: 'All',         value: '' },
  { label: 'To-Do',       value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done',        value: 'DONE' },
];

function statusBadge(s) {
  if (s === 'TODO')        return <span className="badge badge-todo">Todo</span>;
  if (s === 'IN_PROGRESS') return <span className="badge badge-inprogress">In Progress</span>;
  if (s === 'DONE')        return <span className="badge badge-done">Done</span>;
  return null;
}

function priorityBadge(p) {
  const cls = p === 'HIGH' ? 'high' : p === 'LOW' ? 'low' : 'medium';
  return <span className={`badge badge-${cls}`}>{p}</span>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks,   setTasks]   = useState([]);
  const [stats,   setStats]   = useState(null);
  const [filter,  setFilter]  = useState('');
  const [page,    setPage]    = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modal,   setModal]   = useState(null); // null | 'create' | task object
  const [toast,   setToast]   = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await userAPI.dashboard();
      setStats(res.data.data);
    } catch {}
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 8, sortBy: 'createdAt', sortDir: 'desc' };
      if (filter) params.status = filter;
      const res = await tasksAPI.getAll(params);
      setTasks(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch {
      showToast('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      showToast('Task deleted');
      fetchTasks();
      fetchStats();
    } catch { showToast('Delete failed'); }
  };

  const handleSave = async (data, editId) => {
    try {
      if (editId) {
        await tasksAPI.update(editId, data);
        showToast('Task updated');
      } else {
        await tasksAPI.create(data);
        showToast('Task created');
      }
      setModal(null);
      fetchTasks();
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed';
      showToast(msg);
    }
  };

  return (
    <div className="dashboard">
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-logo">TASK/FLOW</div>
        <div className="topbar-user">
          <span>{user?.name}</span>
          <span className={`role-badge role-${user?.role?.toLowerCase()}`}>{user?.role}</span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        {/* Stats */}
        {stats && (
          <div className="stats-grid">
            {[
              { label: 'Total', value: stats.totalTasks },
              { label: 'To-Do', value: stats.todoTasks },
              { label: 'In Progress', value: stats.inProgressTasks },
              { label: 'Done', value: stats.doneTasks },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{String(s.value).padStart(2, '0')}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tasks section */}
        <div className="section-header">
          <div className="section-title">// TASKS</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="filters">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={`filter-btn ${filter === f.value ? 'active' : ''}`}
                  onClick={() => { setFilter(f.value); setPage(0); }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
              + New Task
            </button>
          </div>
        </div>

        {/* Task list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <span className="loader" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◫</div>
            <div>No tasks found.</div>
            <div style={{ marginTop: '.5rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal('create')}>
                Create your first task
              </button>
            </div>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task, i) => (
              <div key={task.id} className="task-card" style={{ animationDelay: `${i * 0.04}s` }}>
                <div>
                  <div className="task-title">{task.title}</div>
                  {task.description && (
                    <div className="task-desc">{task.description}</div>
                  )}
                  <div className="task-meta">
                    {statusBadge(task.status)}
                    {priorityBadge(task.priority)}
                    {task.dueDate && (
                      <span className="task-date">
                        due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="task-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(task)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(task.id)}>
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`filter-btn ${page === i ? 'active' : ''}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit modal */}
      {modal && (
        <TaskModal
          task={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          background: 'var(--surface)', border: '1px solid var(--accent2)',
          color: 'var(--accent2)', padding: '.75rem 1.25rem',
          fontFamily: 'var(--font-mono)', fontSize: '.8rem',
          borderRadius: 'var(--radius)', zIndex: 9999,
          animation: 'slideUp .25s ease',
        }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
