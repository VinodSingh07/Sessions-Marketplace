"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Session {
  id: number;
  title: string;
  description: string;
  price: string;
  date: string;
  duration_minutes: number;
  creator_name: string;
}

export default function SessionDetail() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { user } = useAuth();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Dynamically inject Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (id) {
      api.get(`/sessions/${id}/`)
        .then(res => setSession(res.data))
        .catch(err => console.error("Error fetching session:", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      alert("Please sign in to book a session.");
      return;
    }
    
    setProcessing(true);
    try {
      // 1. Create order on the backend
      const { data: orderData } = await api.post(`/payment/order/${id}/`);
      
      // 2. Open Razorpay Checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Ahoum Sessions",
        description: `Booking: ${session?.title}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment on backend
            await api.post('/payment/verify/', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            setSuccess(true);
          } catch (err) {
            console.error("Verification failed", err);
            alert("Payment verification failed. If your money was deducted, please contact support.");
          }
        },
        prefill: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
        },
        theme: {
          color: "#3b82f6"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
          alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong initiating the payment.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <div className="text-center py-20 text-xl text-gray-400">Session not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in zoom-in-95 duration-500">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={20} />
        Back to Catalog
      </Link>
      
      {success ? (
        <div className="glass-card p-12 text-center rounded-2xl border-green-500/30">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">Booking Confirmed!</h2>
          <p className="text-gray-400 text-lg mb-8">Your payment was successful and the session is now locked in.</p>
          <Link href="/dashboard" className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full transition-colors font-semibold">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl relative border border-white/10">
          {/* Header glowing background */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />
          
          <div className="p-10 md:p-14 relative z-10">
            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6 inline-block">
              1-ON-1 SESSION
            </span>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{session.title}</h1>
            <p className="text-xl text-gray-300 mb-8 border-b border-white/10 pb-8 uppercase tracking-widest text-sm font-medium">
              Hosted by <span className="text-white font-bold">{session.creator_name}</span>
            </p>
            
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed mb-12 text-lg">
              {session.description.split('\n').map((line, i) => (
                <p key={i} className="mb-4">{line}</p>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-black/30 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Date & Time</p>
                  <p className="font-semibold text-white">{format(new Date(session.date), 'MMMM d, yyyy')}</p>
                  <p className="text-gray-400 text-sm">{format(new Date(session.date), 'h:mm a')}</p>
                </div>
              </div>
              
              <div className="bg-black/30 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                <div className="bg-purple-500/20 p-3 rounded-full text-purple-400">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Duration</p>
                  <p className="font-semibold text-white">{session.duration_minutes} Minutes</p>
                  <p className="text-gray-400 text-sm">Deep immersive focus</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-blue-900/10 border border-blue-500/20 p-8 rounded-2xl">
              <div>
                <p className="text-gray-400 mb-1">Total Investment</p>
                <div className="text-4xl font-bold text-white flex items-center gap-2">
                  ₹{Number(session.price).toLocaleString()}
                </div>
              </div>
              
              <button 
                onClick={handleBooking}
                disabled={processing}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-3 font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/30"
              >
                <CreditCard size={20} />
                {processing ? 'Processing...' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
