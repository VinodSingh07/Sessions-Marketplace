"use client";

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        await login(credentialResponse.credential);
        onClose();
      } catch (error) {
        alert("Login failed via backend.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-card relative w-full max-w-md p-8 pt-10 border border-white/20 rounded-2xl flex flex-col items-center shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white rounded-full hover:bg-white/10 p-1 transition-colors"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-bold text-center text-white mb-2 glow-text">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-8">Sign in to book spiritual sessions or manage your creator portfolio.</p>
        
        <div className="w-full flex justify-center pb-4">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.log('Login Failed');
            }}
            useOneTap
            theme="filled_black"
            shape="pill"
          />
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/10 w-full text-center text-xs text-gray-500">
          By signing in, you agree to Ahoum's Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
