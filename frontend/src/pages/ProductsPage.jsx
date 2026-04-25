import { useState, useEffect, useMemo, useCallback } from 'react';
import { productApi } from '../api';
import { formatCurrency, capitalize } from '../utils/helpers';
import Modal from '../components/Modal';

const emptyForm = { name: '', sku: '', category: '', price: '', stockQty: '', lowStockThreshold: '10' };

// ─── Status helpers ───
function getProductStatus(p) {
  if (p.stockQty === 0) return { label: 'Out of Stock', cls: 'badge-danger', key: 'out' };
  if (p.lowStock || p.stockQty <= p.lowStockThreshold) return { label: 'Low Stock', cls: 'badge-warning', key: 'low' };
  return { label: 'In Stock', cls: 'badge-success', key: 'in' };
}

// ─── Overflow Menu ───
function OverflowMenu({ onEdit, onDelete, productName }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!e.target.closest('.prod-overflow')) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="prod-overflow" style={{ position: 'relative' }}>
      <button className="prod-action-btn" onClick={onEdit} aria-label="Edit product">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit
      </button>
      <button className="prod-more-btn" onClick={() => setOpen(!open)} aria-label="More actions">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
        </svg>
      </button>
      {open && (
        <div className="prod-overflow-menu">
          <button className="prod-overflow-item danger" onClick={() => { setOpen(false); onDelete(); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// ─── MAIN PRODUCTS PAGE ───
// ═══════════════════════════════════════
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filters & sorting
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortPrice, setSortPrice] = useState(''); // '' | 'asc' | 'desc'

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk selection
  const [selected, setSelected] = useState(new Set());

  // Low stock banner
  const [showLowBanner, setShowLowBanner] = useState(true);

  // Success notification
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await productApi.getAll({ search, page, size: pageSize });
      setProducts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Derived data ───
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return [...cats].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (categoryFilter) {
      result = result.filter(p => (p.category || '') === categoryFilter);
    }
    if (statusFilter === 'in') {
      result = result.filter(p => p.stockQty > 0 && !p.lowStock && p.stockQty > p.lowStockThreshold);
    } else if (statusFilter === 'low') {
      result = result.filter(p => p.stockQty > 0 && (p.lowStock || p.stockQty <= p.lowStockThreshold));
    } else if (statusFilter === 'out') {
      result = result.filter(p => p.stockQty === 0);
    }
    if (sortPrice === 'asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortPrice === 'desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, categoryFilter, statusFilter, sortPrice]);

  const stats = useMemo(() => {
    const low = products.filter(p => p.stockQty > 0 && (p.lowStock || p.stockQty <= p.lowStockThreshold)).length;
    const out = products.filter(p => p.stockQty === 0).length;
    return { total: totalElements, low, out };
  }, [products, totalElements]);

  // ─── Selection ───
  const allVisibleSelected = filteredProducts.length > 0 && filteredProducts.every(p => selected.has(p.id));
  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredProducts.map(p => p.id)));
    }
  };
  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  // ─── CRUD handlers ───
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
        showSuccess('Product updated successfully');
      } else {
        await productApi.create(payload);
        showSuccess('Product created successfully');
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (p) => {
    setDeleteTarget(p);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      showSuccess(`"${deleteTarget.name}" deleted`);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} selected product(s)?`)) return;
    for (const id of selected) {
      try { await productApi.delete(id); } catch {}
    }
    setSelected(new Set());
    showSuccess(`${selected.size} product(s) deleted`);
    loadProducts();
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleExport = () => {
    const rows = (selected.size > 0 ? products.filter(p => selected.has(p.id)) : products);
    const csv = [
      ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'].join(','),
      ...rows.map(p => [
        `"${p.name}"`, p.sku || '', p.category || '', p.price, p.stockQty, getProductStatus(p).label
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `products_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // ─── Pagination helpers ───
  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalElements);

  const cycleSortPrice = () => {
    setSortPrice(prev => prev === '' ? 'asc' : prev === 'asc' ? 'desc' : '');
  };

  return (
    <div className="prod-page">
      {/* ─── Header ─── */}
      <div className="prod-header">
        <div>
          <h1 className="prod-title">Products</h1>
          <p className="prod-subtitle">
            {stats.total} product{stats.total !== 1 ? 's' : ''}
            {stats.low > 0 && <span className="prod-stat-dot warning" />}
            {stats.low > 0 && <span className="prod-stat-warn">{stats.low} low stock</span>}
            {stats.out > 0 && <span className="prod-stat-dot danger" />}
            {stats.out > 0 && <span className="prod-stat-danger">{stats.out} out of stock</span>}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="add-product-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Product
        </button>
      </div>

      {/* ─── Success notification ─── */}
      {successMsg && (
        <div className="pos-notification success">
          ✅ {successMsg}
          <button onClick={() => setSuccessMsg('')} className="pos-notif-close">✕</button>
        </div>
      )}

      {/* ─── Low Stock Banner ─── */}
      {showLowBanner && stats.low > 0 && (
        <div className="prod-low-banner" id="low-stock-banner">
          <div className="prod-low-banner-content">
            <span>⚠️</span>
            <span>
              <strong>{stats.low} product{stats.low !== 1 ? 's are' : ' is'} running low on stock.</strong>{' '}
              <button
                className="prod-low-banner-link"
                onClick={() => { setStatusFilter('low'); setShowLowBanner(false); }}
              >
                Review now →
              </button>
            </span>
          </div>
          <button className="prod-low-banner-dismiss" onClick={() => setShowLowBanner(false)} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* ─── Toolbar ─── */}
      <div className="prod-toolbar">
        <div className="prod-search-wrap">
          <svg className="prod-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="input-field prod-search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            id="product-search"
          />
          {search && <button className="prod-search-clear-btn" onClick={() => setSearch('')}>✕</button>}
        </div>

        <div className="prod-filters">
          <select
            className="input-field prod-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            id="filter-category"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="input-field prod-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="filter-status"
          >
            <option value="">All Status</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <button className={`prod-sort-btn ${sortPrice ? 'active' : ''}`} onClick={cycleSortPrice} id="sort-price-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
            </svg>
            Price {sortPrice === 'asc' ? '↑' : sortPrice === 'desc' ? '↓' : ''}
          </button>

          <button className="prod-export-btn" onClick={handleExport} id="export-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* ─── Bulk Actions Bar ─── */}
      {selected.size > 0 && (
        <div className="prod-bulk-bar" id="bulk-actions">
          <span className="prod-bulk-count">{selected.size} item{selected.size !== 1 ? 's' : ''} selected</span>
          <div className="prod-bulk-actions">
            <button className="prod-bulk-btn danger" onClick={handleBulkDelete}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Delete Selected
            </button>
            <button className="prod-bulk-btn" onClick={handleExport}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export Selected
            </button>
          </div>
          <button className="prod-bulk-clear" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {/* ─── Table ─── */}
      <div className="prod-table-card" id="products-table">
        <div className="table-container">
          <table className="prod-table">
            <thead>
              <tr>
                <th className="prod-th-check">
                  <input
                    type="checkbox"
                    className="prod-checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th>Product Name</th>
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
                    <td colSpan={8}>
                      <div className="animate-pulse" style={{ height: '1rem', background: 'rgba(99,102,241,0.06)', borderRadius: '0.5rem' }} />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="prod-empty-state">
                      <div className="prod-empty-icon">📦</div>
                      <h3 className="prod-empty-title">
                        {products.length === 0 ? 'No products yet' : 'No matching products'}
                      </h3>
                      <p className="prod-empty-desc">
                        {products.length === 0
                          ? 'Add your first product to start managing your inventory'
                          : 'Try adjusting your search or filters'}
                      </p>
                      {products.length === 0 && (
                        <button className="btn-primary" onClick={openCreate} style={{ marginTop: '1rem' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          Add Your First Product
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const status = getProductStatus(p);
                  return (
                    <tr key={p.id} className={`prod-row ${selected.has(p.id) ? 'selected' : ''} ${idx % 2 === 1 ? 'alt' : ''}`}>
                      <td className="prod-td-check">
                        <input
                          type="checkbox"
                          className="prod-checkbox"
                          checked={selected.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          aria-label={`Select ${p.name}`}
                        />
                      </td>
                      <td className="prod-td-name">{capitalize(p.name)}</td>
                      <td className="prod-td-sku">{p.sku || '—'}</td>
                      <td className="prod-td-category">
                        {p.category ? (
                          <span className="prod-cat-badge">{p.category}</span>
                        ) : '—'}
                      </td>
                      <td className="prod-td-price">{formatCurrency(p.price)}</td>
                      <td className="prod-td-stock">
                        <span className={`prod-stock-val ${status.key}`}>{p.stockQty} units</span>
                      </td>
                      <td>
                        <span className={`badge ${status.cls}`}>{status.label}</span>
                      </td>
                      <td>
                        <OverflowMenu
                          onEdit={() => openEdit(p)}
                          onDelete={() => confirmDelete(p)}
                          productName={p.name}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Pagination ─── */}
      {totalElements > 0 && (
        <div className="prod-pagination" id="pagination">
          <span className="prod-page-info">
            Showing {startItem}–{endItem} of {totalElements} product{totalElements !== 1 ? 's' : ''}
          </span>
          <div className="prod-page-controls">
            <button
              className="prod-page-btn"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ← Previous
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const pNum = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
              return (
                <button
                  key={pNum}
                  className={`prod-page-num ${page === pNum ? 'active' : ''}`}
                  onClick={() => setPage(pNum)}
                >
                  {pNum + 1}
                </button>
              );
            })}
            <button
              className="prod-page-btn"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ─── Add/Edit Product Modal ─── */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Product' : 'Add Product'}>
        {error && (
          <div className="pos-notification error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="pos-field-label" style={{ marginBottom: '0.375rem' }}>Product Name *</label>
            <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Basmati Rice 5kg" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="pos-field-label" style={{ marginBottom: '0.375rem' }}>SKU</label>
              <input type="text" className="input-field" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. BR-5KG-001" />
            </div>
            <div>
              <label className="pos-field-label" style={{ marginBottom: '0.375rem' }}>Category</label>
              <input type="text" className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Groceries" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="pos-field-label" style={{ marginBottom: '0.375rem' }}>Price (₹) *</label>
              <input type="number" step="0.01" min="0" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="0.00" />
            </div>
            <div>
              <label className="pos-field-label" style={{ marginBottom: '0.375rem' }}>Stock Qty *</label>
              <input type="number" min="0" className="input-field" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })} required placeholder="0" />
            </div>
            <div>
              <label className="pos-field-label" style={{ marginBottom: '0.375rem' }}>Low Threshold</label>
              <input type="number" min="0" className="input-field" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} placeholder="10" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirmation Modal ─── */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--color-text)' }}>"{deleteTarget?.name}"</strong>?
            This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setDeleteTarget(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button className="btn-danger" onClick={handleDelete} disabled={deleting} style={{ flex: 1, justifyContent: 'center' }}>
              {deleting ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
