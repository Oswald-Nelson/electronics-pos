/**
 * Orders.jsx
 * Lists orders for the logged-in client. Fetches /api/sales and shows basic order details.
 */
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loading from '../components/Loading'
import { useToast } from '../components/ToastProvider'

export default function Orders(){
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const toast = useToast()

  // Load orders from backend on mount
  useEffect(()=>{
    const token = localStorage.getItem('token')
    axios.get('/api/sales', { headers: { Authorization: `Bearer ${token}` } })
      .then(res=> setOrders(res.data))
      .catch(()=> toast.add('Failed to load orders','error'))
      .finally(()=> setLoading(false))
  },[])

  if(loading) return <div className="p-6"><Loading size={8} /></div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {orders.length===0 ? <div className="text-gray-600">No orders yet.</div> : (
        <div className="space-y-4">
          {orders.map(o=> (
            <div key={o._id} className="border rounded p-4">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">Order #{o._id}</div>
                  <div className="text-sm text-gray-600">{new Date(o.date).toLocaleString()}</div>
                </div>
                <div className="font-bold">${o.total.toFixed(2)}</div>
              </div>
              <div className="mt-2">
                {o.items.map(it=> (
                  <div key={it.productId} className="text-sm">{it.qty} × {it.price} (product: {it.productId})</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
