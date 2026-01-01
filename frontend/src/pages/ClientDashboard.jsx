/**
 * ClientDashboard.jsx
 * Landing dashboard for clients: shows featured products, quick links and recent orders.
 * Small inline comments explain network calls and cart interactions.
 */
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loading from '../components/Loading'
import { Link } from 'react-router-dom'
import { useToast } from '../components/ToastProvider'

export default function ClientDashboard(){
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const toast = useToast()

  // Load products and recent orders (if authenticated)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingProducts(true)
    const token = localStorage.getItem('token')
    // call backend with token like Products.jsx to satisfy protected route
    axios.get('http://localhost:5000/api/products', { headers: { Authorization: `Bearer ${token}` } })
      .then(res=> {
        const data = res.data
        // ensure products is an array
        if (Array.isArray(data)) setProducts(data)
        else if (Array.isArray(data.products)) setProducts(data.products)
        else setProducts([])
      })
      .catch(()=> { setProducts([]) })
      .finally(()=> {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoadingProducts(false)
      })

    if(token){
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingOrders(true)
      axios.get('http://localhost:5000/api/sales', { headers: { Authorization: `Bearer ${token}` } })
        .then(res=> setOrders(Array.isArray(res.data) ? res.data : []))
        .catch(()=> setOrders([]))
        .finally(()=> {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLoadingOrders(false)
        })
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingOrders(false)
    }
  },[])

  const addToCart = (product)=>{
    const cart = JSON.parse(localStorage.getItem('cart')||'[]')
    const existing = cart.find(i=>i.product._id===product._id)
    if(existing){ existing.qty += 1 } else { cart.push({ product, qty: 1 }) }
    localStorage.setItem('cart', JSON.stringify(cart))
    // notify header and other listeners about cart change
    const count = cart.reduce((s,i)=> s + (Number(i.qty)||0), 0)
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }))
    toast.add('Added to cart', 'success')
  }

  const featured = Array.isArray(products) ? products.slice(0,6) : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Welcome to the Store</h1>
        <div className="flex gap-2">
          <Link to="/products" className="btn-secondary">Browse All</Link>
          <Link to="/cart" className="btn-primary">Cart</Link>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="font-semibold mb-3">Featured Products</h2>
        {loadingProducts ? (
          <Loading size={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map(p=> (
              <div key={p._id} className="card hover:shadow-md transition-shadow">
                <div className="mb-3 h-40 overflow-hidden rounded">
                  <img src={p.image ? (p.image.startsWith('/')? `http://localhost:5000${p.image}` : p.image) : '/vite.svg'} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600">{p.brand} • {p.category}</div>
                <div className="mt-2 font-bold">${p.price}</div>
                <div className="flex gap-2 mt-3">
                  <Link to={`/products/${p._id}`} className="btn-secondary">Details</Link>
                  <button className="btn-primary" onClick={()=>{ addToCart(p); toast.add('Added to cart', 'success') }} disabled={p.quantityInStock<=0}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-3">Quick Links</h2>
        <div className="flex gap-3">
          <Link to="/orders" className="px-4 py-2 border rounded">My Orders</Link>
          <Link to="/profile" className="px-4 py-2 border rounded">Profile</Link>
          <Link to="/support" className="px-4 py-2 border rounded">Support</Link>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Recent Orders</h2>
        {loadingOrders ? <Loading size={6} /> : (
          orders.length===0 ? <div className="text-gray-600">You have no recent orders.</div> : (
            <div className="space-y-3">
              {orders.slice(0,5).map(o=> (
                <div key={o._id} className="border rounded p-3 flex justify-between">
                  <div>
                    <div className="font-semibold">Order #{o._id}</div>
                    <div className="text-sm text-gray-600">{new Date(o.date).toLocaleString()}</div>
                    <div className="text-sm mt-1">Items: {o.items.reduce((s,it)=>s+it.qty,0)}</div>
                  </div>
                  <div className="font-bold">${o.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )
        )}
      </section>
    </div>
  )
}
