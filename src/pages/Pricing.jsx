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

  const handleSubscribeClick = (tier, name, price) => {
    if (!token) {
      navigate('/login');
      return;
    }
    setSelectedPlan({ tier, name, price });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleCheckout = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const response = await axios.post(
        'http://localhost:5050/api/subscription/checkout',
        {
          tier: selectedPlan.tier,
          plan: duration
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update user localStorage with new tier
      const updatedUser = {
        ...user,
        subscriptionTier: response.data.subscription.tier,
        subscriptionPlan: response.data.subscription.plan,
        subscriptionStatus: response.data.subscription.status,
        subscriptionExpiresAt: response.data.subscription.expiresAt
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccessMsg(`Welcome aboard! Subscription to ${selectedPlan.name} is active.`);
      setTimeout(() => {
        setSelectedPlan(null);
        navigate(updatedUser.username ? `/${updatedUser.username}/dashboard` : '/dashboard');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Transaction failed. Please try again.');
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
            💳 Recommended Payment Integration Strategies
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            Since your pricing tier plans are billed in Rupees (₹), here are the most suitable global and domestic transaction methods:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl">
              <span className="font-bold text-xs text-cyan-400 block mb-1">Razorpay Checkout</span>
              <p className="text-[11px] text-gray-400 leading-normal">
                **Best for India.** Supports UPI (Google Pay, PhonePe, Paytm), local Net Banking, and Cards. Razorpay Subscriptions automate monthly/yearly recurring charges cleanly and handles the RBI regulations perfectly.
              </p>
            </div>
            <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl">
              <span className="font-bold text-xs text-cyan-400 block mb-1">Stripe Billing</span>
              <p className="text-[11px] text-gray-400 leading-normal">
                **Best for Global.** Stripe Checkout handles billing customer portals, automated subscription invoices, discount coupons, and multi-currency out-of-the-box. Extremely secure and developer-friendly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT PAYMENT DIALOG MODAL */}
      {selectedPlan && (() => {
        // Local checkout sub-state
        const [method, setMethod] = useState('mock'); // 'mock', 'upi'
        const [utr, setUtr] = useState('');

        const handleUpiSubmit = async (e) => {
          e.preventDefault();
          if (!utr || utr.length < 12) {
            setErrorMsg('Please enter a valid 12-digit UPI UTR number.');
            return;
          }
          setLoading(true);
          setErrorMsg('');
          setSuccessMsg('');
          try {
            // Simulated real verification
            const response = await axios.post(
              'http://localhost:5050/api/subscription/checkout',
              {
                tier: selectedPlan.tier,
                plan: duration,
                utr: utr
              },
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );

            const updatedUser = {
              ...user,
              subscriptionTier: response.data.subscription.tier,
              subscriptionPlan: response.data.subscription.plan,
              subscriptionStatus: response.data.subscription.status,
              subscriptionExpiresAt: response.data.subscription.expiresAt
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setSuccessMsg(`UTR Submitted! Your ${selectedPlan.name} is now active.`);
            setTimeout(() => {
              setSelectedPlan(null);
              navigate(updatedUser.username ? `/${updatedUser.username}/dashboard` : '/dashboard');
            }, 2500);
          } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Verification failed. Please try again.');
          } finally {
            setLoading(false);
          }
        };

        const upiId = 'shalucodethrust@okaxis';
        const upiPayload = `upi://pay?pa=${upiId}&pn=Shalini&am=${selectedPlan.price}&cu=INR&tn=CodeProfile-${selectedPlan.tier}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayload)}`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 animate-in fade-in duration-300">
            <div className="bg-[#0b0f19] border border-gray-800 rounded-[2.5rem] p-8 max-w-md w-full relative shadow-2xl overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setSelectedPlan(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <span className="text-4xl">{selectedPlan.tier === 'plus' ? '⭐' : '👑'}</span>
                <h3 className="text-xl font-black mt-3">Confirm Checkout</h3>
                <p className="text-xs text-gray-400 mt-1">
                  You are subscribing to {selectedPlan.name}
                </p>
              </div>

              {/* Method Switcher Tabs */}
              <div className="flex bg-gray-900/60 p-1 rounded-xl border border-gray-800 mb-6">
                <button
                  onClick={() => setMethod('mock')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    method === 'mock' ? 'bg-cyan-500 text-[#020617]' : 'text-gray-400'
                  }`}
                >
                  Mock Checkout
                </button>
                <button
                  onClick={() => setMethod('upi')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    method === 'upi' ? 'bg-emerald-500 text-[#020617]' : 'text-gray-400'
                  }`}
                >
                  Direct UPI QR (0% Fee)
                </button>
              </div>

              <div className="bg-gray-900/50 border border-gray-800/80 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                  <span>Selected Plan:</span>
                  <span className="font-bold text-white uppercase tracking-wider">{duration}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                  <span>Price:</span>
                  <span className="font-bold text-white">₹{selectedPlan.price}</span>
                </div>
                <div className="border-t border-gray-800 pt-3 flex justify-between items-center text-sm">
                  <span className="font-bold">Total Amount:</span>
                  <span className={`font-black text-base ${method === 'upi' ? 'text-emerald-400' : 'text-cyan-400'}`}>₹{selectedPlan.price}</span>
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

              {method === 'mock' ? (
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 text-[#020617] disabled:text-gray-500 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all"
                  >
                    {loading ? 'Processing...' : 'Pay via Mock Checkout'}
                  </button>
                  <div className="text-center text-[9px] text-gray-500 uppercase tracking-widest mt-4">
                    UPI • Credit Card • Netbanking Simulated
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpiSubmit} className="space-y-6 text-center">
                  <div className="flex flex-col items-center bg-white p-4 rounded-3xl border border-gray-200 shadow-inner w-48 h-48 mx-auto">
                    <img src={qrUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed px-4">
                    Scan with Google Pay, PhonePe, or Paytm and pay <strong className="text-emerald-400">₹{selectedPlan.price}</strong> directly to VPA <strong className="text-white">{upiId}</strong>. No middleman, 100% free bank-to-bank transfer!
                  </p>
                  
                  <div className="text-left space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-gray-500 block">
                      12-Digit Transaction UTR Ref No:
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={utr}
                      onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 308945671234"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm font-semibold text-white placeholder-gray-600 focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 text-[#020617] disabled:text-gray-500 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all"
                  >
                    {loading ? 'Submitting...' : 'Submit UTR & Activate'}
                  </button>
                </form>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Pricing;
