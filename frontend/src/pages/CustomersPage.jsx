import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../api';
import { formatCurrency, formatDate, capitalize } from '../utils/helpers';
import Modal from '../components/Modal';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [debtFilter, setDebtFilter] = useState(''); // '' | 'has' | 'clear'
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, [page, search]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await customerApi.getAll({ search, page, size: 15 });
      setCustomers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements || data.content.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await customerApi.create({ name: form.name, phone: form.phone || null });
      setShowModal(false);
      setForm({ name: '', phone: '' });
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setSaving(false);
    }
  };

  // Derived stats
  const stats = useMemo(() => {
    const totalDebt = customers.reduce((sum, c) => sum + (c.totalDebtBalance || 0), 0);
    return { count: totalElements, totalDebt };
  }, [customers, totalElements]);

  // Filtered by debt status
  const filteredCustomers = useMemo(() => {
    if (debtFilter === 'has') return customers.filter(c => c.totalDebtBalance > 0);
    if (debtFilter === 'clear') return customers.filter(c => !c.totalDebtBalance || c.totalDebtBalance === 0);
    return customers;
  }, [customers, debtFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Customers</h1>
          <p className="text-text-muted text-sm mt-1">
            {stats.count} customer{stats.count !== 1 ? 's' : ''}
            {stats.totalDebt > 0 && <> · <span className="text-danger font-semibold">{formatCurrency(stats.totalDebt)} outstanding</span></>}
          </p>
        </div>
        <button onClick={() => { setError(''); setShowModal(true); }} className="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Add Customer
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="max-w-sm flex-1">
          <input
            type="text"
            className="input-field"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select
          className="input-field"
          value={debtFilter}
          onChange={(e) => setDebtFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '140px' }}
        >
          <option value="">All Customers</option>
          <option value="has">Has Debt</option>
          <option value="clear">No Debt</option>
        </select>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Outstanding Debt</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={5}><div className="h-4 bg-primary/5 rounded animate-pulse" /></td></tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-text-muted py-12">No customers found</td></tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="cursor-pointer" onClick={() => navigate(`/customers/${c.id}`)}>
                    <td className="font-medium text-text">
                      <div className="flex items-center gap-2.5">
                        <div style={{
                          width: '2rem', height: '2rem', borderRadius: '0.625rem',
                          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                        }}>
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        {capitalize(c.name)}
                      </div>
                    </td>
                    <td className="text-text-muted">{c.phone || '-'}</td>
                    <td>
                      <span className={`font-semibold ${c.totalDebtBalance > 0 ? 'text-danger' : 'text-success'}`}>
                        {formatCurrency(c.totalDebtBalance)}
                      </span>
                    </td>
                    <td className="text-text-muted text-sm">{formatDate(c.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/customers/${c.id}`)}
                          className="text-primary-light hover:text-primary text-xs font-semibold transition"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                        >
                          View →
                        </button>
                        {c.totalDebtBalance > 0 && (
                          <button
                            onClick={() => navigate('/debts')}
                            className="text-xs font-semibold px-2 py-1 rounded-lg transition"
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                              color: '#f87171', cursor: 'pointer',
                            }}
                          >
                            Collect
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary py-2 px-4 text-xs">Previous</button>
          <span className="flex items-center text-sm text-text-muted px-4">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary py-2 px-4 text-xs">Next</button>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Customer">
        {error && <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Name *</label>
            <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Phone</label>
            <input type="tel" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : 'Add Customer'}</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
