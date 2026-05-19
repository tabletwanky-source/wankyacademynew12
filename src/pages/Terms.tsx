import React from 'react';
import { Gavel, ShieldAlert, UserCheck, FileText, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import Footer from '../components/common/Footer';

export default function Terms() {
  const terms = [
    {
      id: "01",
      title: "Acceptance of Terms",
      content: "By accessing Wanky Academy, you agree to be bound by these Terms of Service and all applicable laws and regulations."
    },
    {
      id: "02",
      title: "User Accounts",
      content: "You are responsible for maintaining the confidentiality of your access code. Any unauthorized use of your account must be reported immediately."
    },
    {
      id: "03",
      title: "Intellectual Property",
      content: "The service and its original content are and will remain the exclusive property of Wanky Academy and its licensors."
    },
    {
      id: "04",
      title: "Limitation of Liability",
      content: "Wanky Academy shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Scale className="w-4 h-4" /> Informations Légales
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">Terms of Service</h1>
          <p className="text-slate-500 font-medium">Veuillez lire attentivement nos conditions d'utilisation.</p>
        </div>

        <div className="space-y-8">
          {terms.map((term, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-8xl font-black text-slate-50 opacity-5 -mr-4 -mt-4 italic">
                {term.id}
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight flex items-center gap-3">
                  <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs not-italic">{term.id}</span>
                  {term.title}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed md:text-lg">
                  {term.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <ShieldAlert className="w-8 h-8 text-amber-500" />
              <div>
                 <p className="text-sm font-bold text-slate-300">Dernière mise à jour : 20 Mars 2026</p>
                 <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Wanky Academy Compliance</p>
              </div>
           </div>
           <button 
             onClick={() => window.print()}
             className="px-6 py-3 bg-white/10 hover:bg-white hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
           >
             <FileText className="w-4 h-4" /> Print Document
           </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
