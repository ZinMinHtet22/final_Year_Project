import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import FavoritesPage from './pages/FavoritesPage'
import ShoppingListPage from './pages/ShoppingListPage'
import ChefBotPage from './pages/ChefBotPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import FeedbackForm from './components/FeedbackForm'
import RecipeDetailsPage from './pages/RecipeDetailsPage'
import ProfilePage from './pages/ProfilePage'
import BudgetPlannerPage from './pages/BudgetPlannerPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PantryManager from './pages/PantryManager'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import SystemStatsPage from './pages/SystemStatsPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { ThemeProvider } from './context/ThemeContext'
import { MessageSquare } from 'lucide-react'
import ChefBotWidget from './components/ChefBotWidget'
import './index.css'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading-spinner">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/shopping-list" element={<ShoppingListPage />} />
      <Route path="/chef-bot" element={<ChefBotPage />} />
      <Route path="/recipe/:id" element={<RecipeDetailsPage />} />
      <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
      <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
      <Route path="/budget" element={<BudgetPlannerPage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/admin" element={user && user.is_admin ? <AdminDashboardPage /> : <Navigate to="/" />} />
      <Route path="/pantry" element={user ? <PantryManager /> : <Navigate to="/login" />} />
      <Route path="/analytics" element={user ? <AnalyticsDashboard /> : <Navigate to="/login" />} />
      <Route path="/admin/system-stats" element={user && user.is_admin ? <SystemStatsPage /> : <Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <AppRoutes />
              </main>

              {/* Floating Chef Bot Assistant */}
              <ChefBotWidget />

              {/* Floating Feedback Trigger */}
              <button 
                className="btn-feedback-floating" 
                onClick={() => setShowFeedback(true)}
                title="Share Feedback"
              >
                <MessageSquare size={20} />
              </button>

              {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}
            </div>
          </BrowserRouter>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  )
}

export default App
