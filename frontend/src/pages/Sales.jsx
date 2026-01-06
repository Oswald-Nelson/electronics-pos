/**
 * Sales.jsx
 * Displays sales records (role-aware on backend). Admins see all; tellers/clients see filtered results.
 */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import { useToast } from '../components/ToastProvider'

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Fetch sales from backend on mount
  const fetchSales = async () => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/sales", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(res.data);
    } catch (err) {
      toast.add(err.response?.data?.message || "Failed to load sales", 'error');
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sales</h1>
      {loading ? (
        <Loading size={8} />
      ) : (
        <div className="space-y-4">
          {sales.map((s) => (
            <div key={s._id} className="border p-4 rounded">
              <div className="flex justify-between">
                <div className="font-semibold">Date: {new Date(s.date).toLocaleString()}</div>
                <div className="font-bold">Total: ${s.totalAmount.toFixed(2)}</div>
              </div>
              {s.teller && s.teller.name && (
                <div className="text-sm">Teller: {s.teller.name}</div>
              )}
              <div className="mt-2">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Product</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.items.map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.product?.name || "(deleted)"}</td>
                        <td className="text-right">{it.qty}</td>
                        <td className="text-right">${it.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
