/**
 * AddProduct.jsx
 * Admin form to create a new product; supports selecting or uploading an image.
 * Comments note upload flow and success handling.
 */
import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from '../components/ToastProvider'

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [quantityInStock, setQuantityInStock] = useState(0)

  // Load list of available images from backend on mount

  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios.get('http://localhost:5000/api/products/images', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setImages(res.data || []))
      .catch(()=> setImages([]))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/products",
        { name, price, category, image, quantityInStock },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Product added successfully!");
      setName("");
      setPrice("");
      setCategory("");
      setImage("");
      setQuantityInStock(0)
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.add(err.response?.data?.message || "Failed to add product", 'error');
      setMessage("Failed to add product.");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const token = localStorage.getItem('token')
    const fd = new FormData()
    fd.append('image', file)
    try{
      setUploading(true)
      const res = await axios.post('http://localhost:5000/api/products/upload', fd, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } })
      setImage(res.data.url)
      setImages(prev=> [ ...(prev||[]), res.data.filename ])
      setUploading(false)
    } catch (err) {
      setUploading(false);
      console.error(err);
      toast.add('Upload failed', 'error');
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>

      {message && <p className="mb-4 text-blue-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Product Name"
          className="w-full input mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price"
          className="w-full input mb-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Category"
          className="w-full input mb-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Quantity in stock"
          className="w-full input mb-2"
          value={quantityInStock}
          onChange={(e) => setQuantityInStock(Number(e.target.value))}
          min="0"
          required
        />
        <div className="text-sm muted">Stock to be set: <strong>{quantityInStock}</strong></div>

        <div className="space-y-2">
          <label className="text-sm">Choose Image</label>
          <select className="w-full input mb-2" value={image} onChange={e=>setImage(e.target.value)}>
            <option value="">-- select from existing --</option>
            {images.map(i=> (
              <option key={i} value={`/uploads/products/${i}`}>{i}</option>
            ))}
          </select>
          <div className="text-sm muted">Or upload a new image</div>
          <input type="file" accept="image/*" onChange={handleUpload} className="w-full input" />
          {uploading && <div className="text-sm muted">Uploading...</div>}
          {image && <img src={image.startsWith('/')? `http://localhost:5000${image}`: image} alt="preview" className="w-full mt-2 rounded" />}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
