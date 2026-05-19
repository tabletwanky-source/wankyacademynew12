import { 
  GraduationCap, 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Users, 
  ArrowRight, 
  Menu, 
  X, 
  Briefcase, 
  Star, 
  ShoppingBag, 
  CheckCircle, 
  Award, 
  Target, 
  Heart, 
  Info,
  Share2,
  ExternalLink,
  Shield
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/language/LanguageSwitcher';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

import Footer from '../components/common/Footer';
import { blogService } from '../services/blogService';
import { Article } from '../types';

function LatestArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blogService.subscribeArticles((allArticles) => {
      const published = allArticles
        .filter(a => a.status === 'published')
        .sort((a, b) => {
          const dateA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
          const dateB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
          return dateB - dateA;
        })
        .slice(0, 3);
      setArticles(published);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading || articles.length === 0) return null;

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto border-t border-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-xl">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Journal & Actualités</p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase italic">Derniers Articles</h2>
          <p className="text-slate-500 font-medium italic">Restez informé des dernières nouvelles et tutoriels de l'académie.</p>
        </div>
        <Link to="/blog" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
          Voir tout le blog
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {articles.map((article) => (
          <Link key={article.id} to={`/blog/${article.id}`} className="group flex flex-col h-full bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
            <div className="relative h-48 overflow-hidden">
               <img 
                 src={article.coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop"} 
                 alt={article.title} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-600">
                    {article.category}
                  </span>
               </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                   {article.authorName?.charAt(0) || 'A'}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {article.authorName} • {article.createdAt?.seconds ? new Date(article.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                </p>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter leading-tight">
                {article.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 mb-6 flex-1 font-medium italic">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest pt-4 border-t border-slate-50">
                <span>Lire la suite</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BookModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="relative h-64 overflow-hidden shrink-0">
               <img 
                 src="https://m.media-amazon.com/images/I/610K4zhvrFL._SL1293_.jpg" 
                 className="w-full h-full object-cover" 
                 alt="Enfòmatik Debaz"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
               <button 
                 onClick={onClose}
                 className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"
               >
                 <X className="w-6 h-6" />
               </button>
               <div className="absolute bottom-8 left-8">
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tight leading-tight">
                    ENFÒMATIK DEBAZ:<br />Yon Gid Pratik pou Debitan
                  </h2>
               </div>
            </div>
            
            <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
               <div className="space-y-8">
                  <div className="space-y-4">
                     <p className="text-slate-600 font-medium leading-relaxed italic">
                        ENFÒMATIK DEBAZ – Yon Gid Pratik pou Debitan se yon liv pratike ki fèt espesyalman pou moun ki vle aprann baz enfòmatik nan yon lang ki klè, senp, epi fasil pou konprann.
                     </p>
                     <p className="text-slate-600 font-medium leading-relaxed">
                        Liv sa a fèt pou tout débutan ki vle konprann òdinatè, teknoloji, ak itilizasyon zouti dijital nan lavi chak jou, san konplikasyon.
                     </p>
                  </div>

                  <div className="space-y-6">
                     <h3 className="text-lg font-black text-slate-900 uppercase italic flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-600" /> Nan liv sa a, ou pral aprann:
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          "Kisa enfòmatik ye", 
                          "Kijan òdinatè fonksyone", 
                          "Pati òdinatè a (hardware ak software)", 
                          "Itilizasyon klavye ak sourit", 
                          "Entwodiksyon ak Microsoft Word", 
                          "Entènèt ak imèl etap pa etap"
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                             <span className="text-xs font-bold text-slate-700">{item}</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 italic">
                     <p className="text-indigo-900 font-bold mb-2 uppercase text-[10px] tracking-widest">Liv sa a fèt pou:</p>
                     <div className="flex flex-wrap gap-4">
                        {['Elèv', 'Pwofesè', 'Debutan', 'Tout moun ki pale kreyòl'].map((t, i) => (
                          <span key={i} className="text-sm text-indigo-600 font-black">• {t}</span>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-slate-600 font-medium leading-relaxed">
                        Liv la ekri antyèman an Kreyòl Ayisyen, ak yon apwòch pratike ki adapte ak reyalite jodi a. 
                     </p>
                     <p className="font-black text-indigo-600 uppercase italic tracking-widest text-sm">
                        Simple, klè, epi efikas.
                     </p>
                  </div>

                  <div className="pt-4">
                    <a 
                      href="https://www.amazon.com/dp/B0GF6YV7D6" 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100"
                    >
                      <ShoppingBag className="w-5 h-5" /> Acheter sur Amazon
                    </a>
                  </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();
  const { user, role, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && user && role) {
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'professor') {
        navigate('/professor/dashboard');
      } else if (role === 'student') {
        navigate('/dashboard');
      }
    }
  }, [user, role, loading, navigate]);
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="https://i.postimg.cc/wTr99qNp/d-modern-logo-icon-for-Wanky-Academy-WA-1.png" alt="Wanky Academy" className="w-10 h-10 object-contain" />
            <div className="leading-none">
              <span className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">Wanky</span>
              <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest leading-none">Academy Portal</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <a href="#courses" className="hover:text-indigo-600 transition-colors">Formations</a>
            <Link to="/wa-multiservices" className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-900 rounded-xl hover:bg-indigo-600 hover:text-white transition-all group">
              <Briefcase className="w-3.5 h-3.5 group-hover:animate-pulse" />
              WA Multiservices
            </Link>
            <LanguageSwitcher />
            {user ? (
              <button 
                onClick={() => logout()} 
                className="px-5 py-2.5 rounded-xl border-2 border-red-100 text-red-600 hover:bg-red-50 transition-all font-black"
              >
                {t('common.logout')}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-5 py-2.5 rounded-xl border-2 border-slate-100 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all">{t('auth.login')}</Link>
                <Link to="/register" className="px-6 py-3 rounded-xl bg-[#0f172a] text-white hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100">{t('auth.register')}</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="px-8 py-8 flex flex-col gap-6 text-[11px] font-black uppercase tracking-widest">
                <a href="#courses" onClick={() => setMobileMenuOpen(false)} className="text-slate-500">Formations</a>
                <Link to="/wa-multiservices" onClick={() => setMobileMenuOpen(false)} className="text-indigo-600 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> WA Multiservices
                </Link>
                <div className="h-[1px] bg-slate-100"></div>
                {user ? (
                  <button onClick={() => logout()} className="text-red-600 text-left">Logout</button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-slate-500">Login</Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-slate-900">Join Academy</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="px-8 pt-16 pb-24 max-w-7xl mx-auto overflow-hidden">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
              {t('landing.hero.enrolling')}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] mb-8 tracking-tighter">
              {t('landing.hero.title')}
            </h1>
            <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-md font-medium border-l-4 border-slate-200 pl-6 italic">
              "{t('landing.hero.subtitle')}"
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="geometric-button-indigo px-10 flex items-center gap-2">
                {t('landing.hero.join')} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="px-10 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all shadow-sm">
                {t('landing.hero.access')}
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:p-12"
          >
            <div className="bg-[#0f172a] p-2 rounded-3xl shadow-2xl relative z-10 overflow-hidden transform md:rotate-1">
              <img 
                src="https://i.postimg.cc/9F2LzS6B/7.png" 
                alt="Wanky Academy Campus" 
                className="rounded-[1.4rem] opacity-90 hover:opacity-100 transition-opacity duration-700 w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-indigo-600/5 pointer-events-none"></div>
            </div>
            
            {/* Geometric Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-900/5 rotate-45 border-8 border-slate-900/10"></div>
          </motion.div>
        </div>
      </section>

      {/* Info Boxes */}
      <section className="bg-white border-y border-slate-100 py-16 px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          {[
            { label: t('landing.stats.learners'), val: '1.4k+' },
            { label: t('landing.stats.uptime'), val: '99.9%' },
            { label: t('landing.stats.security'), val: t('common.verified') },
            { label: t('landing.stats.term'), val: '2026' }
          ].map((item, i) => (
            <div key={i} className="text-center md:text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
              <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{item.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <img src="https://i.postimg.cc/dt13CvbM/wankyacade.png" alt="Wanky Academy Training" className="rounded-2xl shadow-xl border border-slate-100" />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">{t('landing.features.innovation')}</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-6 italic">{t('landing.features.redefining')}</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              {t('landing.features.description')}
            </p>
            <div className="space-y-4">
              {[t('landing.features.data'), t('landing.features.tracking'), t('landing.features.experts')].map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Book Section */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 group cursor-pointer" onClick={() => setIsBookModalOpen(true)}>
              <img 
                src="https://m.media-amazon.com/images/I/610K4zhvrFL._SL1293_.jpg" 
                alt="Enfòmatik Debaz" 
                className="w-full h-auto rounded-[2rem] shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-transparent transition-colors rounded-[2rem]"></div>
              <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex flex-col items-center gap-1">
                 <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                 <span className="text-[10px] font-black uppercase text-slate-800">5.0 Rating</span>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-slate-900/5 rounded-full blur-3xl -z-10"></div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <Star className="w-3 h-3 fill-amber-600" /> Featured Book
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4 italic uppercase">
                ENFÒMATIK DEBAZ:<br />
                <span className="text-indigo-600">Yon Gid Pratik pou Debitan</span>
              </h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic mb-6">by Wanky Massenat • Paperback Edition</p>
              <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-indigo-600">
                <p className="text-slate-600 font-medium leading-relaxed italic">
                  "ENFÒMATIK DEBAZ – Yon Gid Pratik pou Debitan se yon liv pratike ki fèt espesyalman pou moun ki vle aprann baz enfòmatik nan yon lang ki klè, senp, epi fasil pou konprann."
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setIsBookModalOpen(true)}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Read More
              </button>
              <a 
                href="https://www.amazon.com/dp/B0GF6YV7D6" 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:border-indigo-600 transition-all flex items-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" /> Buy on Amazon
              </a>
            </div>

            <div className="pt-8 border-t border-slate-100">
               <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                     ))}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recomended by 500+ students</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Wanky Massenat Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid md:grid-cols-12 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-5 relative"
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-indigo-600/20 rounded-[3rem] blur-2xl group-hover:bg-indigo-600/30 transition-all"></div>
                <img 
                  src="https://i.postimg.cc/vH7SzM7b/6.png" 
                  alt="Wanky Massenat" 
                  className="w-full h-auto rounded-[3rem] relative z-10 grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute bottom-8 right-8 z-20 bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Founder of</p>
                      <p className="text-sm font-black text-slate-900 uppercase italic leading-none">Wanky Academy</p>
                   </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7 space-y-8"
            >
              <div>
                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4 text-center md:text-left">The Visionary</p>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none italic uppercase text-center md:text-left">
                  About <span className="text-indigo-400">Wanky Massenat</span>
                </h2>
              </div>
              
              <div className="space-y-6 text-slate-300 font-medium leading-relaxed md:text-lg">
                <p>
                  Wanky Massenat se yon antreprenè dijital, etidyan medsin, fòmatè teknoloji, ak fondatè Wanky Academy. Li espesyalize nan edikasyon dijital, Canva, devlopman entènèt, ak fòmasyon enfòmatik an Kreyòl Ayisyen.
                </p>
                <p className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] italic text-slate-100">
                  "Objektif li se ede kominote ayisyèn nan jwenn aksè ak bon jan fòmasyon teknoloji ak zouti dijital modèn."
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-8">
                 {[
                   { icon: Target, label: "Visionary" },
                   { icon: Heart, label: "Educator" },
                   { icon: Shield, label: "Leader" }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-2 group">
                      <item.icon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                   </div>
                 ))}
                 <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                   <Share2 className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                   <ExternalLink className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Wanky Academy Section */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-6">Our Institution</p>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
            À propos de <span className="text-indigo-600">Wanky Academy</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2 p-12 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
             <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Info className="w-8 h-8 text-indigo-600" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 uppercase italic">Notre Histoire</h3>
             <p className="text-slate-500 font-medium leading-relaxed">
               Wanky Academy est plus qu'une simple école en ligne. Nous sommes une communauté de créateurs, d'entrepreneurs et d'apprenants à vie. Notre plateforme est conçue pour offrir une éducation numérique de haute qualité et accessible à tous, quel que soit leur point de départ.
             </p>
          </div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="p-10 bg-indigo-600 text-white rounded-[3rem] space-y-6"
          >
             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
             </div>
             <h3 className="text-xl font-black uppercase italic tracking-tight">Notre Mission</h3>
             <p className="text-sm font-medium leading-relaxed opacity-90">
               Donner aux individus les compétences numériques nécessaires pour prospérer dans l'économie moderne.
             </p>
          </motion.div>

          <div className="space-y-8">
            <motion.div 
              whileHover={{ x: 10 }}
              className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl"
            >
               <div className="flex items-center gap-4 mb-4">
                  <Heart className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-black uppercase italic text-sm tracking-widest">Nos Valeurs</h3>
               </div>
               <p className="text-xs text-slate-400 font-medium leading-relaxed">
                 L'excellence, l'accessibilité et la réussite des étudiants sont au cœur de tout ce que nous faisons.
               </p>
            </motion.div>

            <motion.div 
              whileHover={{ x: 10 }}
              className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm"
            >
               <div className="flex items-center gap-4 mb-4">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black uppercase italic text-sm tracking-widest text-slate-900">Notre Engagement</h3>
               </div>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">
                 Nous fournissons des certificats reconnus et une formation concrète qui donne des résultats.
               </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">{t('common.learning')}</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-4">{t('landing.curriculum.title')}</h2>
            <p className="text-slate-500 font-medium">{t('landing.curriculum.description')}</p>
          </div>
          <div className="hidden lg:block text-8xl font-black text-slate-100 select-none">{t('landing.curriculum.modules')}</div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Auto École", icon: BookOpen, color: "bg-indigo-600", desc: "Professional driving instruction and licensing preparation." },
            { title: "Informatique", icon: Clock, color: "bg-slate-900", desc: "Fundamental computer science and digital literacy programs." },
            { title: "Technique Informatique", icon: Users, color: "bg-indigo-400", desc: "Advanced technical training and systems maintenance." }
          ].map((course, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -10 }}
              className="geometric-card p-10 group"
            >
              <div className={`w-14 h-14 ${course.color} rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform`}>
                <course.icon className="text-white w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">{course.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">{course.desc}</p>
              <Link to="/register" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b-2 border-indigo-100 hover:border-indigo-600 transition-all">{t('landing.curriculum.enroll')}</Link>
            </motion.div>
          ))}
        </div>
      </section>

      <LatestArticles />
      <Footer />
      <BookModal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} />
    </div>
  );
}
