/**
 * TellerDashboard.jsx
 * Point-of-sale dashboard for teller users. Supports searching, cart management, checkout and sales reports.
 * Inline comments explain key actions: fetching, adding to cart, checkout validation.
 */
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import { useToast } from '../components/ToastProvider'

export default function TellerDashboard() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState("");

  // Fetch products and sales for the logged-in teller

  const [search, setSearch] = useState("");
  const [productDetails, setProductDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentBreakdown, setPaymentBreakdown] = useState({ cash: 0, momo: 0, card: 0, other: 0 });
  const [amountPaid, setAmountPaid] = useState(0)
  const [change, setChange] = useState(0)
  const [mySales, setMySales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesFilters, setSalesFilters] = useState({ startDate: "", endDate: "", productId: "", minAmount: "", maxAmount: "" });
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);
  const [lookupClient, setLookupClient] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const toast = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchMySales = async (filters = {}) => {
    setSalesLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setMySales(res.data);
    } catch (err) {
      console.error(err);
    }
    setSalesLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProducts();
    fetchMySales();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => (p.name || "").toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q));
  }, [products, search]);

  const addToCart = (product, qty = 1) => {
    setCart((c) => {
      const existing = c.find((i) => i.product._id === product._id);
      if (existing) {
        return c.map((i) => i.product._id === product._id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...c, { product, qty }];
    });
  };

  const updateQty = (productId, qty) => {
    setCart((c) => c.map((i) => i.product._id === productId ? { ...i, qty: Math.max(1, qty) } : i));
  };

  const removeFromCart = (productId) => {
    setCart((c) => c.filter((i) => i.product._id !== productId));
  };

  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const handleCheckout = async () => {
    if (!cart.length) { toast.add("Cart is empty", 'error'); return }
    const total = cart.reduce((s,i)=> s + i.product.price * i.qty, 0)
    const breakdownTotal = Object.values(paymentBreakdown).reduce((a,b)=>a + (Number(b)||0), 0)

    if(paymentMethod === 'other'){
      if(breakdownTotal < total || breakdownTotal === 0){ toast.add('Enter full payment breakdown', 'error'); return }
    } else {
      if(Number(amountPaid) < total){ toast.add('Amount received is insufficient', 'error'); return }
    }

    const token = localStorage.getItem("token");
    const items = cart.map((i) => ({ product: i.product._id, qty: i.qty }));

    const paymentBreakdownToSend = paymentMethod === 'other' ? { ...paymentBreakdown } : { [paymentMethod]: Number(amountPaid) }

    try {
      await axios.post(
        "http://localhost:5000/api/sales",
        { items, clientId: clientId || null, paymentMethod, paymentBreakdown: paymentBreakdownToSend, paymentReceived: paymentMethod === 'other' ? breakdownTotal : Number(amountPaid), change: paymentMethod === 'other' ? Number(breakdownTotal - total) : Number(amountPaid - total) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.add("Checkout successful", 'success');
      setCart([]);
      setPaymentBreakdown({ cash:0,momo:0,card:0,other:0 });
      setAmountPaid(0)
      fetchProducts();
      fetchMySales();
    } catch (err) {
      toast.add(err.response?.data?.message || "Checkout failed", 'error');
    }
  };

  const openProduct = (p) => setProductDetails({ ...p, qty: 1 });
  const closeProduct = () => setProductDetails(null);

  const handleAddFromDetails = () => {
    if (!productDetails) return;
    addToCart(productDetails, Number(productDetails.qty || 1));
    toast.add('Added to cart', 'success');
    closeProduct();
  };

  const handleLookupClient = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${lookupClient}`, { headers: { Authorization: `Bearer ${token}` } });
      const salesRes = await axios.get('http://localhost:5000/api/sales', { headers: { Authorization: `Bearer ${token}` }, params: { clientId: lookupClient } });
      setLookupResult({ user: res.data, sales: salesRes.data });
    } catch (err) {
      toast.add(err.response?.data?.message || 'Lookup failed', 'error');
      setLookupResult(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = '/';
  };

  // compute daily summary
  const now = new Date();
  const todaysSales = mySales.filter(s => new Date(s.date).toDateString() === now.toDateString());
  const totalToday = todaysSales.reduce((a,b)=>a + Number(b.totalAmount || 0),0);
  const txCountToday = todaysSales.length;
  const paymentBreakdownToday = todaysSales.reduce((acc, s) => {
    acc.cash += (s.paymentBreakdown?.cash || 0);
    acc.momo += (s.paymentBreakdown?.momo || 0);
    acc.card += (s.paymentBreakdown?.card || 0);
    acc.other += (s.paymentBreakdown?.other || 0);
    return acc;
  }, { cash:0, momo:0, card:0, other:0 });

  const topProductsToday = (() => {
    const map = {};
    todaysSales.forEach(s => s.items.forEach(it => {
      const name = it.product?.name || it.product;
      map[name] = (map[name] || 0) + it.qty;
    }));
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5);
  })();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Point of Sale</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm">{localStorage.getItem('userName') || ''}</div>
          <button className="btn-secondary" onClick={() => setShowProfile(true)}>Profile</button>
          <button className="btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="md:flex gap-6">
        <div className="md:w-2/3">
          <div className="flex items-center gap-2 mb-3">
            <input placeholder="Search products..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full input mb-2" />
            <button className="btn-secondary" onClick={() => { setSearch(''); }}>Clear</button>
            <button className="btn-primary" onClick={() => setShowCustomerLookup(true)}>Customer Lookup</button>
          </div>

          <h2 className="font-semibold mb-2">Products</h2>
          {loading ? (
            <Loading size="md" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <div key={p._id} className="border p-3 rounded">
                  <div className="mb-3 h-36 overflow-hidden rounded">
                    <img src={p.image ? (p.image.startsWith('/')? `http://localhost:5000${p.image}` : p.image) : '/vite.svg'} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm">${p.price}</div>
                  <div className="text-sm">Stock: {p.quantityInStock} {p.quantityInStock <=0 ? '(Out of stock)' : p.quantityInStock<=5 ? '(Low)' : ''}</div>
                  <div className="flex gap-2 mt-2">
                    <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => openProduct(p)} disabled={p.quantityInStock<=0}>Details</button>
                    <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => { addToCart(p); toast.add('Added to cart', 'success') }} disabled={p.quantityInStock<=0}>Add</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:w-1/3 border p-4 rounded">
          <h2 className="font-semibold">Cart</h2>
          <div className="space-y-2 max-h-96 overflow-auto">
            {cart.map((i) => (
              <div key={i.product._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{i.product.name}</div>
                  <div className="text-sm">${i.product.price} x {i.qty}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" value={i.qty} onChange={(e) => updateQty(i.product._id, parseInt(e.target.value || 1))} className="w-16 input" />
                  <button className="text-red-500" onClick={() => removeFromCart(i.product._id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="mb-2">Client ID (optional)</div>
            <input value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full input mb-3" placeholder="Client user id" />

            <div className="mb-2">Payment Method</div>
            <select value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)} className="w-full input mb-3">
              <option value="cash">Cash</option>
              <option value="momo">MOMO</option>
              <option value="card">Card</option>
              <option value="other">Other / Mixed</option>
            </select>

            {paymentMethod === 'other' ? (
              <div className="space-y-2 mb-3">
                <input type="number" placeholder="Cash amount" value={paymentBreakdown.cash} onChange={(e)=>setPaymentBreakdown({...paymentBreakdown, cash: Number(e.target.value)})} className={`w-full input mb-2 ${Object.values(paymentBreakdown).reduce((a,b)=>a+b,0) < total ? 'input-invalid' : ''}`} />
                <input type="number" placeholder="MOMO amount" value={paymentBreakdown.momo} onChange={(e)=>setPaymentBreakdown({...paymentBreakdown, momo: Number(e.target.value)})} className="w-full input mb-2" />
                <input type="number" placeholder="Card amount" value={paymentBreakdown.card} onChange={(e)=>setPaymentBreakdown({...paymentBreakdown, card: Number(e.target.value)})} className="w-full input mb-2" />
                <input type="number" placeholder="Other amount" value={paymentBreakdown.other} onChange={(e)=>setPaymentBreakdown({...paymentBreakdown, other: Number(e.target.value)})} className="w-full input mb-2" />
                <div className="text-sm muted">Total: <strong>${total.toFixed(2)}</strong> • Breakdown total: <strong>${Object.values(paymentBreakdown).reduce((a,b)=>a+b,0).toFixed(2)}</strong></div>
              </div>
            ) : (
              <div className="mb-3">
                <label className="block mb-1">Amount Received</label>
                <input type="number" min="0" step="0.01" value={amountPaid} onChange={(e)=>setAmountPaid(Number(e.target.value))} className={`w-full input mb-2 ${amountPaid < total ? 'input-invalid' : ''}`} />
                <div className="text-sm muted">Total: <strong>${total.toFixed(2)}</strong> • Received: <strong>${Number(amountPaid||0).toFixed(2)}</strong> {amountPaid > total && (<span> • Change: <strong>${(amountPaid - total).toFixed(2)}</strong></span>)}</div>
              </div>
            )}

            <div className="font-bold">Total: ${total.toFixed(2)}</div>
            <button className="mt-3 w-full bg-green-600 text-white p-2 rounded" onClick={handleCheckout}>Process Payment & Save Sale</button>
          </div>
        </div>
      </div>

      <hr className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold mb-2">Daily Summary</h3>
          <div>Total sold today: <strong>${totalToday.toFixed(2)}</strong></div>
          <div>Transactions: <strong>{txCountToday}</strong></div>
          <div className="mt-2 font-semibold">Top Products</div>
          <ul className="space-y-1">
            {topProductsToday.map(([name, qty]) => (
              <li key={name}>{name} — {qty}</li>
            ))}
          </ul>
          <div className="mt-2 font-semibold">Payment Breakdown</div>
          <div>Cash: ${paymentBreakdownToday.cash.toFixed(2)}</div>
          <div>MOMO: ${paymentBreakdownToday.momo.toFixed(2)}</div>
          <div>Card: ${paymentBreakdownToday.card.toFixed(2)}</div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm lg:col-span-2">
          <h3 className="font-semibold mb-2">My Sales</h3>
          <div className="flex gap-2 mb-3">
            <input type="date" value={salesFilters.startDate} onChange={(e)=>setSalesFilters({...salesFilters,startDate:e.target.value})} className="input" />
            <input type="date" value={salesFilters.endDate} onChange={(e)=>setSalesFilters({...salesFilters,endDate:e.target.value})} className="input" />
            <select value={salesFilters.productId} onChange={(e)=>setSalesFilters({...salesFilters,productId:e.target.value})} className="input">
              <option value="">All Products</option>
              {products.map(p=> <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <input type="number" placeholder="Min" value={salesFilters.minAmount} onChange={(e)=>setSalesFilters({...salesFilters,minAmount:e.target.value})} className="w-24 input" />
            <input type="number" placeholder="Max" value={salesFilters.maxAmount} onChange={(e)=>setSalesFilters({...salesFilters,maxAmount:e.target.value})} className="w-24 input" />
            <button className="btn-primary" onClick={()=>fetchMySales(salesFilters)}>Filter</button>
            <button className="btn-secondary" onClick={()=>{ setSalesFilters({startDate:'',endDate:'',productId:'',minAmount:'',maxAmount:''}); fetchMySales(); }}>Reset</button>
          </div>

          {salesLoading ? <Loading size="md" /> : (
            <div className="space-y-3">
              {mySales.map(s => (
                <div key={s._id} className="border p-3 rounded">
                  <div className="flex justify-between">
                    <div>Sale ID: {s._id}</div>
                    <div>{new Date(s.date).toLocaleString()}</div>
                  </div>
                  <div className="mt-2">
                    {s.items.map(it => (
                      <div key={it.product?._id || it.product} className="flex justify-between">
                        <div>{it.product?.name || '(deleted)'} x {it.qty}</div>
                        <div>${(it.price * it.qty).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 font-bold">Total: ${s.totalAmount.toFixed(2)}</div>
                  <div className="text-sm">Payment: {s.paymentMethod}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product details modal */}
      {productDetails && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <div className="mb-3 h-36 overflow-hidden rounded">
              <img src={productDetails.image ? (productDetails.image.startsWith('/')? `http://localhost:5000${productDetails.image}` : productDetails.image) : '/vite.svg'} alt={productDetails.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold mb-2">{productDetails.name}</h2>
            <div>Price: ${productDetails.price}</div>
            <div>Stock: {productDetails.quantityInStock}</div>
            <div className="mt-2">
              <input type="number" min="1" value={productDetails.qty} onChange={(e)=>setProductDetails({...productDetails, qty: e.target.value})} className="w-full input mb-3" />
              <div className="flex justify-end gap-2">
                <button className="btn-secondary" onClick={closeProduct}>Cancel</button>
                <button className="btn-primary" onClick={handleAddFromDetails}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer lookup modal */}
      {showCustomerLookup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-2">Customer Lookup</h2>
            <input placeholder="Client ID" value={lookupClient} onChange={(e)=>setLookupClient(e.target.value)} className="w-full input mb-3" />
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={()=>setShowCustomerLookup(false)}>Close</button>
              <button className="btn-primary" onClick={handleLookupClient}>Lookup</button>
            </div>
            {lookupResult && (
              <div className="mt-4">
                <div className="font-semibold">{lookupResult.user.name} ({lookupResult.user.email})</div>
                <div className="mt-2 font-semibold">Purchase History</div>
                <div className="space-y-2 max-h-48 overflow-auto mt-2">
                  {lookupResult.sales.map(s => (
                    <div key={s._id} className="border p-2 rounded">
                      <div className="text-sm">{new Date(s.date).toLocaleString()} — ${s.totalAmount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile modal (change password) */}
      {showProfile && (
        <ProfileModal onClose={()=>setShowProfile(false)} />
      )}
    </div>
  );
}

function ProfileModal({ onClose }){
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try{
      await axios.post('http://localhost:5000/api/auth/change-password', { oldPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      toast.add('Password changed', 'success');
      onClose();
    }catch(err){
      toast.add(err.response?.data?.message || 'Change failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-2">Profile</h2>
        <input type="password" placeholder="Old password" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} className="w-full input mb-2" />
        <input type="password" placeholder="New password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full input mb-4" />
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleChange} disabled={loading}>{loading? 'Saving...' : 'Change Password'}</button>
        </div>
      </div>
    </div>
  );
}
