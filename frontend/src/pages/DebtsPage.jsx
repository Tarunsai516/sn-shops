import { useState, useEffect, useMemo } from 'react';
import { debtApi, paymentApi } from '../api';
import { formatCurrency, formatDate, getStatusBadge, capitalize } from '../utils/helpers';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { addToast } = useToast();

  useEffect(() => { loadDebts(); }, [page]);

  const loadDebts = async () => {
    setLoading(true);
    try {
      const { data } = await debtApi.getAll({ page, size: 15 });
      setDebts(data.content);
      setTotalPages(data.totalPages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Derived stats
  const stats = useMemo(() => {
    const totalOutstanding = debts.reduce((sum, d) => sum + (d.balanceDue || 0), 0);
    const totalCollected = debts.reduce((sum, d) => sum + (d.amountPaid || 0), 0);
    const pending = debts.filter(d => d.balanceDue > 0).length;
    return { totalOutstanding, totalCollected, pending };
  }, [debts]);

  // Determine display status (add OVERDUE for debts older than 30 days)
  const getDebtDisplayStatus = (d) => {
    if (d.paymentStatus === 'PAID') return 'PAID';
    const created = new Date(d.createdAt);
    const now = new Date();
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
    if (daysDiff > 30 && d.balanceDue > 0) return 'OVERDUE';
    return d.paymentStatus; // PARTIAL or UNPAID
  };

  const getDisplayBadgeClass = (status) => {
    switch (status) {
      case 'PAID': return 'badge-success';
      case 'OVERDUE': return 'badge-danger';
      case 'PARTIAL': return 'badge-warning';
      case 'UNPAID': return 'badge-danger';
      default: return '';
    }
  };

  // Filtered debts
  const filteredDebts = useMemo(() => {
    let result = debts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => d.customerName?.toLowerCase().includes(q));
    }
    if (statusFilter) {
      result = result.filter(d => {
        const displayStatus = getDebtDisplayStatus(d);
        return displayStatus === statusFilter;
      });
    }
    return result;
  }, [debts, searchQuery, statusFilter]);

  const openPayment = (sale) => {
    setSelectedSale(sale);
    setPayAmount('');
    setError('');
    setShowPayModal(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaying(true);
    setError('');
    try {
      await paymentApi.record({ saleId: selectedSale.id, amountPaid: parseFloat(payAmount) });
      setShowPayModal(false);
      addToast('Payment recorded successfully!', 'success');
      loadDebts();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally { setPaying(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text">Debts & Payments</h1>
        <p className="text-text-muted text-sm mt-1">Track outstanding balances and record payments</p>
      </div>

      {/* Summary Stats */}
      <div className="debt-stats-grid">
        <div className="debt-stat-card danger">
          <div className="debt-stat-label">Total Outstanding</div>
          <div className="debt-stat-value">{formatCurrency(stats.totalOutstanding)}</div>
        </div>
        <div className="debt-stat-card success">
          <div className="debt-stat-label">Total Collected</div>
          <div className="debt-stat-value">{formatCurrency(stats.totalCollected)}</div>
        </div>
        <div className="debt-stat-card warning">
          <div className="debt-stat-label">Pending Debts</div>
          <div className="debt-stat-value">{stats.pending}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1" style={{ maxWidth: '320px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search by customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="input-field"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '140px' }}
        >
          <option value="">All Status</option>
          <option value="PARTIAL">Partial</option>
          <option value="UNPAID">Unpaid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sale #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={8}><div className="h-4 bg-primary/5 rounded animate-pulse" /></td></tr>
                ))
              ) : filteredDebts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div style={{ opacity: 0.5, fontSize: '2rem', marginBottom: '0.5rem' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto', display: 'block', color: 'var(--color-text-muted)' }}>
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
                      </svg>
                    </div>
                    <p className="text-text-muted">
                      {debts.length === 0 ? '🎉 No outstanding debts!' : 'No matching debts found'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDebts.map((d) => {
                  const displayStatus = getDebtDisplayStatus(d);
                  return (
                    <tr key={d.id}>
                      <td className="font-mono font-medium">#{d.id}</td>
                      <td className="font-medium text-text">{capitalize(d.customerName)}</td>
                      <td>{formatCurrency(d.totalAmount)}</td>
                      <td className="text-success">{formatCurrency(d.amountPaid)}</td>
                      <td className="text-danger font-semibold">{formatCurrency(d.balanceDue)}</td>
                      <td><span className={`badge ${getDisplayBadgeClass(displayStatus)}`}>{displayStatus}</span></td>
                      <td className="text-text-muted text-sm">{formatDate(d.createdAt)}</td>
                      <td>
                        {d.balanceDue > 0 && (
                          <button onClick={() => openPayment(d)} className="btn-primary py-1.5 px-3 text-xs">
                            Record Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
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

      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Record Payment">
        {selectedSale && (
          <>
            <div className="p-3 bg-bg/40 rounded-xl mb-4 space-y-1">
              <p className="text-sm"><span className="text-text-muted">Sale #:</span> <span className="font-mono font-medium">{selectedSale.id}</span></p>
              <p className="text-sm"><span className="text-text-muted">Customer:</span> <span className="font-medium">{capitalize(selectedSale.customerName)}</span></p>
              <p className="text-sm"><span className="text-text-muted">Balance Due:</span> <span className="font-semibold text-danger">{formatCurrency(selectedSale.balanceDue)}</span></p>
            </div>
            {error && <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">{error}</div>}
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Payment Amount *</label>
                <input type="number" step="0.01" min="1" max={selectedSale.balanceDue} className="input-field" value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)} required placeholder={`Max: ${selectedSale.balanceDue}`} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={paying} className="btn-primary flex-1 justify-center">{paying ? 'Processing...' : 'Record Payment'}</button>
                <button type="button" onClick={() => setShowPayModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
}
