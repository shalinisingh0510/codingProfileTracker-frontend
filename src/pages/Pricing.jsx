import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Pricing = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const currentTier = user?.subscriptionTier || 'free';

  const [duration, setDuration] = useState('1month'); // '1month', '3month', '6month', '12month'
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null); // { tier, name, price }
  const [razorpayOrder, setRazorpayOrder] = useState(null); // Razorpay order object from backend

  const plans = {
    free: {
      name: 'Free Tier',
      price: 0,
      badge: 'Starter',
      color: 'border-gray-800 hover:border-gray-700 text-gray-400',
      icon: '🌱',
      features: [
        'Track LeetCode & Codeforces profiles',
        'Basic statistics views',
        '1 AI Profile analysis / month',
        'Standard user discovery'
      ]
    },
    plus: {
      name: 'Plus Service',
      prices: {
        '1month': 199,
        '3month': 299,
        '6month': 499,
        '12month': 699
      },
      badge: 'Popular',
      color: 'border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 glow-emerald',
      icon: '⭐',
      features: [
        'Track all profiles (LeetCode, GfG, Codeforces, CodeChef, etc.)',
        'Advanced stats (Streak tracking, rank details)',
        '10 AI Profile analyses / month',
        'Plus Badge on your public dashboard',
        'Prioritized data sync speeds'
      ]
    },
    premium: {
      name: 'Premium Service',
      prices: {
        '1month': 299,
        '3month': 499,
        '6month': 699,
        '12month': 799
      },
      badge: 'Elite Choice',
      color: 'border-cyan-500/20 hover:border-cyan-500/50 text-cyan-400 glow-cyan',
      icon: '👑',
      features: [
        'Everything in Plus Tier',
        'Unlimited AI Profile analyses',
        'Glowing Elite Badge on public dashboard',
        'Detailed system design & career insights reports',
        'Real-time automated data refreshes',
        'Dedicated premium support'
      ]
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribeClick = async (tier, name, price) => {
    if (!token) {
      navigate('/login');
      return;
    }
    setSelectedPlan({ tier, name, price });
    setSuccessMsg('');
    setErrorMsg('');
    setRazorpayOrder(null);
    setLoading(true);

    try {
      // Step 1: Create order on backend
      const response = await axios.post(
        'http://localhost:5050/api/subscription/razorpay-order',
        {
          tier,
          plan: duration
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRazorpayOrder(response.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to initialize Razorpay transaction.');
      setSelectedPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRealRazorpayPayment = async () => {
    if (!razorpayOrder) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setErrorMsg('Failed to load Razorpay SDK. Check your internet connection.');
      setLoading(false);
      return;
    }

    const options = {
      key: razorpayOrder.key,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'CodeProfile Command Center',
      description: `Subscription to ${selectedPlan.name} (${duration})`,
      image: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=100&h=100&fit=crop',
      order_id: razorpayOrder.id,
      handler: async function (response) {
        setLoading(true);
        try {
          const verifyRes = await axios.post(
            'http://localhost:5050/api/subscription/razorpay-verify',
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              tier: selectedPlan.tier,
              plan: duration
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          const updatedUser = {
            ...user,
            subscriptionTier: verifyRes.data.subscription.tier,
            subscriptionPlan: verifyRes.data.subscription.plan,
            subscriptionStatus: verifyRes.data.subscription.status,
            subscriptionExpiresAt: verifyRes.data.subscription.expiresAt
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));

          setSuccessMsg(`Welcome aboard! Subscription to ${selectedPlan.name} is now active.`);
          setTimeout(() => {
            setSelectedPlan(null);
            navigate(updatedUser.username ? `/${updatedUser.username}/dashboard` : '/dashboard');
          }, 2500);
        } catch (err) {
          setErrorMsg(err.response?.data?.message || 'Payment verification failed.');
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || ''
      },
      theme: {
        color: selectedPlan.tier === 'premium' ? '#06b6d4' : '#10b981'
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSimulatedPaymentSuccess = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const mockResponse = {
        razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(2, 10),
        razorpay_order_id: razorpayOrder.id,
        razorpay_signature: 'mock_signature_dev_' + Math.random().toString(36).substring(2, 15)
      };

      const verifyRes = await axios.post(
        'http://localhost:5050/api/subscription/razorpay-verify',
        {
          ...mockResponse,
          tier: selectedPlan.tier,
          plan: duration
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const updatedUser = {
        ...user,
        subscriptionTier: verifyRes.data.subscription.tier,
        subscriptionPlan: verifyRes.data.subscription.plan,
        subscriptionStatus: verifyRes.data.subscription.status,
        subscriptionExpiresAt: verifyRes.data.subscription.expiresAt
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccessMsg(`[Dev Mode] Payment Simulated Successfully! subscription is active.`);
      setTimeout(() => {
        setSelectedPlan(null);
        navigate(updatedUser.username ? `/${updatedUser.username}/dashboard` : '/dashboard');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Simulated transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white py-20 px-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-4 py-1.5 rounded-full">
            Pricing Plans
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mt-6 mb-4">
            Unleash Your <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">Coding Potential</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Choose the tier that fits your growth. Unlock advanced metrics, GfG streaking, global ranking, and AI career coaching reports.
          </p>

          {/* Duration Tabs Selector */}
          <div className="flex justify-center mt-12">
            <div className="bg-gray-900/50 p-1.5 rounded-2xl border border-gray-800/80 flex gap-1">
              {[
                { id: '1month', label: '1 Month' },
                { id: '3month', label: '3 Months' },
                { id: '6month', label: '6 Months' },
                { id: '12month', label: '12 Months' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDuration(tab.id)}
                  className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
                    duration === tab.id
                      ? 'bg-cyan-500 text-[#020617] shadow-lg shadow-cyan-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* FREE TIER CARD */}
          <div className="bg-gray-900/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-800/80 flex flex-col hover:bg-gray-900/20 transition-all duration-300">
            <div className="mb-8">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{plans.free.badge}</span>
              <div className="flex items-center gap-2.5 mt-2">
                <span className="text-2xl">{plans.free.icon}</span>
                <h3 className="text-xl font-bold text-white">{plans.free.name}</h3>
              </div>
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-black text-white">₹0</span>
                <span className="text-gray-500 text-xs ml-1">/ month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plans.free.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-gray-400">
                  <span className="text-emerald-500 text-xs">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled={currentTier === 'free'}
              className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                currentTier === 'free'
                  ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed border border-gray-700/30'
                  : 'bg-gray-900 border border-gray-700 text-white hover:bg-gray-800'
              }`}
            >
              {currentTier === 'free' ? 'Your Current Plan' : 'Free Default'}
            </button>
          </div>

          {/* PLUS TIER CARD */}
          <div className="bg-emerald-950/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-emerald-500/10 flex flex-col hover:border-emerald-500/30 hover:bg-emerald-950/10 transition-all duration-300 relative shadow-2xl shadow-emerald-950/10 group">
            <div className="absolute top-5 right-5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-emerald-400">
              {plans.plus.badge}
            </div>
            <div className="mb-8">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Value Choice</span>
              <div className="flex items-center gap-2.5 mt-2">
                <span className="text-2xl">{plans.plus.icon}</span>
                <h3 className="text-xl font-bold text-white">{plans.plus.name}</h3>
              </div>
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-black text-white">₹{plans.plus.prices[duration]}</span>
                <span className="text-gray-400 text-xs ml-1">/ {duration === '1month' ? 'month' : duration.replace('month', ' months')}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plans.plus.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-gray-300">
                  <span className="text-emerald-400 text-xs">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribeClick('plus', plans.plus.name, plans.plus.prices[duration])}
              className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                currentTier === 'plus'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-emerald-500 text-[#020617] border-transparent hover:bg-emerald-400 shadow-lg shadow-emerald-500/10'
              }`}
            >
              {currentTier === 'plus' ? 'Active / Extend Plan' : 'Get Plus Now'}
            </button>
          </div>

          {/* PREMIUM TIER CARD */}
          <div className="bg-cyan-950/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-cyan-500/10 flex flex-col hover:border-cyan-500/30 hover:bg-cyan-950/10 transition-all duration-300 relative shadow-2xl shadow-cyan-950/10 group">
            <div className="absolute top-5 right-5 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-cyan-400">
              {plans.premium.badge}
            </div>
            <div className="mb-8">
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500">Maximum Power</span>
              <div className="flex items-center gap-2.5 mt-2">
                <span className="text-2xl">{plans.premium.icon}</span>
                <h3 className="text-xl font-bold text-white">{plans.premium.name}</h3>
              </div>
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-black text-white">₹{plans.premium.prices[duration]}</span>
                <span className="text-gray-400 text-xs ml-1">/ {duration === '1month' ? 'month' : duration.replace('month', ' months')}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plans.premium.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-gray-300">
                  <span className="text-cyan-400 text-xs">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribeClick('premium', plans.premium.name, plans.premium.prices[duration])}
              className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                currentTier === 'premium'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                  : 'bg-cyan-500 text-[#020617] border-transparent hover:bg-cyan-400 shadow-lg shadow-cyan-500/10'
              }`}
            >
              {currentTier === 'premium' ? 'Active / Extend Plan' : 'Go Premium'}
            </button>
          </div>
        </div>

        {/* PAYMENT RECOMMENDATION SECTION */}
        <div className="mt-24 p-8 rounded-[2.5rem] bg-gray-900/20 border border-gray-800/60 max-w-4xl mx-auto">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            💳 Integrated payment System: Razorpay Standard
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Your billing is now powered by **Razorpay Standard Checkout**. It fully automates UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallet payments seamlessly with full compliance.
          </p>
        </div>
      </div>

      {/* RAZORPAY CHECKOUT DIALOG MODAL */}
      {selectedPlan && razorpayOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 animate-in fade-in duration-300">
          <div className="bg-[#0b0f19] border border-gray-800 rounded-[2.5rem] p-8 max-w-md w-full relative shadow-2xl text-center">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white font-bold text-xl"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-4xl">{selectedPlan.tier === 'plus' ? '⭐' : '👑'}</span>
              <h3 className="text-xl font-black mt-3">Razorpay Checkout</h3>
              <p className="text-xs text-gray-400 mt-1">
                Subscribing to {selectedPlan.name} ({duration})
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800/80 rounded-2xl p-4 mb-6 text-left">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <span>Order ID:</span>
                <span className="font-bold text-white max-w-[150px] truncate">{razorpayOrder.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                <span>Duration:</span>
                <span className="font-bold text-white uppercase tracking-wider">{duration}</span>
              </div>
              <div className="border-t border-gray-800 pt-3 flex justify-between items-center text-sm">
                <span className="font-bold">Total Amount:</span>
                <span className="font-black text-cyan-400 text-base">₹{selectedPlan.price}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl mb-4 text-center">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl mb-4 text-center font-bold">
                {successMsg}
              </div>
            )}

            {/* Standard Trigger Button */}
            {!razorpayOrder.isMock ? (
              <button
                onClick={handleRealRazorpayPayment}
                disabled={loading}
                className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 text-[#020617] disabled:text-gray-500 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all"
              >
                {loading ? 'Launching Razorpay...' : 'Launch Razorpay Gateway 🚀'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] p-3 rounded-xl mb-2 text-left leading-relaxed">
                  ⚠️ <strong>Developer Mode:</strong> Key credentials are mock/missing in backend .env. Launching simulated Razorpay Sandbox.
                </div>
                <button
                  onClick={handleSimulatedPaymentSuccess}
                  disabled={loading}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 text-[#020617] disabled:text-gray-500 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-500/10"
                >
                  {loading ? 'Simulating...' : 'Simulate Success Razorpay Charge 🟢'}
                </button>
                <button
                  onClick={() => {
                    setErrorMsg('Simulated payment was cancelled or failed.');
                  }}
                  disabled={loading}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all"
                >
                  Simulate Cancel Payment 🔴
                </button>
              </div>
            )}

            <div className="text-center text-[9px] text-gray-500 uppercase tracking-widest mt-4">
              Secured by Razorpay Payments
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
