/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Zap, 
  Trash2, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  LayoutDashboard, 
  Lightbulb, 
  TrendingDown, 
  AlertCircle,
  CheckCircle2,
  Trophy,
  History,
  Wind,
  Refrigerator,
  Microwave,
  Tv,
  Smartphone,
  Briefcase,
  WashingMachine,
  Fan,
  ShieldCheck,
  MapPin,
  Database,
  FileJson,
  FileText,
  Cloud,
  Globe,
  MessageSquare,
  Bot,
  Send,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// --- Constants & Data ---

const POWER_SOURCES = [
  { id: 'band-a', name: 'Grid Band A (20-24 hrs)', rate: 209.50, description: 'Premium Grid Supply' },
  { id: 'band-b', name: 'Grid Band B (16-20 hrs)', rate: 63.00, description: 'Standard Grid Supply' },
  { id: 'band-c', name: 'Grid Band C (12-16 hrs)', rate: 50.00, description: 'Moderate Grid Supply' },
  { id: 'band-d', name: 'Grid Band D (8-12 hrs)', rate: 42.00, description: 'Occasional Grid Supply' },
  { id: 'band-e', name: 'Grid Band E (4-8 hrs)', rate: 35.00, description: 'Low Grid Supply' },
  { id: 'petrol', name: 'Petrol Gen (I-pass-my-neighbor)', rate: 580.00, description: '₦1,250/L Approx.' },
  { id: 'diesel', name: 'Diesel Gen (Industrial/Mikano)', rate: 720.00, description: '₦2,020/L Approx.' },
  { id: 'solar', name: 'Solar / Inverter System', rate: 0.00, description: 'The Ultimate Goal' },
];

const APPLIANCE_DATABASE = [
  // Cooling & Comfort
  { id: 'ac-1.5hp-split', name: '1.5HP Split AC', watts: 1500, category: 'Cooling', icon: Wind },
  { id: 'ac-1.5hp-inverter', name: '1.5HP Inverter AC', watts: 700, category: 'Cooling', icon: Wind },
  { id: 'ac-2hp-split', name: '2HP Split AC', watts: 2000, category: 'Cooling', icon: Wind },
  { id: 'ac-window', name: 'Window Unit ("Iron AC")', watts: 1800, category: 'Cooling', icon: Wind },
  { id: 'fan-standing', name: 'Standing Fan', watts: 80, category: 'Cooling', icon: Fan },
  { id: 'fan-ceiling', name: 'Ceiling Fan', watts: 100, category: 'Cooling', icon: Fan },
  { id: 'fan-rechargeable', name: 'Rechargeable Fan', watts: 30, category: 'Cooling', icon: Fan },
  { id: 'air-cooler', name: 'Air Cooler', watts: 150, category: 'Cooling', icon: Wind },

  // Kitchen & Refrigeration
  { id: 'freezer-chest', name: 'Chest Freezer ("Deep Freezer")', watts: 350, category: 'Kitchen', icon: Refrigerator },
  { id: 'fridge-double', name: 'Double Door Fridge', watts: 500, category: 'Kitchen', icon: Refrigerator },
  { id: 'fridge-bedside', name: 'Bedside Fridge', watts: 90, category: 'Kitchen', icon: Refrigerator },
  { id: 'fridge-inverter', name: 'Inverter Fridge', watts: 150, category: 'Kitchen', icon: Refrigerator },
  { id: 'kettle', name: 'Electric Kettle ("Boiler")', watts: 2000, category: 'Kitchen', icon: Microwave },
  { id: 'microwave', name: 'Microwave', watts: 1200, category: 'Kitchen', icon: Microwave },
  { id: 'air-fryer', name: 'Air Fryer', watts: 1500, category: 'Kitchen', icon: Microwave },
  { id: 'blender', name: 'Blender/Grinder', watts: 400, category: 'Kitchen', icon: Microwave },
  { id: 'hotplate-single', name: 'Single Coil Hot Plate', watts: 1500, category: 'Kitchen', icon: Microwave },
  { id: 'hotplate-double', name: 'Double Coil Hot Plate', watts: 2500, category: 'Kitchen', icon: Microwave },
  { id: 'toaster', name: 'Toaster', watts: 800, category: 'Kitchen', icon: Microwave },

  // Business & SME Tools
  { id: 'barber-clippers', name: 'Barber Clippers', watts: 20, category: 'Business', icon: Briefcase },
  { id: 'sterilizer', name: 'Sterilizer Box', watts: 60, category: 'Business', icon: Briefcase },
  { id: 'hair-dryer', name: 'Handheld Hair Dryer', watts: 1800, category: 'Business', icon: Briefcase },
  { id: 'hood-dryer', name: 'Sitting Hood Dryer', watts: 1200, category: 'Business', icon: Briefcase },
  { id: 'iron-electric', name: 'Electric Iron (Tailoring)', watts: 1200, category: 'Business', icon: Briefcase },
  { id: 'pump-0.5hp', name: 'Pumping Machine (0.5HP)', watts: 375, category: 'Business', icon: Briefcase },
  { id: 'pump-1hp', name: 'Pumping Machine (1HP)', watts: 750, category: 'Business', icon: Briefcase },
  { id: 'photocopy', name: 'Photocopy Machine', watts: 600, category: 'Business', icon: Briefcase },
  { id: 'printer-laser', name: 'Laser Printer', watts: 500, category: 'Business', icon: Briefcase },
  { id: 'desktop-pc', name: 'Desktop PC + Monitor', watts: 300, category: 'Business', icon: Briefcase },

  // Laundry
  { id: 'wash-semi', name: 'Washing Machine (Semi-Auto)', watts: 400, category: 'Laundry', icon: WashingMachine },
  { id: 'wash-full', name: 'Washing Machine (Fully-Auto)', watts: 2000, category: 'Laundry', icon: WashingMachine },
  { id: 'dryer-clothes', name: 'Electric Clothes Dryer', watts: 3000, category: 'Laundry', icon: WashingMachine },
  { id: 'vacuum', name: 'Vacuum Cleaner', watts: 1200, category: 'Laundry', icon: WashingMachine },

  // Entertainment
  { id: 'tv-32', name: '32" LED TV', watts: 50, category: 'Entertainment', icon: Tv },
  { id: 'tv-55', name: '55" Smart TV', watts: 120, category: 'Entertainment', icon: Tv },
  { id: 'sound-system', name: 'Home Theater', watts: 200, category: 'Entertainment', icon: Tv },
  { id: 'decoder', name: 'Decoder (DSTV/GOTV)', watts: 20, category: 'Entertainment', icon: Tv },
  { id: 'laptop-charger', name: 'Laptop Charger', watts: 65, category: 'Entertainment', icon: Smartphone },
  { id: 'phone-charger', name: 'Phone Fast Charger', watts: 25, category: 'Entertainment', icon: Smartphone },
  { id: 'gaming-console', name: 'Gaming Console (PS5/Xbox)', watts: 200, category: 'Entertainment', icon: Tv },

  // Lighting
  { id: 'light-yellow', name: 'Yellow Bulb (Incandescent)', watts: 100, category: 'Lighting', icon: Lightbulb },
  { id: 'light-cfl', name: 'Energy Saver (CFL)', watts: 25, category: 'Lighting', icon: Lightbulb },
  { id: 'light-led', name: 'White Bulb (LED)', watts: 10, category: 'Lighting', icon: Lightbulb },
  { id: 'flood-halogen', name: 'Security Floodlight (Halogen)', watts: 500, category: 'Lighting', icon: Lightbulb },
  { id: 'flood-led', name: 'Security Floodlight (LED)', watts: 50, category: 'Lighting', icon: Lightbulb },
];

