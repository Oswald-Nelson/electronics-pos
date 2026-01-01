/**
 * AdminDashboard.jsx
 * Dashboard overview for admins: quick summaries and user management.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading";
import { useToast } from '../components/ToastProvider'

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddTeller, setShowAddTeller] = useState(false);
  const toast = useToast();

  // Fetch statistics and lists on mount

  const fetchAll = async () => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const [pRes, sRes, uRes] = await Promise.all([
        axios.get("http://localhost:5000/api/products", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/sales", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/users", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProducts(pRes.data);
      setSales(sRes.data);
      setUsers(uRes.data);
    } catch (err) {
      console.error(err);
      toast.add(err.response?.data?.message || "Failed to load dashboard data", 'error');
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
  };

  // safe: fetch dashboard data on mount
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAll();
  }, []);

  const totalProducts = products.length;
  const now = new Date();
  const salesToday = sales.filter(s => new Date(s.date).toDateString() === now.toDateString()).length;
  const salesThisMonth = sales.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const numTellers = users.filter(u => u.role === 'teller').length;
  const numClients = users.filter(u => u.role === 'client').length;
  const lowStock = products.filter(p => p.quantityInStock <= 5);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/products" className="p-3 bg-blue-500 text-white rounded">Manage Products</Link>
          <Link to="/sales" className="p-3 bg-green-500 text-white rounded">View Sales</Link>
        </div>
      </div>

      {loading ? (
        <Loading size="lg" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-sm text-gray-600">Total Products</div>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-sm text-gray-600">Sales Today</div>
              <div className="text-2xl font-bold">{salesToday}</div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-sm text-gray-600">Sales This Month</div>
              <div className="text-2xl font-bold">{salesThisMonth}</div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-sm text-gray-600">Number of Tellers</div>
              <div className="text-2xl font-bold">{numTellers}</div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-sm text-gray-600">Number of Clients</div>
              <div className="text-2xl font-bold">{numClients}</div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-sm text-gray-600">Low Stock Items</div>
              <div className="text-2xl font-bold">{lowStock.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded shadow-sm">
              <h2 className="font-semibold mb-3">Inventory Monitoring</h2>
              {lowStock.length === 0 ? (
                <div>No low stock items 🎉</div>
              ) : (
                <ul className="space-y-2">
                  {lowStock.map(p => (
                    <li key={p._id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-600">Stock: {p.quantityInStock}</div>
                      </div>
                      <div>
                        <Link to="/admin/products" className="px-2 py-1 bg-yellow-400 rounded">View</Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white p-4 rounded shadow-sm lg:col-span-2">
              <h2 className="font-semibold mb-3">User Management</h2>
              <div className="flex items-center gap-2 mb-4">
                <button className="btn-primary" onClick={() => setShowAddTeller(true)}>Add Teller</button>
                <button className="btn-secondary" onClick={fetchAll}>Refresh</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Tellers</h3>
                  <ul className="space-y-2">
                    {users.filter(u => u.role === 'teller').map(u => (
                      <li key={u._id} className="flex justify-between items-center border rounded p-2">
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-sm text-gray-600">{u.email}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn-secondary">Edit</button>
                          <button className="btn-danger" onClick={() => deleteUser(u._id)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Clients</h3>
                  <ul className="space-y-2">
                    {users.filter(u => u.role === 'client').map(u => (
                      <li key={u._id} className="flex justify-between items-center border rounded p-2">
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-sm text-gray-600">{u.email}</div>
                        </div>
                        <div>
                          <button className="btn-danger" onClick={() => deleteUser(u._id)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {showAddTeller && (
            <AddTellerModal onClose={() => setShowAddTeller(false)} onAdded={() => { setShowAddTeller(false); fetchAll(); }} />
          )}
        </>
      )}
    </div>
  );
}

function AddTellerModal({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleAdd = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/users', { name, email, password, role: 'teller' }, { headers: { Authorization: `Bearer ${token}` } });
      onAdded();
    } catch (err) {
      toast.add(err.response?.data?.message || 'Failed to add teller', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4">Add Teller</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full input mb-2" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full input mb-2" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full input mb-4" />
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1" onClick={onClose}>Cancel</button>
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleAdd} disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
        </div>
      </div>
    </div>
  );
}
