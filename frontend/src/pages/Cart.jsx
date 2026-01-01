/**
 * Cart.jsx
 * Simple cart viewer that stores cart in localStorage and allows quantity updates and removal.
 */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Cart(){
  const [cart, setCart] = useState([])
  const navigate = useNavigate()

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{
    // Initialize cart state from localStorage
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(JSON.parse(localStorage.getItem('cart')||'[]'))
  },[])

  const updateQty = (idx, qty)=>{
    const copy = [...cart]
    copy[idx].qty = qty
    setCart(copy)
    localStorage.setItem('cart', JSON.stringify(copy))
    const count = copy.reduce((s,i)=> s + (Number(i.qty)||0), 0)
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }))
  }

  const removeItem = (idx)=>{
    const copy = [...cart]
    copy.splice(idx,1)
    setCart(copy)
    localStorage.setItem('cart', JSON.stringify(copy))
    const count = copy.reduce((s,i)=> s + (Number(i.qty)||0), 0)
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }))
  }

  const subtotal = cart.reduce((s,i)=> s + (i.product.price * i.qty), 0)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cart.length===0 ? (
        <div className="text-gray-600">Cart is empty. <a href="/products" className="text-blue-600">Shop now</a></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {cart.map((it, idx)=> (
              <div key={it.product._id} className="flex items-center justify-between border-b py-3 transition transform hover:scale-105 hover:shadow-md bg-white rounded">
                <div>
                  <div className="font-semibold">{it.product.name}</div>
                  <div className="text-sm text-gray-600">${it.product.price} • Stock: {it.product.quantityInStock}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" className="w-20 input" min="1" max={it.product.quantityInStock} value={it.qty} onChange={e=> updateQty(idx, Number(e.target.value))} />
                  <button className="btn-danger" onClick={()=>removeItem(idx)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="border rounded p-4">
            <div className="font-semibold">Order Summary</div>
            <div className="mt-2">Subtotal: <span className="font-bold">${subtotal.toFixed(2)}</span></div>
            <div className="mt-4">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded" onClick={()=>navigate('/checkout')}>Proceed to Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
