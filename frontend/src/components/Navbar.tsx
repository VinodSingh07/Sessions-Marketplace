"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserCircle, LogOut } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <nav className="glass-panel sticky top-0 z-50 px-8 py-4 flex justify-between items-center bg-opacity-60 border-b border-white/10">
      <Link href="/" className="text-2xl font-bold text-white glow-text tracking-widest uppercase">
        Ahoum<span className="text-blue-500">.</span>
      </Link>
      
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Catalog</Link>
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 bg-white/5 py-2 px-4 rounded-full border border-white/10 hover:bg-white/10">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <UserCircle size={20} />
              )}
              <span className="hidden sm:inline font-medium">{user.first_name || 'Dashboard'}</span>
            </Link>
            <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setAuthModalOpen(true)}
            className="bg-blue-600/90 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] border border-blue-400/20"
          >
            <LogIn size={18} />
            Sign In
          </button>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </nav>
  );
}
