/**
 * Checkout.jsx
 * Cart checkout page. Handles payment breakdowns and places orders via protected API.
 */
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/ToastProvider'
export default function Checkout(){
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [breakdown, setBreakdown] = useState({ cash:0, momo:0, card:0, other:0 })
  const [amountPaid, setAmountPaid] = useState(0)
  const [change, setChange] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  // Load cart from localStorage on mount

  useEffect(()=>{
    setCart(JSON.parse(localStorage.getItem('cart')||'[]'))
  },[])

  const subtotal = cart.reduce((s,i)=> s + (i.product.price * i.qty), 0)

  // Keep amountPaid in sync with subtotal when switching payment method
  useEffect(()=>{
    if(paymentMethod !== 'other') setAmountPaid(Number(subtotal.toFixed(2)) || 0)
  },[paymentMethod, subtotal])

  const breakdownTotal = Object.values(breakdown).reduce((a,b)=> a + (Number(b)||0), 0)
  const isPaymentValid = () => {
    if(subtotal <= 0) return false
    if(paymentMethod === 'other') return breakdownTotal >= subtotal && breakdownTotal > 0
    return Number(amountPaid) >= subtotal
  }

  useEffect(()=>{
    // compute change for non-other methods
    if(paymentMethod !== 'other'){
      const ch = Number(amountPaid) - Number(subtotal)
      setChange(Number(isFinite(ch) ? ch : 0))
    } else {
      setChange(Number(Math.max(0, breakdownTotal - subtotal)))
    }
    setError('')
  },[amountPaid, breakdown, paymentMethod, subtotal])

  const handlePay = async ()=>{
    if(cart.length===0){ toast.add('Cart is empty', 'error'); return }
    if(!isPaymentValid()){ toast.add('Payment amount is insufficient', 'error'); setError('Insufficient payment'); return }

    const token = localStorage.getItem('token')
    setLoading(true)
    const items = cart.map(i=> ({ productId: i.product._id, qty: i.qty, price: i.product.price }))

    // prepare paymentBreakdown to send to server
    let paymentBreakdownToSend = {}
    if(paymentMethod === 'other') paymentBreakdownToSend = { ...breakdown }
    else paymentBreakdownToSend = { [paymentMethod]: Number(amountPaid) }

    try{
      await axios.post('/api/sales', { items, paymentMethod, paymentBreakdown: paymentBreakdownToSend, paymentReceived: Number(paymentMethod === 'other' ? breakdownTotal : amountPaid), change: Number(change) }, { headers: { Authorization: `Bearer ${token}` } })
      localStorage.removeItem('cart')
      // notify header and other listeners
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 0 } }))
      toast.add('Order placed', 'success')
      navigate('/orders')
    }catch(e){
      console.error(e)
      toast.add('Failed to place order', 'error')
    }finally{ setLoading(false) }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {cart.map(it=> (
            <div key={it.product._id} className="flex items-center justify-between border-b py-3 transition transform hover:scale-105 hover:shadow-md bg-white rounded">
              <div>
                <div className="font-semibold">{it.product.name}</div>
                <div className="text-sm text-gray-600">{it.qty} × ${it.product.price}</div>
              </div>
              <div className="font-bold">${(it.qty * it.product.price).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="border rounded p-4">
          <div className="font-semibold">Payment</div>
          <div className="mt-2">Total: <span className="font-bold">${subtotal.toFixed(2)}</span></div>
          <div className="mt-3">
            <label className="block mb-2">Method</label>
            <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="w-full input">
              <option value="cash">Cash</option>
              <option value="momo">Mobile Money</option>
              <option value="card">Card</option>
              <option value="other">Mixed / Multiple</option>
            </select>
          </div>

          {paymentMethod !== 'other' ? (
            <div className="mt-3">
              <label className="block mb-2">Amount Received</label>
              <input type="number" min="0" step="0.01" value={amountPaid} onChange={e=>setAmountPaid(Number(e.target.value))} className={`w-full input ${amountPaid < subtotal ? 'input-invalid' : ''}`} />
              <div className="text-sm muted mt-1">Total: <strong>${subtotal.toFixed(2)}</strong> • Paid: <strong>${Number(amountPaid || 0).toFixed(2)}</strong> {change>0 && (<span> • Change due: <strong>${change.toFixed(2)}</strong></span>)}</div>
            </div>
          ) : (
            <div className="mt-3">
              <label className="block mb-2">Payment Breakdown (required to cover total)</label>
              <input type="number" placeholder="Cash" value={breakdown.cash} onChange={e=>setBreakdown({...breakdown, cash: Number(e.target.value)})} className={`w-full input mb-2 ${breakdown.cash + breakdown.momo + breakdown.card + breakdown.other < subtotal ? 'input-invalid' : ''}`} />
              <input type="number" placeholder="Momo" value={breakdown.momo} onChange={e=>setBreakdown({...breakdown, momo: Number(e.target.value)})} className="w-full input mb-2" />
              <input type="number" placeholder="Card" value={breakdown.card} onChange={e=>setBreakdown({...breakdown, card: Number(e.target.value)})} className="w-full input mb-2" />
              <input type="number" placeholder="Other" value={breakdown.other} onChange={e=>setBreakdown({...breakdown, other: Number(e.target.value)})} className="w-full input" />
              <div className="text-sm muted mt-1">Subtotal: <strong>${subtotal.toFixed(2)}</strong> • Breakdown total: <strong>${breakdownTotal.toFixed(2)}</strong> {breakdownTotal < subtotal && (<span className="text-red-500"> • Not enough</span>)} {breakdownTotal > subtotal && (<span> • Change: <strong>${(breakdownTotal - subtotal).toFixed(2)}</strong></span>)}</div>
            </div>
          )}

          {error && <div className="text-red-500 mt-2">{error}</div>}

          <div className="mt-4">
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded" onClick={handlePay} disabled={loading || !isPaymentValid()}>{loading? 'Processing...':'Place Order'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
