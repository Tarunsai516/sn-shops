import { useState, useEffect } from 'react';
import { dashboardApi, productApi } from '../api';
import { formatCurrency } from '../utils/helpers';

export default function DashboardPage() {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-4 w-24 bg-primary/10 rounded mb-3" />
              <div className="h-8 w-32 bg-primary/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Today's Revenue", value: formatCurrency(data?.dailyRevenue), color: 'purple', icon: '💰' },
    { label: 'Outstanding Debt', value: formatCurrency(data?.totalOutstandingDebt), color: 'red', icon: '📋' },
    { label: 'Low Stock Items', value: data?.lowStockCount || 0, color: 'orange', icon: '⚠️' },
    { label: 'Total Products', value: data?.totalProducts || 0, color: 'blue', icon: '📦' },
    { label: 'Total Customers', value: data?.totalCustomers || 0, color: 'green', icon: '👥' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Overview of your shop's performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{stat.label}</span>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚠️</span>
            <h2 className="text-lg font-bold text-warning">Low Stock Alerts</h2>
            <span className="badge badge-warning ml-2">{lowStock.length}</span>
          </div>
          <div className="table-container">
            <table className="data-table">
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
                    <td className="font-medium text-text">{p.name}</td>
                    <td className="text-text-muted">{p.sku || '-'}</td>
                    <td className="text-text-muted">{p.category || '-'}</td>
                    <td>
                      <span className={`font-semibold ${p.stockQty === 0 ? 'text-danger' : 'text-warning'}`}>
                        {p.stockQty}
                      </span>
                    </td>
                    <td className="text-text-muted">{p.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
