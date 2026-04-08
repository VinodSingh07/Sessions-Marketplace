"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface Session {
  id: number;
  title: string;
  description: string;
  price: string;
  date: string;
  duration_minutes: number;
  creator_name: string;
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sessions/')
      .then(res => setSessions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="text-center mb-16 relative">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 glow-text animate-in slide-in-from-bottom-8 duration-700">
          Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Spirit</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto animate-in slide-in-from-bottom-5 duration-700 delay-150 fill-mode-both">
          Book exclusive 1-on-1 spiritual sessions with top-tier creators. 
          Discover alignment, meditation, and inner peace today.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center text-gray-500 py-16 glass-card mx-auto max-w-lg">
          <p className="text-xl">No sessions are currently available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map((session, i) => (
            <div 
              key={session.id} 
              className="glass-card flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-500"
              style={{ animationDelay: `${150 * (i+1)}ms`, animationFillMode: 'both' }}
            >
              <div className="p-8">
                <div className="text-blue-400 text-sm font-semibold tracking-wider uppercase mb-2">
                  By {session.creator_name}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 line-clamp-1">{session.title}</h3>
                <p className="text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                  {session.description}
                </p>
                
                <div className="flex flex-col gap-3 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-500" size={16} />
                    <span>{format(new Date(session.date), 'MMMM d, yyyy • h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-blue-500" size={16} />
                    <span>{session.duration_minutes} Minutes</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 pt-0 mt-auto border-t border-white/5 flex items-center justify-between">
                <div className="text-2xl font-bold text-white">
                  ₹{Number(session.price).toLocaleString()}
                </div>
                <Link 
                  href={`/session/${session.id}`}
                  className="bg-white/10 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 text-sm font-semibold border border-white/10 hover:border-blue-500 group"
                >
                  View Details
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
