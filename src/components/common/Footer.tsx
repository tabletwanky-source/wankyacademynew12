import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, Phone, Globe, Shield } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <img src="https://i.postimg.cc/wTr99qNp/d-modern-logo-icon-for-Wanky-Academy-WA-1.png" alt="Wanky Academy" className="w-10 h-10 object-contain" />
             <h2 className="text-white font-black text-xl tracking-tighter uppercase">Wanky Academy</h2>
          </div>
          <p className="text-sm leading-relaxed opacity-80 font-medium">
            {t('footer.description')}
          </p>
          <div className="pt-4 flex items-center gap-4">
             <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white hover:bg-indigo-600 transition-colors cursor-pointer">
               <Globe className="w-4 h-4" />
             </div>
             <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white hover:bg-indigo-600 transition-colors cursor-pointer">
               <Shield className="w-4 h-4" />
             </div>
          </div>
        </div>

        <div>
          <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">{t('footer.contact')}</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold">+1 829 620 9249</span>
            </li>
            <li className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold">support@wankyacademy.com</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold italic opacity-60">Available worldwide online</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">{t('footer.links')}</h3>
          <ul className="space-y-3">
            <li><Link to="/" className="text-sm font-bold hover:text-indigo-400 transition-colors">{t('footer.home')}</Link></li>
            <li><Link to="/exams" className="text-sm font-bold hover:text-indigo-400 transition-colors">{t('footer.exams')}</Link></li>
            <li><Link to="/learning" className="text-sm font-bold hover:text-indigo-400 transition-colors">{t('footer.classes')}</Link></li>
            <li><Link to="/certificates" className="text-sm font-bold hover:text-indigo-400 transition-colors">{t('footer.myCertificates')}</Link></li>
            <li><Link to="/verify" className="text-sm font-bold hover:text-indigo-400 transition-colors">{t('footer.verifyCertificate')}</Link></li>
            <li><Link to="/privacy" className="text-sm font-bold hover:text-indigo-400 transition-colors">{t('footer.privacy')}</Link></li>
          </ul>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
           <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">Newsletter</h3>
           <p className="text-[10px] uppercase font-bold text-slate-500 mb-4 tracking-widest">Get academic updates</p>
           <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs w-full focus:ring-1 focus:ring-indigo-500 outline-none" />
              <button className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-all font-black text-[10px] uppercase tracking-widest px-4">Join</button>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
          © 2026 Wanky Academy. {t('footer.rights')}
        </p>
        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest opacity-40">
           <Link to="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
           <Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
           <Link to="/cookies" className="hover:opacity-100 transition-opacity">Cookies</Link>
           <Link to="/faq" className="hover:opacity-100 transition-opacity">FAQ</Link>
           <Link to="/copyright-policy" className="hover:opacity-100 transition-opacity">Copyright</Link>
        </div>
      </div>
    </footer>
  );
}
