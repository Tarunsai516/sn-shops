import { useState, useEffect } from 'react';
import { productApi, customerApi, saleApi } from '../api';
import { formatCurrency } from '../utils/helpers';

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      const { data } = await productApi.getAll({ search, page: 0, size: 50 });
      setProducts(data.content);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data } = await customerApi.getAll({ page: 0, size: 100 });
      setCustomers(data.content);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((c) => c.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stockQty) {
        setError(`Only ${product.stockQty} units available for "${product.name}"`);
        setTimeout(() => setError(''), 3000);
        return;
      }
      setCart(cart.map((c) => c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      if (product.stockQty <= 0) {
        setError(`"${product.name}" is out of stock`);
        setTimeout(() => setError(''), 3000);
        return;
      }
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        maxQty: product.stockQty,
      }]);
    }
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      setCart(cart.filter((c) => c.productId !== productId));
    } else {
      setCart(cart.map((c) => c.productId === productId ? { ...c, quantity: Math.min(qty, c.maxQty) } : c));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((c) => c.productId !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const paid = parseFloat(amountPaid) || 0;
  const balance = cartTotal - paid;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }
    if (!customerId && balance > 0) {
      setError('Walk-in customers must pay the full amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await saleApi.create({
        customerId: customerId ? parseInt(customerId) : null,
        amountPaid: paid,
        items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
      });
      setSuccess('Sale completed successfully!');
      setCart([]);
      setAmountPaid('');
      setCustomerId('');
      loadProducts();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text">Point of Sale</h1>
        <p className="text-text-muted text-sm mt-1">Create new sales</p>
      </div>

      {error && <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">{error}</div>}
      {success && <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Products Panel */}
        <div className="lg:col-span-3 space-y-4">
          <input
            type="text"
            className="input-field"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.stockQty <= 0}
                className={`glass-card text-left cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                  p.stockQty <= 0 ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <h3 className="text-sm font-semibold text-text truncate">{p.name}</h3>
                <p className="text-xs text-text-muted mt-0.5">{p.category || 'Uncategorized'}</p>
                <div className="flex items-end justify-between mt-3">
                  <span className="text-lg font-bold text-primary-light">{formatCurrency(p.price)}</span>
                  <span className={`text-xs font-medium ${p.stockQty <= p.lowStockThreshold ? 'text-warning' : 'text-text-muted'}`}>
                    {p.stockQty} left
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart Panel */}
        <div className="lg:col-span-2">
          <div className="glass-card sticky top-4 space-y-4">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              🛒 Cart
              {cart.length > 0 && <span className="badge badge-success">{cart.length}</span>}
            </h2>

            {cart.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">Cart is empty. Click products to add.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 bg-bg/40 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{item.name}</p>
                      <p className="text-xs text-text-muted">{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-primary/10 text-primary-light flex items-center justify-center text-sm font-bold border border-primary/20 cursor-pointer">−</button>
                      <span className="w-8 text-center text-sm font-semibold text-text">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-primary/10 text-primary-light flex items-center justify-center text-sm font-bold border border-primary/20 cursor-pointer">+</button>
                    </div>
                    <span className="text-sm font-semibold text-text w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
                    <button onClick={() => removeFromCart(item.productId)} className="text-danger hover:text-danger/80 cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <hr className="border-primary/10" />

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Customer (optional)</label>
              <select
                className="input-field"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Amount Paid</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>

            {/* Summary */}
            <div className="space-y-2 p-3 bg-bg/40 rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Total</span>
                <span className="font-bold text-text text-lg">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Paid</span>
                <span className="font-semibold text-success">{formatCurrency(paid)}</span>
              </div>
              {balance > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Balance Due</span>
                  <span className="font-semibold text-danger">{formatCurrency(balance)}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className="btn-success w-full justify-center py-3 text-base"
            >
              {loading ? 'Processing...' : `Checkout ${formatCurrency(cartTotal)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
