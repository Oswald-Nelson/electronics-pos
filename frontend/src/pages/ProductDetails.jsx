/**
 * ProductDetails.jsx
 * Shows a single product page and allows adding specified quantity to cart.
 * Inline comments explain cart storage and add-to-cart redirection.
 */
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'
import { useToast } from '../components/ToastProvider'

export default function ProductDetails(){
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const navigate = useNavigate()
  const toast = useToast()

  // Fetch product by id on mount

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    axios.get(`/api/products/${id}`)
      .then(res=> setProduct(res.data))
      .catch(()=> toast.add('Failed to load product','error'))
      .finally(()=> {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false)
      })
  },[id])

  if(loading) return <div className="p-6"><Loading size={8} /></div>
  if(!product) return <div className="p-6">Product not found</div>

  const addToCart = ()=>{
    const cart = JSON.parse(localStorage.getItem('cart')||'[]')
    const existing = cart.find(i=>i.product._id===product._id)
    if(existing){ existing.qty += qty } else { cart.push({ product, qty }) }
    localStorage.setItem('cart', JSON.stringify(cart))
    // notify header and other listeners about cart change
    const count = cart.reduce((s,i)=> s + (Number(i.qty)||0), 0)
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }))
    toast.add('Added to cart', 'success')
    navigate('/cart')
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto border rounded p-6">
        <div className="mb-4 h-64 overflow-hidden rounded">
          <img src={product.image ? (product.image.startsWith('/')? `http://localhost:5000${product.image}` : product.image) : '/vite.svg'} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="text-2xl font-bold mb-2">{product.name}</div>
        <div className="text-sm text-gray-600 mb-4">{product.brand} • {product.category}</div>
        <div className="text-xl font-semibold mb-2">${product.price}</div>
        <div className="mb-4">{product.description}</div>
        <div className="mb-4">Stock: {product.quantityInStock}</div>
        <div className="flex items-center gap-3">
          <input type="number" min="1" max={product.quantityInStock} value={qty} onChange={e=>setQty(Number(e.target.value))} className="w-24 input" />
          <button onClick={addToCart} className="px-4 py-2 bg-green-500 text-white rounded" disabled={product.quantityInStock<=0}>Add to Cart</button>
          <button onClick={()=>navigate(-1)} className="px-4 py-2 bg-gray-200 rounded">Back</button>
        </div>
      </div>
    </div>
  )
}
