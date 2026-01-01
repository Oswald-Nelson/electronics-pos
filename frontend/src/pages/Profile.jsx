/**
 * Profile.jsx
 * User profile page with change-password functionality.
 */
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loading from '../components/Loading'
import { useToast } from '../components/ToastProvider'

export default function Profile(){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const toast = useToast()

  // Fetch profile for logged-in user on mount

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{
    const id = localStorage.getItem('userId')
    const token = localStorage.getItem('token')
    if(!id){
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return
    }
    axios.get(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res=> setUser(res.data))
      .catch(()=> toast.add('Failed to load profile','error'))
      .finally(()=> {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false)
      })
  },[])

  const changePassword = ()=>{
    const token = localStorage.getItem('token')
    axios.post('/api/auth/change-password', { oldPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } })
      .then(()=> { toast.add('Password changed','success'); setOldPassword(''); setNewPassword('') })
      .catch(()=> toast.add('Failed to change password','error'))
  }

  if(loading) return <div className="p-6"><Loading size={8} /></div>
  if(!user) return <div className="p-6">No profile found</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="max-w-md border rounded p-4">
        <div className="mb-2"><strong>Name:</strong> {user.name}</div>
        <div className="mb-2"><strong>Email:</strong> {user.email}</div>
        <div className="mb-4"><strong>Role:</strong> {user.role}</div>

        <div className="mt-4">
          <h2 className="font-semibold mb-2">Change Password</h2>
          <input type="password" placeholder="Old password" className="w-full input mb-2" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} />
          <input type="password" placeholder="New password" className="w-full input mb-2" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={changePassword}>Change Password</button>
        </div>
      </div>
    </div>
  )
}
