import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Leaf, Bug, BarChart3, Sprout, ArrowRight, Check,
  Shield, Zap, Globe, Sparkles, Camera, Heart, Eye
} from 'lucide-react';

import appleImg from '../assets/apple.png';
import cornImg from '../assets/corn.png';
import grapeImg from '../assets/grape.png';
import mangoImg from '../assets/mango.png';
import leafImg from '../assets/healthy_green_leaf.png';

/* ─── Floating Orbs background ──────────────────────────────────────────── */
const Orbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
    <div
      className="absolute rounded-full blur-3xl animate-pulse"
      style={{
        width: 600, height: 600,
        top: -200, left: '50%', transform: 'translateX(-300px)',
        background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
        animationDuration: '8s'
      }}
    />
    <div
      className="absolute rounded-full blur-3xl animate-pulse"
      style={{
        width: 500, height: 500,
        top: 100, right: -100,
        background: 'radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 70%)',
        animationDuration: '12s'
      }}
    />
  </div>
);

/* ─── Navbar ─────────────────────────────────────────────────────────────── */
const LandingNav = () => (
  <nav
    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-16 h-[70px]"
    style={{
      background: 'rgba(3, 10, 6, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(34, 197, 94, 0.12)',
    }}
  >
    {/* Logo */}
    <div className="flex items-center gap-2.5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20"
        style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}
      >
        <Sprout size={18} color="white" strokeWidth={2.5} />
      </div>
      <span className="font-extrabold text-[15px] tracking-tight" style={{ color: '#ffffff' }}>
        AgroGuardian <span style={{ color: '#22c55e' }}>AI</span>
      </span>
    </div>



    {/* CTA Buttons */}
    <div className="flex items-center gap-3">
      <Link to="/login">
        <button
          className="text-[13px] font-bold px-4 py-2.5 rounded-xl transition-all duration-300 hover:text-white border border-white/5 bg-white/[0.02] hover:bg-white/[0.06]"
          style={{ color: '#a2b4a5' }}
        >
          Sign In
        </button>
      </Link>
      <Link to="/signup">
        <button 
          className="text-[13px] font-extrabold px-4.5 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-green-500/10 hover:shadow-green-500/20 text-white"
          style={{ background: '#22c55e' }}
        >
          Get Started Free
        </button>
      </Link>
    </div>
  </nav>
);

