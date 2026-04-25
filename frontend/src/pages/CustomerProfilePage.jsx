import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerApi } from '../api';
import { formatCurrency, formatDate, getStatusBadge, capitalize } from '../utils/helpers';

export default function CustomerProfilePage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('purchases');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCustomer(); }, [id]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const [c, s, p] = await Promise.all([
        customerApi.getById(id),
        customerApi.getHistory(id, { page: 0, size: 50 }),
        customerApi.getPayments(id, { page: 0, size: 50 }),
      ]);
      setCustomer(c.data);
      setSales(s.data.content);
      setPayments(p.data.content);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="glass-card animate-pulse"><div className="h-6 w-48 bg-primary/10 rounded" /></div>;
  if (!customer) return <div className="text-center text-text-muted py-12">Customer not found</div>;

  return (
    <div className="space-y-6">
      <Link to="/customers" className="text-primary-light hover:text-primary text-sm flex items-center gap-1">
        ← Back to Customers
      </Link>
      <div className="glass-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text">{capitalize(customer.name)}</h1>
            <p className="text-text-muted text-sm">{customer.phone || 'No phone'} • Joined {formatDate(customer.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase font-semibold text-text-muted tracking-wider">Outstanding Debt</p>
            <p className={`text-2xl font-bold ${customer.totalDebtBalance > 0 ? 'text-danger' : 'text-success'}`}>
              {formatCurrency(customer.totalDebtBalance)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 border-b border-primary/10">
        {['purchases', 'payments'].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition cursor-pointer ${activeTab === t ? 'border-primary text-primary-light' : 'border-transparent text-text-muted hover:text-text'}`}>
            {t === 'purchases' ? `Purchases (${sales.length})` : `Payments (${payments.length})`}
          </button>
        ))}
      </div>
      {activeTab === 'purchases' && (
        <div className="glass-card p-0 overflow-hidden"><div className="table-container"><table className="data-table">
          <thead><tr><th>Sale #</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
          <tbody>{sales.length === 0 ? <tr><td colSpan={6} className="text-center text-text-muted py-8">No purchases</td></tr> :
            sales.map((s) => (<tr key={s.id}>
              <td className="font-mono">#{s.id}</td><td className="text-text-muted text-sm">{formatDate(s.createdAt)}</td>
              <td className="font-semibold">{formatCurrency(s.totalAmount)}</td><td className="text-success">{formatCurrency(s.amountPaid)}</td>
              <td className={s.balanceDue > 0 ? 'text-danger font-semibold' : 'text-text-muted'}>{formatCurrency(s.balanceDue)}</td>
              <td><span className={`badge ${getStatusBadge(s.paymentStatus)}`}>{s.paymentStatus}</span></td>
            </tr>))}</tbody></table></div></div>
      )}
      {activeTab === 'payments' && (
        <div className="glass-card p-0 overflow-hidden"><div className="table-container"><table className="data-table">
          <thead><tr><th>#</th><th>Sale #</th><th>Amount</th><th>Date</th><th>Balance After</th></tr></thead>
          <tbody>{payments.length === 0 ? <tr><td colSpan={5} className="text-center text-text-muted py-8">No payments</td></tr> :
            payments.map((p) => (<tr key={p.id}>
              <td className="font-mono">#{p.id}</td><td className="font-mono text-text-muted">#{p.saleId}</td>
              <td className="font-semibold text-success">{formatCurrency(p.amountPaid)}</td>
              <td className="text-text-muted text-sm">{formatDate(p.paymentDate)}</td>
              <td className={p.saleBalanceAfter > 0 ? 'text-warning' : 'text-success'}>{formatCurrency(p.saleBalanceAfter)}</td>
            </tr>))}</tbody></table></div></div>
      )}
    </div>
  );
}
