import { useState, useEffect } from 'react';
import { debtApi, paymentApi } from '../api';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/helpers';
import Modal from '../components/Modal';

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
  const [success, setSuccess] = useState('');

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
      setSuccess('Payment recorded successfully!');
      loadDebts();
      setTimeout(() => setSuccess(''), 4000);
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

      {success && <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm">{success}</div>}

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
              ) : debts.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-text-muted py-12">🎉 No outstanding debts!</td></tr>
              ) : (
                debts.map((d) => (
                  <tr key={d.id}>
                    <td className="font-mono font-medium">#{d.id}</td>
                    <td className="font-medium text-text">{d.customerName}</td>
                    <td>{formatCurrency(d.totalAmount)}</td>
                    <td className="text-success">{formatCurrency(d.amountPaid)}</td>
                    <td className="text-danger font-semibold">{formatCurrency(d.balanceDue)}</td>
                    <td><span className={`badge ${getStatusBadge(d.paymentStatus)}`}>{d.paymentStatus}</span></td>
                    <td className="text-text-muted text-sm">{formatDate(d.createdAt)}</td>
                    <td>
                      <button onClick={() => openPayment(d)} className="btn-success py-1.5 px-3 text-xs">
                        Record Payment
                      </button>
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

      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Record Payment">
        {selectedSale && (
          <>
            <div className="p-3 bg-bg/40 rounded-xl mb-4 space-y-1">
              <p className="text-sm"><span className="text-text-muted">Sale #:</span> <span className="font-mono font-medium">{selectedSale.id}</span></p>
              <p className="text-sm"><span className="text-text-muted">Customer:</span> <span className="font-medium">{selectedSale.customerName}</span></p>
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
                <button type="submit" disabled={paying} className="btn-success flex-1 justify-center">{paying ? 'Processing...' : 'Record Payment'}</button>
                <button type="button" onClick={() => setShowPayModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
}