const LandingPage = () => {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <div style={{ background: '#030a06', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <LandingNav />

      {/* ─── 1. DARK PREMIUM HERO SECTION (Image 4) ─── */}
      <section className="relative pt-[130px] pb-28 px-6 text-center overflow-hidden z-10">
        <Orbs />

        {/* Live Status Badge */}
        <motion.div
          {...fadeUp(0)}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 mx-auto border border-green-500/30 bg-green-500/10"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-green-400">
            AI-Powered Precision Agriculture · Live
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.08)}
          className="text-[44px] md:text-[68px] font-black leading-[1.05] mb-6 max-w-4xl mx-auto text-white"
          style={{ letterSpacing: '-0.04em' }}
        >
          Protect Your Crops with{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #4be277 50%, #a3e635 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AI-Powered Intelligence
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.16)}
          className="text-[15px] md:text-[18px] max-w-2xl mx-auto mb-11 leading-relaxed"
          style={{ color: '#7a9280' }}
        >
          Detect diseases, predict pest risks, and forecast yield with cutting-edge
          machine learning — built for the modern farmer.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.24)}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-5"
        >
          <Link to="/signup">
            <button
              className="text-[14px] font-extrabold px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-green-500/20 hover:shadow-green-500/30 text-white flex items-center gap-2 hover:scale-[1.02]"
              style={{ background: '#22c55e' }}
            >
              Get Started Free <ArrowRight size={16} />
            </button>
          </Link>
          <Link to="/login">
            <button
              className="text-[14px] font-bold px-8 py-4 rounded-2xl transition-all duration-300 text-[#a2b4a5] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white"
            >
              Sign In
            </button>
          </Link>
        </motion.div>

        <motion.p {...fadeUp(0.32)} className="text-[12px] font-medium" style={{ color: '#4d6353' }}>
          Free trial · No credit card required · Cancel anytime
        </motion.p>
      </section>

      {/* ─── 2. PREMIUM INTERACTIVE CROP DIAGNOSE CARD (Image 1) ─── */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#020704] text-white relative z-20 shadow-2xl rounded-t-[40px] border-t border-green-500/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-6 space-y-7">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-green-400 bg-green-500/10 px-3 py-1.5 rounded-md">
                Interactive Diagnosis Tool
              </span>
              <h2 className="text-[38px] md:text-[52px] font-black leading-[1.1] text-white" style={{ letterSpacing: '-0.03em' }}>
                Is Your Crop Sick? Find Out in 30 Seconds.
              </h2>
              <p className="text-[15px] md:text-[16px] leading-relaxed text-[#7a9280]">
                Upload a photo. Get expert diagnosis in Kannada, Hindi, or English.
                Free. Backed by advanced precision agriculture AI.
              </p>
              
              {/* Primary Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/dashboard/disease">
                  <button className="text-[14px] font-extrabold px-7 py-4 rounded-2xl text-white shadow-lg shadow-green-500/10 bg-green-600 hover:bg-green-500 transition-all duration-300">
                    Start Free Diagnosis
                  </button>
                </Link>
                <a href="#supported-crops">
                  <button className="text-[14px] font-bold px-7 py-4 rounded-2xl text-green-400 border border-green-500/15 bg-green-500/5 hover:bg-green-500/10 transition-all duration-300">
                    View Supported Crops
                  </button>
                </a>
              </div>

              {/* Stats Row underneath */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-y-4 gap-x-6">
                {[
                  { text: '97.6% Accuracy' },
                  { text: '4 Crops Supported' },
                  { text: '3 Languages' },
                  { text: '30 Sec Analysis' }
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-green-400" strokeWidth={3} />
                    </div>
                    <span className="text-[13px] font-bold text-[#c8d5ca]">{stat.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Leaf Card Column */}
            <div className="lg:col-span-6 flex justify-center relative">
              
              {/* Outer Glowing Background circle */}
              <div className="absolute inset-0 bg-green-500/10 rounded-full filter blur-3xl -z-10 scale-95" />

              <motion.div 
                whileHover={{ y: -5 }}
                className="relative rounded-3xl overflow-hidden p-3.5 border border-white/5 shadow-2xl bg-white/[0.02] backdrop-blur-md max-w-[420px] w-full"
              >
                {/* Leaf Image block */}
                <div className="rounded-2xl overflow-hidden aspect-[4/3] relative bg-white/[0.01] flex items-center justify-center border border-white/5">
                  <img 
                    src={leafImg} 
                    alt="Uploaded Crop Leaf Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlaid Diagnosis result card */}
                <div 
                  className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl border flex flex-col gap-2.5"
                  style={{
                    background: 'rgba(3, 10, 6, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(34, 197, 94, 0.2)',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-green-400">Diagnosis Result</span>
                      <span className="text-[15px] font-black text-white"></span>
                    </div>
                    <span className="text-[9.5px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20">
                      High Severity
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-gray-400">
                      <span>Confidence Score</span>
                      <span className="text-green-400">87%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-green-500/10 overflow-hidden relative">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '87%' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. HOW IT WORKS SECTION (Image 2) ─── */}
      <section className="py-24 px-6 bg-[#030a06] text-white border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-[34px] md:text-[45px] font-black text-white mb-3.5" style={{ letterSpacing: '-0.03em' }}>
            How It Works
          </h2>
          <p className="text-[15px] md:text-[16px] text-[#7a9280] max-w-lg mx-auto leading-relaxed">
            Three simple steps to healthier crops and better yields.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            {
              num: '1',
              title: 'Upload Photo',
              desc: 'Snap a clear picture of the affected leaf or fruit using your smartphone.',
              icon: Camera
            },
            {
              num: '2',
              title: 'AI Analysis',
              desc: 'Our advanced neural networks process the image instantly to identify diseases.',
              icon: Sparkles
            },
            {
              num: '3',
              title: 'Get Cures',
              desc: 'Receive an accurate diagnosis and actionable treatment steps in your local language.',
              icon: Sprout
            }
          ].map((step, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="rounded-3xl p-7 bg-white/[0.02] border border-white/5 shadow-2xl flex flex-col justify-between"
              style={{ minHeight: 220 }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <step.icon size={22} className="text-green-400" />
                </div>
                <span className="text-[32px] font-black text-green-500/10 leading-none">0{step.num}</span>
              </div>

              <div>
                <h3 className="text-[17px] font-bold text-white mb-2">{step.num}. {step.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#7a9280] font-medium">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 4. SUPPORTED CROPS SECTION (Image 3) ─── */}
      <section id="supported-crops" className="py-24 px-6 bg-[#020704] text-white border-t border-white/5 pb-32">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-[34px] md:text-[45px] font-black text-white mb-3.5" style={{ letterSpacing: '-0.03em' }}>
            Supported Crops
          </h2>
          <p className="text-[15px] md:text-[16px] text-[#7a9280] max-w-lg mx-auto leading-relaxed">
            Optimized models for high-value agricultural produce.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Apple', img: appleImg, path: '/dashboard/disease' },
            { name: 'Corn', img: cornImg, path: '/dashboard/disease' },
            { name: 'Grape', img: grapeImg, path: '/dashboard/disease' },
            { name: 'Mango', img: mangoImg, path: '/dashboard/disease' }
          ].map((crop, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.01 }}
              className="rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 shadow-2xl flex flex-col p-3 group transition-all duration-300"
            >
              {/* Crop Image */}
              <div className="rounded-2xl overflow-hidden aspect-square relative bg-white/[0.01] flex items-center justify-center border border-white/5">
                <img 
                  src={crop.img} 
                  alt={`${crop.name} crop`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Crop info */}
              <div className="p-3.5 pt-4 flex flex-col gap-1.5">
                <span className="text-[16px] font-extrabold text-white">{crop.name}</span>
                <Link to={crop.path} className="text-[11.5px] font-bold text-green-400 hover:text-green-300 flex items-center gap-1">
                  View Diseases <ArrowRight size={11} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 5. CTA CARD BLOCK (Image 5) ─── */}
      <section className="px-6 py-28 max-w-4xl mx-auto text-center relative z-20">
        <motion.div
          {...fadeUp()}
          className="rounded-[36px] p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(22,163,74,0.06) 100%)',
            border: '1px solid rgba(34,197,94,0.25)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34,197,94,0.08), transparent)',
            }}
          />
          
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/10"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <Sprout size={26} style={{ color: '#22c55e' }} />
          </div>

          <h2
            className="text-[34px] font-black mb-4 text-white"
            style={{ letterSpacing: '-0.03em' }}
          >
            Ready to grow smarter?
          </h2>
          <p className="text-[14px] md:text-[15px] mb-9 max-w-md mx-auto" style={{ color: '#7a9280', lineHeight: '1.6' }}>
            Join 50,000+ farmers already using AgroGuardian AI to protect their crops and maximize yield.
          </p>

          <Link to="/signup">
            <button className="text-[14px] font-extrabold px-9 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-green-500/20 hover:shadow-green-500/30 text-white hover:scale-[1.02] inline-flex items-center gap-2" style={{ background: '#22c55e' }}>
              Start Free Trial <ArrowRight size={16} />
            </button>
          </Link>

          <p className="text-[12px] mt-5" style={{ color: '#4d6353', fontWeight: 500 }}>
            No credit card · Cancel anytime · Free forever plan
          </p>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="px-6 py-10 text-center relative z-20"
        style={{ borderTop: '1px solid rgba(34, 197, 94, 0.12)', background: '#020704' }}
      >
        <p className="text-[12px] font-semibold" style={{ color: '#4d6353' }}>
          © 2026 AgroGuardian AI · Built with precision for modern agriculture
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
