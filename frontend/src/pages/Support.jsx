/**
 * Support.jsx
 * Small support stub that saves messages locally (placeholder for real ticketing).
 */
import React, { useState } from 'react'
import { useToast } from '../components/ToastProvider'

export default function Support(){
  const [msg, setMsg] = useState('')
  const toast = useToast()

  // Local-only support ticket stub

  const send = ()=>{
    if(!msg) return toast.add('Enter a message', 'error')
    // For now, just store in localStorage as a stub for support tickets
    const tickets = JSON.parse(localStorage.getItem('supportTickets')||'[]')
    tickets.push({ id: Date.now(), message: msg, date: new Date() })
    localStorage.setItem('supportTickets', JSON.stringify(tickets))
    setMsg('')
    toast.add('Support message saved locally. Integrate with backend to submit.', 'success')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Support</h1>
      <div className="max-w-xl">
        <textarea className="w-full input mb-3" rows={6} value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Describe your issue or question" />
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  )
}
