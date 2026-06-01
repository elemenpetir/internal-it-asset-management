import './App.css'
import Header from './components/Header'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className='min-h-screen bg-slate-100 p-8'>
      <Header />
      <Navbar />
      <Dashboard />
    </div>
  )
}

export default App
