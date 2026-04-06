import { useState, useEffect } from 'react';
import { productApi } from '../api';
import { formatCurrency } from '../utils/helpers';
import Modal from '../components/Modal';

const emptyForm = { name: '', sku: '', category: '', price: '', stockQty: '', lowStockThreshold: '10' };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await productApi.getAll({ search, page, size: 15 });
      setProducts(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      sku: p.sku || '',
      category: p.category || '',
      price: p.price.toString(),
      stockQty: p.stockQty.toString(),
      lowStockThreshold: p.lowStockThreshold.toString(),
    });
    setEditId(p.id);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      name: form.name,
      sku: form.sku || null,
      category: form.category || null,
      price: parseFloat(form.price),
      stockQty: parseInt(form.stockQty),
      lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
    };
    try {
      if (editId) {
        await productApi.update(editId, payload);
      } else {
        await productApi.create(payload);
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await productApi.delete(id);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Products</h1>
          <p className="text-text-muted text-sm mt-1">Manage your inventory</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          className="input-field"
          placeholder="Search products by name, SKU, or category..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      {/* Table */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7}><div className="h-4 bg-primary/5 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-text-muted py-12">No products found</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium text-text">{p.name}</td>
                    <td className="text-text-muted font-mono text-xs">{p.sku || '-'}</td>
                    <td className="text-text-muted">{p.category || '-'}</td>
                    <td className="font-semibold text-text">{formatCurrency(p.price)}</td>
                    <td>
                      <span className={`font-semibold ${p.lowStock ? (p.stockQty === 0 ? 'text-danger' : 'text-warning') : 'text-success'}`}>
                        {p.stockQty}
                      </span>
                    </td>
                    <td>
                      {p.lowStock ? (
                        <span className="badge badge-warning">Low Stock</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="btn-secondary py-1.5 px-3 text-xs">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="btn-danger py-1.5 px-3 text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary py-2 px-4 text-xs">Previous</button>
          <span className="flex items-center text-sm text-text-muted px-4">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary py-2 px-4 text-xs">Next</button>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Product' : 'Add Product'}>
        {error && <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Name *</label>
            <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">SKU</label>
              <input type="text" className="input-field" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Category</label>
              <input type="text" className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Price *</label>
              <input type="number" step="0.01" min="0" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Stock *</label>
              <input type="number" min="0" className="input-field" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Low Threshold</label>
              <input type="number" min="0" className="input-field" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
