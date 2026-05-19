import React from 'react';
import { Cookie, Info, Settings, ShieldCheck, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import Footer from '../components/common/Footer';

export default function Cookies() {
  const cookieTypes = [
    {
      title: "Session Cookies",
      description: "Utilisé pour maintenir votre session login active pendant votre navigation.",
      essential: true
    },
    {
      title: "Authentication Cookies",
      description: "Asire ke se ou menm sèlman ki gen aksè ak done pèsonèl ou.",
      essential: true
    },
    {
      title: "User Preferences",
      description: "Conserve vos choix de langue et de thème (si applicable).",
      essential: false
    },
    {
      title: "Security Cookies",
      description: "Protéger la plateforme contre les attaques et prévenir l'usurpation d'identité.",
      essential: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Cookie className="w-4 h-4" /> Gestion des Données
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">Cookies Policy</h1>
          <p className="text-slate-500 font-medium">Comment et pourquoi nous utilisons des cookies.</p>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden p-8 md:p-16 space-y-12">
          <section className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">C'est quoi un Cookie ?</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Les cookies sont de petits fichiers texte placés sur votre appareil pour aider le site à fournir une meilleure expérience utilisateur. Nous les utilisons principalement pour l'authentification et la sécurité.
            </p>
          </section>

          <div className="grid gap-6">
            {cookieTypes.map((cookie, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all"
              >
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Settings className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-sm">{cookie.title}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">{cookie.description}</p>
                   </div>
                </div>
                {cookie.essential ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" /> Essentiel
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-slate-200 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">Optionnel</span>
                )}
              </motion.div>
            ))}
          </div>

          <section className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start gap-6">
             <Info className="w-6 h-6 text-indigo-600 shrink-0 mt-1" />
             <div className="space-y-2">
                <h4 className="font-black text-indigo-900 uppercase italic text-sm">Gestion des Cookies</h4>
                <p className="text-sm text-indigo-700 font-medium leading-relaxed">
                  Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, mais sachez que certaines fonctionnalités clés de l'Académie (comme la connexion) cesseront de fonctionner.
                </p>
                <a 
                  href="https://www.aboutcookies.org" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2 hover:underline"
                >
                  Learn how to manage cookies <ExternalLink className="w-3 h-3" />
                </a>
             </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
