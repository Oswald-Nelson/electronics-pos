/**
 * AdminProducts.jsx
 * Admin view to manage products: list, edit, delete and sync images.
 * Inline comments added for admin actions and modal behavior.
 */
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import { useToast } from '../components/ToastProvider'

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Fetch products for admin management

  const fetchProducts = async () => {
    // avoid false positive from react-hooks rule when called from a mount effect
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

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <div className="flex gap-2">
          <button
            className="btn-primary"
            onClick={() => (window.location.href = "/add-product")}
          >
            Add Product
          </button>
          <button className="btn-primary" onClick={async ()=>{const token=localStorage.getItem('token'); await axios.post('http://localhost:5000/api/products/assign-images', {}, { headers: { Authorization: `Bearer ${token}` } }); fetchProducts();}}>Sync Images</button>
        </div>
      </div>

      {loading ? (
        <Loading size={8} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Image</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Brand</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td className="border p-2">
                  <img src={p.image ? (p.image.startsWith('/') ? `http://localhost:5000${p.image}` : p.image) : '/vite.svg'} alt={p.name} className="product-thumb" />
                </td>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">${p.price}</td>
                <td className="border p-2">{p.quantityInStock}</td>
                <td className="border p-2">{p.brand}</td>
                <td className="border p-2 space-x-2">
                  <button
                    className="btn-secondary px-2 py-1"
                    onClick={() => setEditing({ ...p })}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger px-2 py-1"
                    onClick={async () => {
                      if (!confirm("Delete this product?")) return;
                      const token = localStorage.getItem("token");
                      try {
                        await axios.delete(`http://localhost:5000/api/products/${p._id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        fetchProducts();
                      } catch (err) {
                        toast.add(err.response?.data?.message || 'Delete failed', 'error');
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {editing && (
        <EditModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}

function EditModal({ product, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [quantityInStock, setQuantityInStock] = useState(0);
  const [brand, setBrand] = useState("");
  const [image, setImage] = useState("")
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const toast = useToast()

  // Initialize local state whenever a new product is passed in
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!product) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(product.name || "");
    setPrice(product.price ?? 0);
    setQuantityInStock(product.quantityInStock ?? 0);
    setBrand(product.brand || "");
    setImage(product.image || "");
  }, [product]);

  useEffect(()=>{
    const token = localStorage.getItem('token')
    axios.get('http://localhost:5000/api/products/images', { headers: { Authorization: `Bearer ${token}` } })
      .then(res=> setImages(res.data || []))
      .catch(()=> setImages([]))
  },[])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if(!file) return
    const token = localStorage.getItem('token')
    const fd = new FormData(); fd.append('image', file)
    try{ setUploading(true); const res = await axios.post('http://localhost:5000/api/products/upload', fd, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }); setImage(res.data.url); setImages(prev=>[...prev, res.data.filename]); setUploading(false) }catch(e){ setUploading(false); toast.add('Upload failed', 'error') }
  }

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/products/${product._id}`,
        { name, price: parseFloat(price) || 0, quantityInStock: parseInt(quantityInStock) || 0, brand, image },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSaved();
    } catch (err) {
      toast.add(err.response?.data?.message || "Failed to update product", 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4">Edit Product</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full input mb-2" />
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full input mb-2" />
        <input type="number" value={quantityInStock} onChange={(e) => setQuantityInStock(e.target.value)} className="w-full input mb-2" />
        <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full input mb-2" />
        <label className="block mb-2">Image</label>
        <select className="w-full input mb-2" value={image} onChange={e=> setImage(e.target.value)}>
          <option value="">-- select --</option>
          {images.map(i=> <option key={i} value={`/uploads/products/${i}`}>{i}</option>)}
        </select>
        <input type="file" accept="image/*" onChange={handleUpload} className="w-full input mb-2" />
        {uploading && <div className="text-sm muted">Uploading...</div>}
        {image && <img src={image.startsWith('/')? `http://localhost:5000${image}`: image} alt="preview" className="w-24 rounded mb-2" />}
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1" onClick={onClose}>Cancel</button>
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
