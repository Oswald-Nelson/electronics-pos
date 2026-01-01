/**
 * PageNav.jsx
 * Simple header/navigation used across pages. Shows role-aware home navigation.
 */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PageNav(){
  const navigate = useNavigate()
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null
  const [cartCount, setCartCount] = useState(0)

  const updateCountFromStorage = ()=>{
    try{
      const cart = JSON.parse(localStorage.getItem('cart')||'[]')
      const count = (cart || []).reduce((s,i)=> s + (Number(i.qty)||0), 0)
      setCartCount(count)
    }catch(e){ setCartCount(0) }
  }

  useEffect(()=>{
    updateCountFromStorage()
    const onStorage = (e)=>{ if(e.key === 'cart') updateCountFromStorage() }
    const onCustom = ()=> updateCountFromStorage()
    window.addEventListener('storage', onStorage)
    window.addEventListener('cart:updated', onCustom)
    return ()=>{
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('cart:updated', onCustom)
    }
  },[])

  // Helper to navigate to the role-specific home route
  const goHome = () => {
    if(role === 'admin') navigate('/admin')
    else if(role === 'teller') navigate('/teller')
    else if(role === 'client') navigate('/client')
    else navigate('/')
  }

  // Global logout helper for header
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    // clear cart as well
    localStorage.removeItem('cart')
    // notify any listeners about cleared cart
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 0 } }))
    navigate('/')
  }

  return (
    <header className="bg-white border-b">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={()=>navigate(-1)} className="btn-secondary hidden sm:inline">← Back</button>
          <button onClick={goHome} className="btn-primary">Home</button>
          <div className="text-sm muted">Electronics POS</div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm muted hidden sm:inline">Logged as: {role || 'Guest'}</span>

          {/* Cart icon with badge */}
          <button onClick={()=>navigate('/cart')} className="relative p-2 rounded hover:bg-gray-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 6.4A2 2 0 007.8 21h8.4a2 2 0 001.9-1.6L19 13M7 13L5 6" />
            </svg>
            {cartCount > 0 && (
              <span className={`cart-badge ${cartCount>0 ? 'pulse' : ''}`}>{cartCount}</span>
            )}
          </button>

          {/* Logout button visible to all users */}
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </div>
    </header>
  )
}
