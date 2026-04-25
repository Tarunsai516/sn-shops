import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, productApi } from '../api';
import { formatCurrency, capitalize } from '../utils/helpers';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label, isCurrency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(30, 27, 75, 0.95)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: '0.75rem',
      padding: '0.625rem 0.875rem',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      <p style={{ color: '#a5b4fc', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{ color: '#e0e7ff', fontSize: '0.95rem', fontWeight: 700 }}>
        {isCurrency !== false ? formatCurrency(payload[0].value) : payload[0].value}
      </p>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashRes, stockRes] = await Promise.all([
        dashboardApi.get(),
        productApi.getLowStock(),
      ]);
      setData(dashRes.data);
      setLowStock(stockRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDateStr = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getTrend = (current, previous) => {
    if (!previous || previous === 0) return { pct: 0, dir: 'neutral' };
    const pct = ((current - previous) / previous * 100).toFixed(1);
    return { pct: Math.abs(pct), dir: pct >= 0 ? 'up' : 'down' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Skeleton header */}
        <div className="animate-pulse" style={{ height: '3rem', width: '20rem', background: 'rgba(99,102,241,0.08)', borderRadius: '0.75rem' }} />
        {/* Skeleton KPI grid */}
        <div className="kpi-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse" style={{ height: '8rem', background: 'rgba(99,102,241,0.06)', borderRadius: '1rem', border: '1px solid rgba(99,102,241,0.08)' }} />
          ))}
        </div>
        {/* Skeleton chart */}
        <div className="animate-pulse" style={{ height: '20rem', background: 'rgba(99,102,241,0.06)', borderRadius: '1rem', border: '1px solid rgba(99,102,241,0.08)' }} />
      </div>
    );
  }

  const monthlyTrend = getTrend(data?.monthlyRevenue, data?.previousMonthRevenue);

  const kpiIcons = {
    revenue: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>,
    receipt: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
    debt: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5zM6 9.01V9"/><path d="M15 5s2-2 4-2 4 2 4 4-2 4-2 4"/></svg>,
    alert: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>,
    users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  };

  const kpis = [
    { label: "Today's Revenue", value: formatCurrency(data?.dailyRevenue), color: 'purple', icon: kpiIcons.revenue },
    { label: "This Month", value: formatCurrency(data?.monthlyRevenue), color: 'blue', icon: kpiIcons.chart, trend: monthlyTrend },
    { label: "Sales Today", value: data?.totalSalesToday || 0, color: 'cyan', icon: kpiIcons.receipt },
    { label: "Outstanding Debt", value: formatCurrency(data?.totalOutstandingDebt), color: 'red', icon: kpiIcons.debt },
    { label: "Low Stock Items", value: data?.lowStockCount || 0, color: 'orange', icon: kpiIcons.alert },
    { label: "Total Customers", value: data?.totalCustomers || 0, color: 'green', icon: kpiIcons.users },
  ];

  const monthlyChartData = (data?.monthlyRevenueData || []).map(item => ({
    name: item.month,
    revenue: Number(item.revenue),
  }));

  const dailyChartData = (data?.dailyRevenueData || []).map(item => ({
    name: `Day ${item.day}`,
    revenue: Number(item.revenue),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ─── Header ─── */}
      <div className="dashboard-header">
        <div className="greeting">
          <h1>{getGreeting()}, {capitalize(user?.username)} 👋</h1>
          <p>{formatDateStr()}</p>
        </div>
        <div className="quick-actions">
          <button className="btn-primary" onClick={() => navigate('/pos')} id="quick-new-sale">
            <span>🛒</span> New Sale
          </button>
          <button className="btn-secondary" onClick={() => navigate('/products')} id="quick-add-product">
            <span>📦</span> Products
          </button>
          <button className="btn-secondary" onClick={() => navigate('/customers')} id="quick-customers">
            <span>👥</span> Customers
          </button>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`kpi-card ${kpi.color}`} id={`kpi-${kpi.label.toLowerCase().replace(/[^a-z]/g, '-')}`}>
            <div className="kpi-icon">{kpi.icon}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            {kpi.trend && kpi.trend.pct > 0 && (
              <div className={`trend-indicator trend-${kpi.trend.dir}`}>
                {kpi.trend.dir === 'up' ? '↑' : '↓'} {kpi.trend.pct}% vs last month
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─── Revenue Trend (12 Months) ─── */}
      <div className="chart-card" id="chart-monthly-revenue">
        <div className="chart-header">
          <div>
            <div className="chart-title">Revenue Trend</div>
            <div className="chart-subtitle">Last 12 months performance</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>This Month</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e0e7ff' }}>{formatCurrency(data?.monthlyRevenue)}</div>
          </div>
        </div>
        {monthlyChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#a5b4fc', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a5b4fc', fontSize: 11 }} axisLine={false} tickLine={false} width={60}
                tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5}
                fill="url(#revenueGradient)" dot={false} activeDot={{ r: 5, fill: '#818cf8', stroke: '#6366f1', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>No revenue data yet. Start making sales!</p>
          </div>
        )}
      </div>

      {/* ─── Two Column Grid: Daily Revenue + Top Products ─── */}
      <div className="dashboard-grid-2col">
        {/* Daily Revenue Bar Chart */}
        <div className="chart-card" id="chart-daily-revenue">
          <div className="chart-header">
            <div>
              <div className="chart-title">Daily Revenue</div>
              <div className="chart-subtitle">Current month breakdown</div>
            </div>
          </div>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                <XAxis dataKey="name" tick={{ fill: '#a5b4fc', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#a5b4fc', fontSize: 10 }} axisLine={false} tickLine={false} width={55}
                  tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p>No daily data available yet</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="chart-card" id="section-top-products">
          <div className="chart-header">
            <div>
              <div className="chart-title">Top Products</div>
              <div className="chart-subtitle">Best sellers this month</div>
            </div>
          </div>
          {data?.topProducts?.length > 0 ? (
            <div className="table-container">
              <table className="top-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Units</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p, i) => (
                    <tr key={i}>
                      <td><span className="rank">{i + 1}</span></td>
                      <td style={{ fontWeight: 600 }}>{capitalize(p.name)}</td>
                      <td>{p.unitsSold}</td>
                      <td style={{ fontWeight: 600, color: '#34d399' }}>{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🏆</div>
              <p>No product data this month</p>
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="chart-card" id="section-recent-sales">
          <div className="chart-header">
            <div>
              <div className="chart-title">Recent Sales</div>
              <div className="chart-subtitle">Latest transactions</div>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/pos')} style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
              View All
            </button>
          </div>
          {data?.recentSales?.length > 0 ? (
            <div className="activity-list">
              {data.recentSales.map((sale) => (
                <div key={sale.id} className="activity-item">
                  <div className="activity-info">
                    <div className="activity-avatar">
                      {sale.customerName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="activity-name">{capitalize(sale.customerName)}</div>
                      <div className="activity-time">{sale.createdAt}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge ${
                      sale.paymentStatus === 'PAID' ? 'badge-success' :
                      sale.paymentStatus === 'PARTIAL' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {sale.paymentStatus}
                    </span>
                    <span className="activity-amount">{formatCurrency(sale.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🕐</div>
              <p>No sales yet. Go to POS to make your first sale!</p>
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="chart-card" id="section-top-customers">
          <div className="chart-header">
            <div>
              <div className="chart-title">Top Customers</div>
              <div className="chart-subtitle">By total purchase value</div>
            </div>
          </div>
          {data?.topCustomers?.length > 0 ? (
            <div className="table-container">
              <table className="top-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Purchases</th>
                    <th>Debt</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topCustomers.map((c, i) => (
                    <tr key={i}>
                      <td><span className="rank">{i + 1}</span></td>
                      <td style={{ fontWeight: 600 }}>{capitalize(c.name)}</td>
                      <td style={{ fontWeight: 600, color: '#34d399' }}>{formatCurrency(c.totalPurchases)}</td>
                      <td style={{ color: c.debtBalance > 0 ? '#f87171' : '#a5b4fc' }}>
                        {formatCurrency(c.debtBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <p>No customer data yet</p>
            </div>
          )}
        </div>

        {/* Low Stock Alerts — Full Width */}
        {lowStock.length > 0 && (
          <div className="chart-card span-full" id="section-low-stock">
            <div className="chart-header">
              <div>
                <div className="chart-title" style={{ color: '#fbbf24' }}>Low Stock Alerts</div>
                <div className="chart-subtitle">{lowStock.length} item{lowStock.length !== 1 ? 's' : ''} need restocking</div>
              </div>
              <span className="badge badge-warning">{lowStock.length}</span>
            </div>
            <div className="table-container">
              <table className="top-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{capitalize(p.name)}</td>
                      <td style={{ color: '#a5b4fc' }}>{p.sku || '—'}</td>
                      <td style={{ color: '#a5b4fc' }}>{p.category || '—'}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: p.stockQty === 0 ? '#f87171' : '#fbbf24',
                          background: p.stockQty === 0 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                        }}>
                          {p.stockQty}
                        </span>
                      </td>
                      <td style={{ color: '#a5b4fc' }}>{p.lowStockThreshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer Summary ─── */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap',
        padding: '1rem 0', borderTop: '1px solid rgba(99,102,241,0.08)',
        fontSize: '0.75rem', color: 'rgba(165,180,252,0.5)',
      }}>
        <span>📦 {data?.totalProducts || 0} products</span>
        <span>👥 {data?.totalCustomers || 0} customers</span>
        <span>🧾 {data?.totalSalesThisMonth || 0} sales this month</span>
        <span>💰 Week: {formatCurrency(data?.weeklyRevenue)}</span>
      </div>
    </div>
  );
}
