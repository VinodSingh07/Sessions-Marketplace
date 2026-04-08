"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Save, X } from 'lucide-react';
import Link from 'next/link';

export default function CreateSession() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration_minutes: 60,
    date: ''
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'creator')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString()
      };
      await api.post('/sessions/', payload);
      alert('Session created successfully!');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Failed to create session. Check your inputs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-white glow-text">Create Session</h1>
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl flex flex-col gap-6 border border-white/10">
        <div>
          <label className="block text-sm font-semibold text-gray-300 uppercase tracking-widest mb-2">Title</label>
          <input 
            type="text" 
            required 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. 1-on-1 Spiritual Guidance"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 uppercase tracking-widest mb-2">Description</label>
          <textarea 
            required 
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Describe what the user will achieve..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 uppercase tracking-widest mb-2">Price (INR)</label>
            <input 
              type="number" 
              required 
              min={0}
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. 1500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 uppercase tracking-widest mb-2">Duration (Min)</label>
            <input 
              type="number" 
              required 
              min={15}
              value={formData.duration_minutes}
              onChange={(e) => setFormData({...formData, duration_minutes: Number(e.target.value)})}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 uppercase tracking-widest mb-2">Date & Time</label>
            <input 
              type="datetime-local" 
              required 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Save size={20} />
          {saving ? 'Publishing...' : 'Publish Session'}
        </button>
      </form>
    </div>
  );
}
