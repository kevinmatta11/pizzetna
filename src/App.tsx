
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { Toaster } from '@/components/ui/sonner'
import Menu from '@/pages/Menu'
import About from '@/pages/About'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import Admin from '@/pages/Admin'
import Dashboard from '@/pages/admin/Dashboard'
import Categories from '@/pages/admin/Categories'
import MenuItems from '@/pages/admin/MenuItems'
import Orders from '@/pages/admin/Orders'
import Analytics from '@/pages/admin/Analytics'
import Settings from '@/pages/admin/Settings'
import Auth from '@/pages/Auth'
import AuthCallback from '@/pages/AuthCallback'
import LoyaltyPoints from '@/pages/LoyaltyPoints'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/loyalty" element={<LoyaltyPoints />} />
            <Route path="/admin" element={<Admin />}>
              <Route index element={<Dashboard />} />
              <Route path="categories" element={<Categories />} />
              <Route path="menu-items" element={<MenuItems />} />
              <Route path="orders" element={<Orders />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
