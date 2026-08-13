import HeaderPage from './components/HeaderPage'
import FooterPage from './components/FooterPage'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <HeaderPage />
      <main className="flex-1"></main>
      <FooterPage />
    </div>
  )
}

export default App
