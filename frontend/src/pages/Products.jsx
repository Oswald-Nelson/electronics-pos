/**
 * Products.jsx
 * Public product listing page. Fetches products and allows adding to cart.
 * Comments are concise (Option A): file purpose + short notes on core functions.
 */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import { useToast } from '../components/ToastProvider'

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Fetch list of products from backend (protected endpoint)
  const fetchProducts = async () => {
    // avoid false positive from react-hooks rule when invoked from useEffect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/products", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProducts(res.data);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
  };

  // safe: fetch products on mount
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <a href="/cart" className="btn-primary">View Cart</a>
      </div>
      {loading ? (
        <Loading size={8} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p._id} className="card hover:shadow-md transition-shadow">
              <div className="mb-3 h-40 overflow-hidden rounded">
                <img src={p.image ? (p.image.startsWith('/')? `http://localhost:5000${p.image}` : p.image) : '/vite.svg'} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="font-semibold text-lg">{p.name}</div>
              <div className="text-sm text-gray-600">{p.brand} • {p.category}</div>
              <div className="mt-2 text-xl font-bold">${p.price}</div>
              <div className="text-sm text-gray-700 mt-1">Stock: {p.quantityInStock}</div>
              <div className="flex gap-2 mt-3">
                <a className="btn-secondary" href={`/products/${p._id}`}>Details</a>
                <button className="btn-primary" onClick={() => {
                  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
                  const existing = cart.find(i=>i.product._id===p._id);
                  if(existing){ existing.qty += 1; } else { cart.push({ product: p, qty: 1 }); }
                  localStorage.setItem('cart', JSON.stringify(cart));
                  const count = cart.reduce((s,i)=> s + (Number(i.qty)||0), 0)
                  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }))
                  toast.add('Added to cart', 'success');
                }} disabled={p.quantityInStock<=0}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