const UPGRADES = [
  { 
    name: 'LED Lighting Overhaul', 
    target: 'Lighting', 
    cost: 15000, 
    savingsMultiplier: 0.1, 
    description: 'Replace all old yellow bulbs and halogens with high-efficiency LEDs.' 
  },
  { 
    name: 'Inverter AC Conversion', 
    target: 'Cooling', 
    cost: 350000, 
    savingsMultiplier: 0.46, // 1500W -> 700W is approx 53% savings
    description: 'Swap your current power-hungry AC units for modern inverter technology.' 
  },
  { 
    name: 'Smart SME Solar Kit (5kVA)', 
    target: 'Business', 
    cost: 2500000, 
    savingsMultiplier: 0.8, 
    description: 'Shift your primary business load to solar. 80% reduction in daytime energy costs.' 
  }
];

// --- Components ---

const Header = ({ selectedSource, isProMode, setIsProMode, auditType }: { selectedSource: any, isProMode: boolean, setIsProMode: (v: boolean) => void, auditType: string }) => (
  <header className="fixed top-0 left-0 w-full z-50 bg-nigerian-green text-white border-b-4 border-nigerian-gold px-8 py-4 flex justify-between items-center h-20">
    <div className="flex items-center gap-3">
      <div className="bg-white p-2 rounded-lg text-nigerian-green font-bold text-xl flex items-center justify-center w-10 h-10 shadow-sm">₦</div>
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-baseline gap-2 leading-none">
          NairaPower 
        </h1>
        <span className="text-[10px] text-nigerian-gold font-black uppercase tracking-widest opacity-80">
          {auditType === 'residential' ? 'Residential Home Audit' : 'Commercial / SME Audit'}
        </span>
      </div>
    </div>
    <div className="hidden md:flex gap-8 items-center">
      <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl ring-1 ring-white/20">
        <label className="text-[10px] font-black uppercase tracking-widest cursor-pointer select-none">Pro / Industry Insights</label>
        <button 
          onClick={() => setIsProMode(!isProMode)}
          className={`w-10 h-5 rounded-full relative transition-colors ${isProMode ? 'bg-nigerian-gold' : 'bg-white/20'}`}
        >
          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isProMode ? 'left-6' : 'left-1'}`} />
        </button>
      </div>
      <div className="text-right">
        <p className="text-[10px] opacity-80 uppercase font-black tracking-widest leading-none mb-1">Current Power Source</p>
        <p className="font-bold text-nigerian-gold text-sm">{selectedSource.name}</p>
      </div>
    </div>
  </header>
);

const App = () => {
  const [step, setStep] = useState(0);
  const [auditType, setAuditType] = useState<'residential' | 'commercial'>('residential');
  const [isProMode, setIsProMode] = useState(false);
  const [auditorInfo, setAuditorInfo] = useState({ name: '', business: '', lga: '' });
  const [selectedSource, setSelectedSource] = useState(POWER_SOURCES[0]);
  const [selectedAppliances, setSelectedAppliances] = useState<{id: string, qty: number, hours: number}[]>([]);
  const [showNudge, setShowNudge] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([
    { role: 'ai', content: "Sabi Energy Advisor here! 🇳🇬 I can help you slash your bills. Ask me anything about your audit data or energy transition!" }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Simulated Nudge
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => setShowNudge(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // AI Advisor Logic
  const generateAIResponse = async (userQuery: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const topApplianceInfo = (() => {
        if (selectedAppliances.length === 0) return null;
        const sorted = [...selectedAppliances].sort((a, b) => {
          const appA = APPLIANCE_DATABASE.find(x => x.id === a.id);
          const appB = APPLIANCE_DATABASE.find(x => x.id === b.id);
          return ((appB?.watts || 0) * b.qty * b.hours) - ((appA?.watts || 0) * a.qty * a.hours);
        });
        const item = sorted[0];
        const app = APPLIANCE_DATABASE.find(x => x.id === item.id);
        const saving2hr = app ? (app.watts * item.qty * 2 / 1000) * selectedSource.rate * 30 : 0;
        return { name: app?.name, watts: app?.watts, currentHours: item.hours, saving2hr };
      })();

      const auditSummary = `
        User Audit Context (NairaPower Data):
        - Audit Type: ${auditType}
        - Current Power Source: ${selectedSource.name} (Rate: ₦${selectedSource.rate}/kWh)
        - Monthly Spend: ₦${totals.monthlySpend.toLocaleString()}
        - Monthly Waste (Efficiency Bleed): ₦${totals.monthlyWaste.toLocaleString()}
        - Sabi Efficiency Score: ${totals.sabiScore}/100
        - Top Consumption Appliance: ${topApplianceInfo?.name || 'Unknown'} (Currently ${topApplianceInfo?.currentHours} hrs/day)
        - Potential Savings (if used 2 hrs less): ₦${topApplianceInfo?.saving2hr.toLocaleString()}/month
        - Source Category: ${selectedSource.id} ( petrol/diesel = Gen, grid = Grid)
        - Top Roadmap Actions: ${roadmapItems.map(i => i.name).join(', ')}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `${auditSummary}\n\nUser Question: ${userQuery}` }] }
        ],
        config: {
          systemInstruction: `You are 'Sabi AI', a helpful Nigerian Energy Advisor.
          
          CORE RULES:
          1. DATA-FIRST: Always use the provided audit values (₦ spend, waste, top appliance) in your bubbles.
          2. TONALITY: Relatable, helpful, sharp Nigerian professional. Use 'Sabi', 'NairaPower', 'Bleeding Naira'.
          3. CONTEXTUAL LOGIC:
             - If asked about 'Savings': Mention the specific 'Action Plan' for the ${topApplianceInfo?.name || 'top appliance'}. Say: 'If you cut your ${topApplianceInfo?.name} by 2 hours, you save ₦${topApplianceInfo?.saving2hr.toLocaleString()} every month!'
             - If asked about 'CNG/Gas': If they use Petrol/Diesel (currently ${selectedSource.id}), highlight the massive ROI of switching from ₦${selectedSource.id === 'petrol' ? '1,250' : '2,020'}/L fuel to Gas.
             - If asked about 'Grid': Explain that their ₦${totals.monthlyWaste.toLocaleString()} monthly waste isn't just taking money, it's stressing their local transformer (waste amps).
          4. PERSONAL TOUCH: Acknowledge their specific shop/home spend. "Based on your audit, your ${auditType === 'commercial' ? 'business' : 'home'} is currently wasting ₦${totals.monthlyWaste.toLocaleString()}..."
          5. Keep responses concise and ACTIONABLE.`
        }
      });

      return response.text || "My brain don jam small. Please try again.";
    } catch (error) {
      console.error("AI Error:", error);
      return "I lost my connection to the grid. Abeg try again later.";
    }
  };

  const handleSendMessage = async (preloaded?: string) => {
    const input = preloaded || chatInput;
    if (!input.trim() || isStreaming) return;

    // Add user message immediately
    const userMessage = { role: 'user' as const, content: input };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsStreaming(true);

    // Forced "thinking" delay to satisfy user requirement (1.5s indicator)
    const thinkingPromise = new Promise(resolve => setTimeout(resolve, 1500));
    const [aiContent] = await Promise.all([
      generateAIResponse(input),
      thinkingPromise
    ]);

    setChatMessages(prev => [...prev, { role: 'ai', content: aiContent }]);
    setIsStreaming(false);
  };

  // Auto-scroll chat
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isStreaming]);

  const toggleAppliance = (id: string) => {
    setSelectedAppliances(prev => {
      const exists = prev.find(a => a.id === id);
      if (exists) {
        return prev.filter(a => a.id !== id);
      }
      return [...prev, { id, qty: 1, hours: 4 }];
    });
  };

  const updateAppliance = (id: string, field: 'qty' | 'hours', value: number) => {
    setSelectedAppliances(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const totals = useMemo(() => {
    const dailyKWh = selectedAppliances.reduce((acc, curr) => {
      const app = APPLIANCE_DATABASE.find(a => a.id === curr.id);
      if (!app) return acc;
      return acc + ((app.watts * curr.qty * curr.hours) / 1000);
    }, 0);

    const monthlyKWh = dailyKWh * 30;
    const monthlySpend = monthlyKWh * selectedSource.rate;
    
    // Waste logic: simple multiplier for "vampire" or inefficient sources
    const wasteFactor = selectedSource.id.includes('gen') ? 0.3 : 0.15;
    const monthlyWaste = monthlySpend * wasteFactor;
    const potentialMonthlySavings = monthlySpend - (monthlyKWh * 0); // Comparison to solar

    // Sabi Score: Inverse of waste vs total
    const sabiScore = Math.max(0, Math.min(100, Math.round(100 - (wasteFactor * 100) - (dailyKWh / 10))));

    // Industry Intelligence: Grid Relief (Amps)
    const gridReliefAmps = (monthlyWaste / selectedSource.rate / 30) / 0.23;

    return { dailyKWh, monthlyKWh, monthlySpend, monthlyWaste, potentialMonthlySavings, sabiScore, gridReliefAmps };
  }, [selectedAppliances, selectedSource]);

  const roadmapItems = useMemo(() => {
    const items: any[] = [];
    const yellowBulbs = selectedAppliances.find(a => a.id === 'light-yellow');
    if (yellowBulbs) {
      const monthlySavings = (90 * yellowBulbs.qty * yellowBulbs.hours * 30 / 1000) * selectedSource.rate;
      const cost = 15000;
      const paybackDays = monthlySavings > 0 ? Math.round(cost / (monthlySavings / 30)) : 0;
      items.push({ id: 'led-upgrade', name: 'LED Lighting Overhaul', description: 'Swap your old yellow bulbs for high-efficiency LEDs.', cost, monthlySavings, paybackDays, icon: Lightbulb });
    }
    const inefficientACs = selectedAppliances.filter(a => ['ac-1.5hp-split', 'ac-2hp-split', 'ac-window'].includes(a.id));
    if (inefficientACs.length > 0) {
      const totalMonthlySavings = inefficientACs.reduce((acc, curr) => {
        const app = APPLIANCE_DATABASE.find(a => a.id === curr.id);
        if (!app) return acc;
        return acc + (0.5 * app.watts * curr.qty * curr.hours * 30 / 1000) * selectedSource.rate;
      }, 0);
      const cost = 450000;
      const paybackDays = totalMonthlySavings > 0 ? Math.round(cost / (totalMonthlySavings / 30)) : 0;
      items.push({ id: 'inverter-ac', name: 'Inverter AC Conversion', description: 'Your current ACs are "Iron ACs". Moving to Inverter technology cuts cooling costs by 50%.', cost, monthlySavings: totalMonthlySavings, paybackDays, icon: Wind });
    }
    const vampireLoads = selectedAppliances.filter(a => ['decoder', 'sound-system'].includes(a.id));
    if (vampireLoads.length > 0) {
      const monthlySavings = vampireLoads.reduce((acc, curr) => acc + (15 * curr.qty * 18 * 30 / 1000) * selectedSource.rate, 0);
      const cost = 10000;
      const paybackDays = monthlySavings > 0 ? Math.round(cost / (monthlySavings / 30)) : 0;
      items.push({ id: 'smart-plug', name: 'Smart Plug Automation', description: 'Stop your sound system and decoder from "vampiring" power while you sleep.', cost, monthlySavings, paybackDays, icon: Zap });
    }
    if (totals.monthlySpend > 50000) {
      const monthlySavings = totals.monthlySpend;
      const cost = 2500000;
      const paybackDays = Math.round(cost / (monthlySavings / 30));
      items.push({ id: 'solar', name: 'Solar Freedom (5kVA)', description: 'Complete freedom from GRID Band A bills and expensive generator fuel.', cost, monthlySavings, paybackDays, icon: Zap });
    }
    return items.sort((a, b) => b.monthlySavings - a.monthlySavings).slice(0, 3);
  }, [selectedAppliances, selectedSource, totals.monthlySpend]);

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const nudgeData = useMemo(() => {
    if (selectedAppliances.length === 0) return null;
    const sortedByWatts = [...selectedAppliances].sort((a, b) => {
      const appA = APPLIANCE_DATABASE.find(x => x.id === a.id);
      const appB = APPLIANCE_DATABASE.find(x => x.id === b.id);
      return (appB?.watts || 0) - (appA?.watts || 0);
    });
    const topApp = APPLIANCE_DATABASE.find(a => a.id === sortedByWatts[0].id);
    const hourlySaving = topApp ? (topApp.watts / 1000) * 1 * selectedSource.rate : 0;
    return { applianceName: topApp?.name || 'Heavy Load', saving: Math.round(hourlySaving), hasFreezer: selectedAppliances.some(a => a.id === 'freezer-chest') };
  }, [selectedAppliances, selectedSource]);

  return (
    <div className="min-h-screen bg-gray-100 pt-28 pb-12 font-sans selection:bg-nigerian-green selection:text-white">
      <Header selectedSource={selectedSource} isProMode={isProMode} setIsProMode={setIsProMode} auditType={auditType} />
      
      <main className="max-w-6xl mx-auto px-6">
        {/* Stepper - only show in wizard steps */}
        {step < 3 && (
          <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            {Array.from({ length: 3 }).map((_, s) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    step >= s ? 'bg-nigerian-green text-white ring-4 ring-nigerian-green/10' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {s + 1}
                </div>
                {s < 2 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step > s ? 'bg-nigerian-green' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" {...variants} className="max-w-4xl mx-auto space-y-10">
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Oya, let's start your Audit! 🇳🇬</h2>
                <p className="text-slate-500 mt-2 font-black uppercase tracking-widest text-xs">Step 1 of 3: Setup your space</p>
              </div>

              {/* Space Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">Wetin be your space?</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setAuditType('residential')}
                    className={`card-sleek p-6 border-2 flex flex-col items-center gap-3 transition-all ${auditType === 'residential' ? 'border-nigerian-green bg-nigerian-green/5' : 'border-transparent bg-white'}`}
                  >
                    <div className={`p-3 rounded-2xl ${auditType === 'residential' ? 'bg-nigerian-green text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <MapPin className="w-8 h-8" />
                    </div>
                    <span className="font-black text-slate-900 uppercase tracking-tighter">Residential Home</span>
                  </button>
                  <button 
                    onClick={() => setAuditType('commercial')}
                    className={`card-sleek p-6 border-2 flex flex-col items-center gap-3 transition-all ${auditType === 'commercial' ? 'border-nigerian-green bg-nigerian-green/5' : 'border-transparent bg-white'}`}
                  >
                    <div className={`p-3 rounded-2xl ${auditType === 'commercial' ? 'bg-nigerian-green text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <span className="font-black text-slate-900 uppercase tracking-tighter">Commercial / SME</span>
                  </button>
                </div>
              </div>

              {/* Power Source Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">Where you de get light?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {POWER_SOURCES.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => { setSelectedSource(source); }}
                      className={`card-sleek p-6 border-2 text-left transition-all hover:scale-[1.01] ${
                        selectedSource.id === source.id 
                          ? 'border-nigerian-green ring-4 ring-nigerian-green/5 bg-white' 
                          : 'border-transparent bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${selectedSource.id === source.id ? 'bg-nigerian-green text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {source.id.includes('grid') ? <Zap className="w-6 h-6" /> : source.id === 'solar' ? <Lightbulb className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                        </div>
                        {selectedSource.id === source.id && <CheckCircle2 className="w-6 h-6 text-nigerian-green" />}
                      </div>
                      <h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter">{source.name}</h3>
                      <p className="text-slate-500 text-xs mt-1 font-bold">{source.description}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-900">₦{source.rate.toFixed(2)}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">/ kWh</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-nigerian-green text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-nigerian-green/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Continue to Appliances <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" {...variants} className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <button 
                    onClick={() => setStep(0)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 hover:text-black"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Wetin you dey load?</h2>
                  <p className="text-slate-500 mt-2 font-medium">Select all appliances you use in your space.</p>
                </div>
                <div className="flex items-center gap-2 bg-nigerian-green text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-nigerian-green/20">
                  <span className="opacity-70 font-medium">Selected:</span> {selectedAppliances.length}
                </div>
              </div>

              {/* Categorized Appliances */}
              {['Cooling', 'Kitchen', 'Business', 'Laundry', 'Entertainment', 'Lighting'].map((cat) => (
                <div key={cat} className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">{cat}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {APPLIANCE_DATABASE.filter(a => a.category === cat).map((app) => {
                      const isSelected = selectedAppliances.some(s => s.id === app.id);
                      const Icon = app.icon;
                      return (
                        <button
                          key={app.id}
                          onClick={() => toggleAppliance(app.id)}
                          className={`card-sleek p-4 border-2 text-left transition-all flex items-center gap-3 ${
                            isSelected 
                              ? 'border-nigerian-green' 
                              : 'border-transparent hover:border-gray-200'
                          }`}
                        >
                          <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? 'bg-nigerian-green text-white' : 'bg-slate-50 text-slate-400'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{app.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold tracking-tight">{app.watts}W</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-6">
                <button
                  disabled={selectedAppliances.length === 0}
                  onClick={() => setStep(2)}
                  className="w-full bg-nigerian-green text-white py-5 rounded-xl font-black text-xl shadow-xl shadow-nigerian-green/20 hover:bg-nigerian-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  Continue to Usage <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" {...variants} className="max-w-4xl mx-auto space-y-6">
              <div>
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 hover:text-black"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">How long you dey use dem?</h2>
                <p className="text-slate-500 mt-2 font-medium">Adjust quantity and daily hours for each appliance.</p>
              </div>

              <div className="space-y-3">
                {selectedAppliances.map((item) => {
                  const app = APPLIANCE_DATABASE.find(a => a.id === item.id);
                  if (!app) return null;
                  return (
                    <div key={item.id} className="card-sleek p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
                            <app.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{app.name}</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Power: {app.watts}W</p>
                          </div>
                        </div>
                        <button onClick={() => toggleAppliance(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-2 border-t border-gray-50">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantity</label>
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => updateAppliance(item.id, 'qty', Math.max(1, item.qty - 1))}
                              className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            >-</button>
                            <span className="text-lg font-black w-8 text-center">{item.qty}</span>
                            <button 
                              onClick={() => updateAppliance(item.id, 'qty', item.qty + 1)}
                              className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            >+</button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Hrs / Day</label>
                          <div className="flex flex-col gap-1">
                            <input 
                              type="range" min="1" max="24" step="1"
                              value={item.hours}
                              onChange={(e) => updateAppliance(item.id, 'hours', parseInt(e.target.value))}
                              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-nigerian-green"
                            />
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                               <span>1 hr</span>
                               <span className="text-nigerian-green font-black">{item.hours} hrs</span>
                               <span>24 hrs</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setStep(3)}
                  className="w-full bg-nigerian-green text-white py-5 rounded-xl font-black text-xl shadow-xl shadow-nigerian-green/20 hover:bg-nigerian-accent transition-all flex items-center justify-center gap-2"
                >
                  Analyze My ROI <Zap className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" {...variants} className="space-y-8 pb-32">
              <div className="grid grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                  
                  {/* Central Bill Display */}
                  <div className="card-sleek p-10 bg-white border-t-8 border-nigerian-green text-center relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Estimated Monthly Energy Bill</p>
                      <div className="flex flex-col items-center justify-center">
                        <h2 className="text-7xl font-black text-slate-900 tracking-tighter mb-2">
                          ₦{totals.monthlySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </h2>
                        <div className="flex items-center gap-2 bg-nigerian-green/10 text-nigerian-green px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4" /> Optimized Analysis
                        </div>
                      </div>
                      
                      {/* Waste Meter */}
                      <div className="mt-12 max-w-md mx-auto space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Waste Meter</span>
                          <span className="text-sm font-black text-red-500 uppercase">₦{totals.monthlyWaste.toLocaleString()} Bleed</span>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 flex">
                          <div 
                            className="bg-nigerian-green h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${100 - (totals.monthlyWaste / (totals.monthlySpend || 1) * 100)}%` }}
                          ></div>
                          <div 
                            className="bg-red-500 h-full rounded-full transition-all duration-1000 animate-pulse" 
                            style={{ width: `${(totals.monthlyWaste / (totals.monthlySpend || 1) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase italic">
                          {(totals.monthlyWaste / (totals.monthlySpend || 1) * 100).toFixed(0)}% of your bill is "Burned" by vampire loads & old tech.
                        </p>
                      </div>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                       <Zap className="w-96 h-96 text-nigerian-green" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="card-sleek p-6 bg-white border-l-4 border-nigerian-gold">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Sabi Score</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{totals.sabiScore}</h3>
                        <span className="text-slate-300 font-bold">/100</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Your energy habits compared to the 2026 Nigerian Efficient Baseline.</p>
                    </div>
                    <div className="card-sleek p-6 bg-white border-l-4 border-nigerian-green">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Solar Transition Savings</p>
                      <div className="flex items-baseline gap-2 mt-2 font-black text-nigerian-green">
                        <h3 className="text-4xl tracking-tighter">₦{totals.potentialMonthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                        <span className="text-xs uppercase">/mo</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Potential savings if you move your critical load to solar today.</p>
                    </div>
                  </div>

                  {/* Detailed Audit */}
                  <div className="card-sleek p-8 bg-white">
                      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
                        <div>
                          <h3 className="font-black text-slate-800 uppercase tracking-tight">Appliance Breakdown</h3>
                          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Cost by category</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => alert('Feature incoming: 2026 Energy Health Certificate PDF starting download...')}
                            className="text-[10px] font-black bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                          >
                             <FileText className="w-3 h-3" /> Get PDF Certificate
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {selectedAppliances.map((item) => {
                          const app = APPLIANCE_DATABASE.find(a => a.id === item.id);
                          if (!app) return null;
                          const appMonthlyCost = ((app.watts * item.qty * item.hours) / 1000) * 30 * selectedSource.rate;
                          const isHigh = appMonthlyCost > (auditType === 'residential' ? 15000 : 40000);

                          return (
                            <div key={item.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                              isHigh ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 border-gray-100'
                            }`}>
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                                  isHigh ? 'bg-red-500 text-white' : 'bg-white text-slate-600 border border-slate-100'
                                }`}>
                                  <app.icon className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-black text-gray-800 text-sm leading-tight truncate">{app.name} ({item.qty}x)</p>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                    {item.hours}H/Day • {app.watts}W
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-black text-sm ${isHigh ? 'text-red-600' : 'text-gray-800'}`}>
                                  ₦{appMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                                  {isHigh ? 'Money Waster' : 'Optimized'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  </div>
                </div>

                {/* Sidebar Area */}
                <aside className="col-span-12 lg:col-span-4 space-y-6">
                  <div className="card-sleek border-t-8 border-nigerian-gold p-8 bg-white sticky top-28">
                      <h3 className="font-black text-gray-800 mb-8 flex items-center gap-2 uppercase tracking-tighter text-xl">
                        <Trophy className="w-6 h-6 text-nigerian-gold" /> Survival Roadmap
                      </h3>
                      
                      <div className="space-y-8">
                        {roadmapItems.map((upgrade, idx) => (
                          <div key={idx} className="relative pl-8">
                            <div className="absolute left-0 top-0 text-xl font-black text-slate-100 italic leading-none">{idx + 1}</div>
                            <p className="text-sm font-black text-nigerian-green uppercase tracking-tight">{upgrade.name}</p>
                            <div className="flex justify-between text-[10px] font-black mt-2 text-gray-400 uppercase tracking-widest">
                              <span>ROI: {upgrade.paybackDays} Days</span>
                              <span className="text-nigerian-gold">SAVE: ₦{(upgrade.monthlySavings / 1000).toFixed(1)}k/mo</span>
                            </div>
                            <p className="text-[11px] mt-4 text-slate-500 font-medium border-l-2 border-slate-100 pl-4 leading-relaxed bg-slate-50 p-3 rounded-r-xl">
                              {upgrade.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-8 border-t border-slate-100 mt-8 space-y-3">
                         <button 
                            onClick={() => { setStep(0); setSelectedAppliances([]); }}
                            className="w-full py-4 px-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                            <History className="w-4 h-4" /> Start New Audit
                          </button>
                      </div>
                  </div>

                  {/* Contextual SMEs Advice */}
                  {auditType === 'commercial' && (
                    <div className="bg-slate-900 text-white p-6 rounded-2xl border border-white/10 shadow-xl overflow-hidden relative">
                       <h4 className="text-[10px] font-black text-nigerian-gold uppercase tracking-[0.2em] mb-4">SME Business Strategy</h4>
                       <p className="text-sm font-black mb-3 leading-tight tracking-tight italic">
                          "If you turn off deep freezers at close of business (10 PM), you'd save an extra ₦12,000/mo!"
                       </p>
                       <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
                          <Briefcase className="w-24 h-24" />
                       </div>
                    </div>
                  )}
                </aside>
              </div>

              {/* Industry & Pro Mode Features */}
              {isProMode && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="space-y-12 mt-12"
                >
                  {/* Market Intelligence Hub (For Energy/Petroleum Firms) */}
                  <div className="bg-white p-8 md:p-12 rounded-[3rem] border-4 border-nigerian-gold shadow-2xl relative overflow-hidden ring-8 ring-nigerian-gold/5">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                      <ShieldCheck className="w-96 h-96 text-nigerian-gold" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-xl transform rotate-3">
                            <TrendingDown className="w-8 h-8 text-nigerian-gold" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Market Intelligence View</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] font-black">Pro Energy Insights • April 2026</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                           <button 
                             onClick={() => alert('Industry Master Sync Completed: 42 new audit nodes registered in your sector.')}
                             className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                           >
                              <Cloud className="w-4 h-4" /> Global Intelligence Sync
                           </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Grid relief stats */}
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center">
                           <div className="w-12 h-12 bg-nigerian-green/10 text-nigerian-green rounded-2xl flex items-center justify-center mb-6">
                              <Zap className="w-6 h-6" />
                           </div>
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grid Relief Potential</h4>
                           <h3 className="text-5xl font-black text-slate-900 tracking-tight mb-2">
                             {totals.gridReliefAmps.toFixed(1)} <span className="text-lg text-nigerian-green font-black">Amps</span>
                           </h3>
                           <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                              Capacity reclaimable for the transformer at <span className="text-slate-900">{auditorInfo.lga || 'Current Sector'}</span> via load-swapping.
                           </p>
                        </div>

                        {/* Petroleum Sector stats */}
                        <div className="bg-slate-900 text-white p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center relative overflow-hidden">
                           <div className="relative z-10 w-full">
                              <div className="w-12 h-12 bg-nigerian-gold text-white rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <TrendingDown className="w-6 h-6" />
                              </div>
                              <h4 className="text-[10px] font-black text-nigerian-gold uppercase tracking-widest mb-2">Fuel Displacement Analysis</h4>
                              
                              {(selectedSource.id === 'petrol' || selectedSource.id === 'diesel') ? (
                                <div className="space-y-4">
                                   <div className="text-4xl font-black text-white tracking-tight">
                                      ₦{(totals.monthlySpend * 0.4).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm">/ Save</span>
                                   </div>
                                   <p className="text-[11px] font-bold text-white/50 leading-relaxed">
                                      Available monthly savings if facility switches to a CNG Gas-to-Power hub.
                                   </p>
                                </div>
                              ) : (
                                <p className="text-[11px] font-bold text-white/40 italic uppercase mt-4">Grid-Focus: Low Fuel Displacement Priority</p>
                              )}
                           </div>
                        </div>

                        {/* Community Map Data */}
                        <div className="bg-white border-2 border-slate-100 p-8 rounded-[2rem] shadow-sm">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Globe className="w-4 h-4" /> Community Trends (LGA)
                           </h4>
                           <div className="space-y-4">
                              {[
                                { lga: auditorInfo.lga || 'Your LGA', waste: ((totals.monthlyWaste / (totals.monthlySpend || 1)) * 100).toFixed(0), trend: 'up' },
                                { lga: 'Aba North', waste: '42', trend: 'down' },
                                { lga: 'Ikeja Industrial', waste: '28', trend: 'down' }
                              ].map((trend, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                   <span className="text-[11px] font-black uppercase text-slate-800">{trend.lga}</span>
                                   <div className="flex items-center gap-3">
                                      <span className="text-xs font-black text-slate-900">{trend.waste}% Waste</span>
                                      <div className={`w-2 h-2 rounded-full ${trend.trend === 'up' ? 'bg-red-500' : 'bg-nigerian-green'}`}></div>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auditor Professional Portal (Student / Consultant View) */}
                  <div className="bg-white p-8 md:p-12 rounded-[3rem] border-4 border-slate-900 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                      <Briefcase className="w-96 h-96 text-slate-900" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-100">
                        <div className="w-16 h-16 bg-nigerian-gold text-white rounded-[2rem] flex items-center justify-center shadow-xl transform -rotate-3">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Student Auditor Portal</h3>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] font-black">Verified Sabi Auditor Portfolio</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Meta Data Inputs */}
                        <div className="lg:col-span-4 space-y-6">
                           <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Database className="w-4 h-4" /> Audit Meta-Data
                              </h4>
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Auditor Name</label>
                                  <input 
                                    type="text"
                                    placeholder="e.g. Chinelo Obi"
                                    value={auditorInfo.name}
                                    onChange={(e) => setAuditorInfo(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-white border-2 border-slate-200 px-4 py-3 rounded-xl text-sm font-bold focus:border-nigerian-gold outline-none transition-all"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Business Name</label>
                                  <input 
                                    type="text"
                                    placeholder="e.g. Mama Put Ventures"
                                    value={auditorInfo.business}
                                    onChange={(e) => setAuditorInfo(prev => ({ ...prev, business: e.target.value }))}
                                    className="w-full bg-white border-2 border-slate-200 px-4 py-3 rounded-xl text-sm font-bold focus:border-nigerian-gold outline-none transition-all"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">LGA / Region</label>
                                  <input 
                                    type="text"
                                    placeholder="e.g. Ikeja, Lagos"
                                    value={auditorInfo.lga}
                                    onChange={(e) => setAuditorInfo(prev => ({ ...prev, lga: e.target.value }))}
                                    className="w-full bg-white border-2 border-slate-200 px-4 py-3 rounded-xl text-sm font-bold focus:border-nigerian-gold outline-none transition-all"
                                  />
                                </div>
                              </div>
                              <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Sabi Points</p>
                                    <p className="text-3xl font-black text-nigerian-gold">{selectedAppliances.length * 10}</p>
                                 </div>
                                 <div className="w-12 h-12 bg-nigerian-gold text-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <ShieldCheck className="w-6 h-6" />
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Summary Info / Action */}
                        <div className="lg:col-span-8 space-y-8">
                           <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex items-center gap-8">
                              <div className="flex-1">
                                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Portfolio Readiness</h4>
                                 <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                                   "Hey {auditorInfo.name || 'Sabi Auditor'}, you have audited {selectedAppliances.length} appliances for {auditorInfo.business || 'your client'}. Your data shows a Grid Relief potential of {totals.gridReliefAmps.toFixed(1)} Amps!"
                                 </p>
                              </div>
                              <div className="flex flex-col gap-3">
                                 <button 
                                   onClick={() => alert(`Aggregated Data Exported for ${auditorInfo.lga}`)}
                                   className="bg-white border-2 border-slate-900 text-slate-900 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                                 >
                                    <FileJson className="w-5 h-5 mx-auto" />
                                    <span className="text-[9px] font-black uppercase">Export CSV</span>
                                 </button>
                                 <button 
                                   onClick={() => alert('Syncing to National Energy Registry...')}
                                   className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-all shadow-xl"
                                 >
                                    <Cloud className="w-5 h-5 mx-auto" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Sync Port</span>
                                 </button>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl">
                                 <h5 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Market Comparison</h5>
                                 <p className="text-xs font-bold text-slate-500">This business has a waste factor of <span className="text-red-500">{((totals.monthlyWaste / (totals.monthlySpend || 1)) * 100).toFixed(0)}%</span>, which is {(totals.monthlyWaste / (totals.monthlySpend || 1)) > 0.3 ? 'higher' : 'lower'} than the state average.</p>
                              </div>
                              <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl">
                                 <h5 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Next Recommended Step</h5>
                                 <p className="text-xs font-bold text-slate-500">Conduct a structural insulation audit for {auditorInfo.business || 'the client'} to reduce AC load by a further 15%.</p>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tips & System Status */}
              <footer className="pt-8 border-t border-gray-200 mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div>April 2026 Price Indices Integrated • Nigeria Hackathon MVP</div>
                <div className="flex gap-6 items-center">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-nigerian-green animate-pulse"></span> 
                    System Stable
                  </span>
                  <span className="opacity-20">|</span>
                  <span>v2.0.4-prod</span>
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sabi AI Advisor Floating Chat */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 bg-nigerian-gold text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all ring-4 ring-nigerian-gold/20 relative"
        >
          {isChatOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
          {!isChatOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Sabi AI</span>
          )}
        </button>

        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 left-0 w-[90vw] md:w-[400px] bg-white rounded-3xl shadow-2xl border-2 border-nigerian-gold overflow-hidden flex flex-col h-[500px]"
            >
              {/* Chat Header */}
              <div className="bg-nigerian-green p-6 text-white flex items-center gap-4">
                <div className="w-10 h-10 bg-nigerian-gold rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest">Sabi AI Advisor</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-nigerian-gold rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase opacity-70">Always Online</span>
                  </div>
                </div>
              </div>

              {/* Chat Content */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
                      msg.role === 'ai' 
                        ? 'bg-nigerian-gold text-slate-900 rounded-tl-none border-l-4 border-slate-900/10' 
                        : 'bg-nigerian-green text-white rounded-tr-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex flex-col items-start gap-2">
                    <div className="bg-nigerian-gold/20 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                      <div className="w-1 h-1 bg-nigerian-gold rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-nigerian-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1 h-1 bg-nigerian-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      <span className="text-[10px] font-black text-slate-600 ml-2 uppercase tracking-widest">Sabi is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap gap-2">
                 <button 
                  onClick={() => handleSendMessage("How can I reduce my home/shop bill by ₦30k?")} 
                  className="text-[9px] font-black uppercase tracking-widest border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
                 >Bill reduction?</button>
                 <button 
                  onClick={() => handleSendMessage("Is my generator spend enough to justify switching to Solar or CNG?")}
                  className="text-[9px] font-black uppercase tracking-widest border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
                 >Solar ROI?</button>
                 <button 
                  onClick={() => handleSendMessage("What is my 'Community Impact Score'?")}
                  className="text-[9px] font-black uppercase tracking-widest border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
                 >My Impact?</button>
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Sabi anything..."
                  className="flex-1 bg-slate-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-nigerian-gold transition-all"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!chatInput.trim() || isStreaming}
                  className="w-10 h-10 bg-nigerian-green text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Simulated Nudge Pop-up */}
      <AnimatePresence>
        {showNudge && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] max-w-sm w-full"
          >
            <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/20">
               <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-red-500 rounded-xl ring-4 ring-red-500/20">
                     <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                  <button onClick={() => setShowNudge(false)} className="text-white/20 hover:text-white transition-colors">
                     <Plus className="w-6 h-6 rotate-45" />
                  </button>
               </div>
               <h3 className="text-2xl font-black mb-3 tracking-tighter">Peak Time Alert! 🇳🇬</h3>
               <p className="text-sm text-white/70 leading-relaxed font-bold tracking-tight">
                  {nudgeData?.hasFreezer 
                    ? "Peak Time (4 PM - 9 PM) protection enabled. " 
                    : "Energy demand is high right now. "} 
                  Your <span className="text-red-400 font-bold">{nudgeData?.applianceName}</span> is your biggest spend right now. Using it for 1 hour less today saves you <span className="text-green-400 font-bold">₦{nudgeData?.saving}</span>!
               </p>
               <button 
                  onClick={() => { setShowNudge(false); }}
                  className="mt-8 w-full py-4 bg-white text-slate-900 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all shadow-lg active:scale-95"
               >
                  I've Turned It Off
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
