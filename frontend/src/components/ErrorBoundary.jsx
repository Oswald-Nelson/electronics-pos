/**
 * ErrorBoundary.jsx
 * React error boundary to capture rendering errors and display a simple fallback UI.
 */
import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { error: null, errorInfo: null }
  }
  componentDidCatch(error, errorInfo){
    this.setState({ error, errorInfo })
    // Optionally log to backend here
    console.error('Captured error:', error, errorInfo)
  }

  render(){
    if(this.state.error){
      return (
        <div style={{padding:20}}>
          <h2 style={{color:'#b91c1c'}}>Application Error</h2>
          <div style={{whiteSpace:'pre-wrap',background:'#111827',color:'#fff',padding:12,borderRadius:6,marginTop:10}}>
            {this.state.error && this.state.error.toString()}
            {this.state.errorInfo && '\n' + (this.state.errorInfo.componentStack || '')}
          </div>
          <div style={{marginTop:12}}>
            <button onClick={()=>{ this.setState({ error:null, errorInfo:null }); window.location.reload() }} style={{padding:'8px 12px',background:'#2563eb',color:'#fff',border:'none',borderRadius:6}}>Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
