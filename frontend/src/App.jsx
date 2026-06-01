import './App.css'
import Header from './components/Header'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className='app'>
      <Header />
      <Navbar />
      <Dashboard />
    </div>
  )
}

export default App
