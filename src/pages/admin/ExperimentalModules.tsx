import React from 'react';
import { 
  FlaskConical, 
  ShieldAlert, 
  Cpu, 
  Eye, 
  Brain, 
  Fingerprint, 
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

const MODULES = [
  {
    title: "AI Assistant Professor",
    tagline: "Automated grading and student support",
    status: "Planning",
    icon: Brain,
    color: "bg-purple-50 text-purple-600 border-purple-100"
  },
  {
    title: "Biometric Attendance",
    tagline: "Facial recognition log & scan",
    status: "Testing",
    icon: Fingerprint,
    color: "bg-blue-50 text-blue-600 border-blue-100"
  },
  {
    title: "AI Question Generator",
    tagline: "Smart exam creation from PDF/Video",
    status: "Alpha",
    icon: Sparkles,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100"
  },
  {
    title: "Advanced Behavioral Analytics",
    tagline: "Predict student performance using AI",
    status: "R&D",
    icon: Cpu,
    color: "bg-slate-50 text-slate-600 border-emerald-100"
  }
];

export default function ExperimentalModules() {
  return (
    <div className="space-y-8 pb-20">
      <div className="bg-[#0f172a] rounded-3xl p-10 text-white relative overflow-hidden border border-slate-700 shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20 flex items-center gap-2">
              <ShieldAlert className="w-3 h-3" />
              Secure Development
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4 italic flex items-center gap-4">
             <FlaskConical className="w-10 h-10 text-indigo-400" />
             EXPERIMENTAL MODULES
          </h1>
          <p className="text-slate-400 text-sm italic font-medium max-w-xl leading-relaxed">
            These features are currently in private beta and are only accessible to system administrators for testing. 
            Do not use in production environments.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {MODULES.map((module, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative group overflow-hidden"
          >
             <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${module.color} border transition-transform group-hover:scale-110`}>
                   <module.icon className="w-6 h-6" />
                </div>
                <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100 italic">
                  {module.status}
                </span>
             </div>

             <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tight">{module.title}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{module.tagline}</p>
             </div>

             <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Lock className="w-3.5 h-3.5 text-slate-300" />
                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Locked for Development</span>
                </div>
                <button disabled className="p-3 bg-slate-50 text-slate-200 rounded-xl">
                   <ChevronRight className="w-4 h-4" />
                </button>
             </div>

             {/* Experimental Indicator */}
             <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-[8px] bg-red-50 text-red-500 font-black uppercase px-2 py-0.5 rounded border border-red-100">Exp</div>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4">
         <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
         <div>
            <h4 className="font-black text-slate-400 uppercase tracking-[0.2em] italic">Access Controlled</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto mt-2">
              Wait for system deployment V2.x to unlock these features for professors and students.
            </p>
         </div>
      </div>
    </div>
  );
}
