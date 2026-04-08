"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { format } from 'date-fns';
import { Calendar, UserCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: number;
  status: string;
  created_at: string;
  session_details: {
    id: number;
    title: string;
    date: string;
    duration_minutes: number;
  };
  user_details: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.get('/bookings/')
        .then(res => setBookings(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const isCreator = user.role === 'creator';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 glow-text">Portal</h1>
          <p className="text-gray-400 text-lg">Welcome back, {user.first_name || user.username}.</p>
        </div>
        <div className="glass-card py-3 px-6 rounded-full inline-flex items-center gap-3 border-blue-500/30">
          <UserCircle className="text-blue-400" />
          <span className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
            ROLE: <span className="text-white">{user.role}</span>
          </span>
        </div>
      </header>

      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar size={24} className="text-blue-500" />
            {isCreator ? 'Incoming Bookings for Your Sessions' : 'Your Booked Sessions'}
          </h2>
          {isCreator && (
            <Link 
              href="/dashboard/create"
              className="mt-4 md:mt-0 bg-white/10 hover:bg-blue-600 text-white px-5 py-2 rounded-full border border-white/10 hover:border-blue-500 transition-colors text-sm font-semibold inline-flex items-center gap-2"
            >
              + Create New Session
            </Link>
          )}
        </div>
        
        {bookings.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border-dashed border-2 border-gray-700">
            <p className="text-gray-500 text-lg mb-4">You have no records yet.</p>
            {!isCreator && (
              <Link href="/" className="text-blue-500 hover:text-blue-400 font-semibold underline">
                Browse catalog
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map(booking => (
              <div key={booking.id} className="glass-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5 hover:border-white/10 transition-colors">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {booking.session_details.title}
                  </h3>
                  <div className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-wider">
                    {isCreator 
                      ? `Booked by ${booking.user_details.first_name} ${booking.user_details.last_name} (${booking.user_details.email})` 
                      : `Session ID: #${booking.session_details.id}`}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-300">
                    <span className="flex items-center gap-2">
                       <Calendar size={16} className="text-blue-400" />
                       {format(new Date(booking.session_details.date), 'MMM d, yyyy • h:mm a')}
                    </span>
                    <span className="flex items-center gap-2">
                       <Clock size={16} className="text-purple-400" />
                       {booking.session_details.duration_minutes} min
                    </span>
                  </div>
                </div>
                
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border flex items-center gap-2
                    ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 
                      booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 
                      'bg-red-500/10 text-red-500 border-red-500/30'}`}
                  >
                    {booking.status === 'confirmed' && <CheckCircle2 size={14} />}
                    {booking.status === 'pending' && <Clock size={14} />}
                    {booking.status === 'failed' && <XCircle size={14} />}
                    {booking.status}
                  </div>
                  <div className="text-gray-500 text-xs mt-3 hidden md:block">
                    Booked on {format(new Date(booking.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
