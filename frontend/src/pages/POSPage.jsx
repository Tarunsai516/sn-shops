import { useState, useEffect, useRef, useCallback } from 'react';
import { productApi, customerApi, saleApi } from '../api';
import { formatCurrency, capitalize } from '../utils/helpers';
import Modal from '../components/Modal';

// ─── Category filter pill ───
function CategoryPill({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`pos-category-pill ${active ? 'active' : ''}`}
      id={`category-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      {label}
      {count != null && <span className="pos-category-count">{count}</span>}
    </button>
  );
}

// ─── Product card ───
function ProductCard({ product, onAdd, inCart }) {
  const isOutOfStock = product.stockQty <= 0;
  const isLowStock = product.stockQty > 0 && product.stockQty <= product.lowStockThreshold;

  return (
    <button
      onClick={() => onAdd(product)}
      disabled={isOutOfStock}
      className={`pos-product-card ${isOutOfStock ? 'out-of-stock' : ''} ${inCart ? 'in-cart' : ''}`}
      id={`product-card-${product.id}`}
    >
      {inCart && <div className="pos-product-in-cart-badge">In Cart</div>}
      {isLowStock && <div className="pos-product-low-badge">Low Stock</div>}
      <div className="pos-product-category">{product.category || 'General'}</div>
      <div className="pos-product-name">{capitalize(product.name)}</div>
      {product.sku && <div className="pos-product-sku">SKU: {product.sku}</div>}
      <div className="pos-product-footer">
        <span className="pos-product-price">{formatCurrency(product.price)}</span>
        <span className={`pos-product-stock ${isOutOfStock ? 'danger' : isLowStock ? 'warning' : ''}`}>
          {isOutOfStock ? 'Out of stock' : `${product.stockQty} in stock`}
        </span>
      </div>
    </button>
  );
}

// ─── Cart item row ───
function CartItem({ item, onUpdateQty, onRemove }) {
  return (
    <div className="pos-cart-item" id={`cart-item-${item.productId}`}>
      <div className="pos-cart-item-info">
        <div className="pos-cart-item-name">{capitalize(item.name)}</div>
        <div className="pos-cart-item-price">{formatCurrency(item.price)} × {item.quantity}</div>
      </div>
      <div className="pos-cart-item-controls">
        <button
          onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
          className="pos-qty-btn"
          aria-label="Decrease quantity"
        >−</button>
        <span className="pos-qty-display">{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
          className="pos-qty-btn"
          aria-label="Increase quantity"
        >+</button>
      </div>
      <div className="pos-cart-item-total">{formatCurrency(item.price * item.quantity)}</div>
      <button onClick={() => onRemove(item.productId)} className="pos-cart-remove" aria-label="Remove item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Customer Search Dropdown ───
function CustomerSelector({ customers, customerId, onSelect, onOpenNewCustomer, customerSearch, onSearchChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selectedCustomer = customers.find(c => String(c.id) === String(customerId));

  const filtered = customerSearch.trim()
    ? customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.phone && c.phone.includes(customerSearch))
      )
    : customers;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { setIsOpen(true); e.preventDefault(); }
      return;
    }
    if (e.key === 'ArrowDown') {
      setFocusIdx(prev => Math.min(prev + 1, filtered.length));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setFocusIdx(prev => Math.max(prev - 1, -1));
      e.preventDefault();
    } else if (e.key === 'Enter' && focusIdx >= 0) {
      if (focusIdx < filtered.length) {
        onSelect(String(filtered[focusIdx].id));
      }
      setIsOpen(false);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="pos-customer-selector" ref={dropdownRef}>
      <label className="pos-field-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Select Customer
      </label>

      {/* Selected display or search input */}
      {!isOpen && customerId && selectedCustomer ? (
        <div className="pos-customer-selected" onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}>
          <div className="pos-customer-avatar">{selectedCustomer.name.charAt(0).toUpperCase()}</div>
          <div className="pos-customer-selected-info">
            <span className="pos-customer-selected-name">{capitalize(selectedCustomer.name)}</span>
            {selectedCustomer.phone && <span className="pos-customer-selected-phone">{selectedCustomer.phone}</span>}
          </div>
          <button
            className="pos-customer-clear"
            onClick={(e) => { e.stopPropagation(); onSelect(''); onSearchChange(''); }}
            aria-label="Clear customer"
          >✕</button>
        </div>
      ) : (
        <div className="pos-customer-input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="input-field"
            placeholder={customerId ? 'Search customers...' : '🔍 Walk-in / Search customer...'}
            value={customerSearch}
            onChange={(e) => { onSearchChange(e.target.value); setIsOpen(true); setFocusIdx(-1); }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            id="customer-search-input"
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="pos-customer-dropdown" id="customer-dropdown">
          {/* Walk-in option */}
          <button
            className={`pos-customer-option walkin ${!customerId ? 'active' : ''} ${focusIdx === -1 ? 'focused' : ''}`}
            onClick={() => { onSelect(''); onSearchChange(''); setIsOpen(false); }}
          >
            <div className="pos-customer-avatar walkin-avatar">🏪</div>
            <div>
              <div className="pos-customer-option-name">Walk-in Customer</div>
              <div className="pos-customer-option-sub">No credit — full payment required</div>
            </div>
          </button>

          {/* Existing customers */}
          {filtered.length > 0 ? (
            <div className="pos-customer-list">
              {filtered.slice(0, 20).map((c, i) => (
                <button
                  key={c.id}
                  className={`pos-customer-option ${String(c.id) === String(customerId) ? 'active' : ''} ${focusIdx === i ? 'focused' : ''}`}
                  onClick={() => { onSelect(String(c.id)); onSearchChange(''); setIsOpen(false); }}
                >
                  <div className="pos-customer-avatar">{c.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="pos-customer-option-name">{capitalize(c.name)}</div>
                    <div className="pos-customer-option-sub">
                      {c.phone || 'No phone'}
                      {c.totalDebtBalance > 0 && <span className="pos-debt-tag">Debt: {formatCurrency(c.totalDebtBalance)}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : customerSearch.trim() ? (
            <div className="pos-customer-empty">
              <p>No customer found for "{customerSearch}"</p>
            </div>
          ) : null}

          {/* Add new customer */}
          <button className="pos-customer-add-btn" onClick={() => { setIsOpen(false); onOpenNewCustomer(); }} id="add-new-customer-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
            </svg>
            Add New Customer
          </button>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════
// ─── MAIN POS PAGE ───
// ═══════════════════════════════════════
export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustLoading, setNewCustLoading] = useState(false);
  const [newCustError, setNewCustError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadProducts(), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const loadProducts = async () => {
    try {
      const { data } = await productApi.getAll({ search, page: 0, size: 100 });
      setProducts(data.content);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data } = await customerApi.getAll({ page: 0, size: 200 });
      setCustomers(data.content);
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Cart logic ───
  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQty) {
          setError(`Only ${product.stockQty} units available for "${product.name}"`);
          setTimeout(() => setError(''), 3000);
          return prev;
        }
        return prev.map(c => c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      if (product.stockQty <= 0) {
        setError(`"${product.name}" is out of stock`);
        setTimeout(() => setError(''), 3000);
        return prev;
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        maxQty: product.stockQty,
      }];
    });
  }, []);

  const updateQty = useCallback((productId, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.productId !== productId));
    } else {
      setCart(prev => prev.map(c => c.productId === productId ? { ...c, quantity: Math.min(qty, c.maxQty) } : c));
    }
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(c => c.productId !== productId));
  }, []);

  const clearCart = () => {
    setCart([]);
    setAmountPaid('');
    setCustomerId('');
    setCustomerSearch('');
    setPaymentMethod('CASH');
  };

  // ─── Calculations ───
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const paid = parseFloat(amountPaid) || 0;
  const balance = cartTotal - paid;
  const change = paid > cartTotal ? paid - cartTotal : 0;

  // ─── Categories ───
  const categories = ['All', ...new Set(products.map(p => p.category || 'General').filter(Boolean))];
  const categoryCount = (cat) => cat === 'All' ? products.length : products.filter(p => (p.category || 'General') === cat).length;
  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => (p.category || 'General') === selectedCategory);
  const cartProductIds = new Set(cart.map(c => c.productId));

  // ─── Quick pay buttons ───
  const quickPayAmounts = cartTotal > 0
    ? [
        { label: 'Full', value: cartTotal },
        ...(cartTotal > 100 ? [{ label: `₹${Math.ceil(cartTotal / 100) * 100}`, value: Math.ceil(cartTotal / 100) * 100 }] : []),
        ...(cartTotal > 500 ? [{ label: `₹${Math.ceil(cartTotal / 500) * 500}`, value: Math.ceil(cartTotal / 500) * 500 }] : []),
      ]
    : [];

  // ─── Checkout ───
  const handleCheckout = async () => {
    if (cart.length === 0) { setError('Cart is empty'); return; }
    if (!customerId && balance > 0) { setError('Walk-in customers must pay the full amount'); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await saleApi.create({
        customerId: customerId ? parseInt(customerId) : null,
        amountPaid: paid,
        paymentMethod: paymentMethod,
        items: cart.map(c => ({ productId: c.productId, quantity: c.quantity })),
      });
      setSuccess('✅ Sale completed successfully!');
      setCart([]);
      setAmountPaid('');
      setCustomerId('');
      setCustomerSearch('');
      loadProducts();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Add New Customer ───
  const handleAddCustomer = async () => {
    if (!newCustName.trim()) { setNewCustError('Customer name is required'); return; }
    setNewCustLoading(true);
    setNewCustError('');
    try {
      const { data } = await customerApi.create({ name: newCustName.trim(), phone: newCustPhone.trim() || null });
      await loadCustomers();
      setCustomerId(String(data.id));
      setCustomerSearch('');
      setShowNewCustomer(false);
      setNewCustName('');
      setNewCustPhone('');
      setSuccess(`Customer "${data.name}" created and selected!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setNewCustError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setNewCustLoading(false);
    }
  };

  // ─── Payment status label ───
  const paymentStatus = cart.length === 0
    ? null
    : balance <= 0
      ? { label: 'PAID', cls: 'badge-success' }
      : paid > 0
        ? { label: 'PARTIAL', cls: 'badge-warning' }
        : { label: 'UNPAID', cls: 'badge-danger' };

  return (
    <div className="pos-layout">
      {/* ═══ Left: Products ═══ */}
      <div className="pos-products-panel">
        {/* Header */}
        <div className="pos-panel-header">
          <div>
            <h1 className="pos-page-title">Point of Sale</h1>
            <p className="pos-page-subtitle">{products.length} products available</p>
          </div>
          {cart.length > 0 && (
            <button className="btn-secondary" onClick={clearCart} style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
              Clear Cart
            </button>
          )}
        </div>

        {/* Notifications */}
        {error && (
          <div className="pos-notification error" id="pos-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {error}
            <button onClick={() => setError('')} className="pos-notif-close">✕</button>
          </div>
        )}
        {success && (
          <div className="pos-notification success" id="pos-success">
            {success}
            <button onClick={() => setSuccess('')} className="pos-notif-close">✕</button>
          </div>
        )}

        {/* Search */}
        <div className="pos-search-wrap">
          <svg className="pos-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="input-field pos-search-input"
            placeholder="Search by name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="product-search-input"
          />
          {search && (
            <button className="pos-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Category Pills */}
        <div className="pos-categories-scroll">
          {categories.map(cat => (
            <CategoryPill
              key={cat}
              label={cat}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              count={categoryCount(cat)}
            />
          ))}
        </div>

        {/* Product Grid */}
        <div className="pos-product-grid" id="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={addToCart}
                inCart={cartProductIds.has(p.id)}
              />
            ))
          ) : (
            <div className="pos-empty-products">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.4 }}>📦</div>
              <p>No products found</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                {search ? 'Try a different search term' : 'Add products to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Right: Cart & Checkout ═══ */}
      <div className="pos-cart-panel">
        <div className="pos-cart-container">
          {/* Cart Header */}
          <div className="pos-cart-header">
            <h2 className="pos-cart-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              Cart
            </h2>
            {cart.length > 0 && (
              <span className="pos-cart-badge">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Cart Items */}
          <div className="pos-cart-items" id="cart-items-list">
            {cart.length === 0 ? (
              <div className="pos-cart-empty">
                <div style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: '0.5rem' }}>🛒</div>
                <p style={{ fontWeight: 600 }}>Cart is empty</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  Click on products to add them here
                </p>
              </div>
            ) : (
              cart.map(item => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onUpdateQty={updateQty}
                  onRemove={removeFromCart}
                />
              ))
            )}
          </div>

          {/* Divider */}
          <div className="pos-cart-divider" />

          {/* Customer Selector */}
          <CustomerSelector
            customers={customers}
            customerId={customerId}
            onSelect={setCustomerId}
            onOpenNewCustomer={() => setShowNewCustomer(true)}
            customerSearch={customerSearch}
            onSearchChange={setCustomerSearch}
          />

          {/* Amount Paid */}
          <div className="pos-payment-section">
            <label className="pos-field-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><path d="M1 10h22"/>
              </svg>
              Payment
            </label>

            {/* Payment Method Selector */}
            <div className="payment-method-selector">
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'CASH' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('CASH')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><path d="M1 10h22"/></svg>
                Cash
              </button>
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 21V7M16 21V11"/></svg>
                UPI
              </button>
            </div>

            <input
              type="number"
              step="0.01"
              min="0"
              className="input-field pos-amount-input"
              placeholder="Enter amount paid..."
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              id="amount-paid-input"
            />
            {quickPayAmounts.length > 0 && (
              <div className="pos-quick-pay">
                {quickPayAmounts.map(q => (
                  <button
                    key={q.label}
                    className={`pos-quick-pay-btn ${paid === q.value ? 'active' : ''}`}
                    onClick={() => setAmountPaid(String(q.value))}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="pos-summary" id="checkout-summary">
            <div className="pos-summary-row">
              <span>Subtotal ({cartItemCount} items)</span>
              <span className="pos-summary-value">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="pos-summary-row">
              <span>Amount Paid</span>
              <span className="pos-summary-value" style={{ color: '#34d399' }}>{formatCurrency(paid)}</span>
            </div>
            {balance > 0 && (
              <div className="pos-summary-row">
                <span>Balance Due</span>
                <span className="pos-summary-value" style={{ color: '#f87171' }}>{formatCurrency(balance)}</span>
              </div>
            )}
            {change > 0 && (
              <div className="pos-summary-row">
                <span>Change</span>
                <span className="pos-summary-value" style={{ color: '#fbbf24' }}>{formatCurrency(change)}</span>
              </div>
            )}
            <div className="pos-summary-total">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          {/* Payment status */}
          {paymentStatus && (
            <div style={{ textAlign: 'center' }}>
              <span className={`badge ${paymentStatus.cls}`} style={{ fontSize: '0.7rem' }}>
                {paymentStatus.label}
              </span>
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            className="pos-checkout-btn"
            id="checkout-btn"
          >
            {loading ? (
              <span className="pos-checkout-loading">
                <span className="pos-spinner" />
                Processing...
              </span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                </svg>
                Complete Sale — {formatCurrency(cartTotal)}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ═══ New Customer Modal ═══ */}
      <Modal isOpen={showNewCustomer} onClose={() => { setShowNewCustomer(false); setNewCustError(''); }} title="Add New Customer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {newCustError && (
            <div className="pos-notification error" style={{ margin: 0 }}>
              {newCustError}
            </div>
          )}
          <div>
            <label className="pos-field-label" style={{ marginBottom: '0.375rem' }}>Customer Name *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Rajesh Kumar"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              autoFocus
              id="new-customer-name"
            />
          </div>
          <div>
            <label className="pos-field-label" style={{ marginBottom: '0.375rem' }}>Phone Number</label>
            <input
              type="tel"
              className="input-field"
              placeholder="e.g. 9876543210"
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value)}
              id="new-customer-phone"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              className="btn-secondary"
              onClick={() => { setShowNewCustomer(false); setNewCustError(''); }}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleAddCustomer}
              disabled={newCustLoading}
              style={{ flex: 1 }}
            >
              {newCustLoading ? 'Creating...' : 'Create & Select'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
