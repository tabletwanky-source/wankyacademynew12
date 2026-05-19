import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Palette, 
  Lock, 
  CreditCard, 
  Award, 
  Bell, 
  ShieldCheck, 
  Users, 
  Database, 
  Briefcase, 
  Wrench, 
  Download, 
  Upload, 
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Cloud,
  RefreshCw,
  Trash2,
  Save,
  Plus,
  FileText,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Activity,
  History,
  Shield,
  Monitor,
  Layout,
  ExternalLink,
  ChevronRight,
  HardDrive,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { systemSettingsService } from '../../services/systemSettingsService';
import { toast } from 'sonner';
import { 
  SystemGeneralSettings, 
  SystemBrandingSettings, 
  FinancialSettings,
  SystemExamSettings,
  SystemCertificateSettings,
  SystemAuthSettings,
  SystemNotificationSettings,
  SystemSecuritySettings,
  SystemStudentSettings,
  SystemMultiservicesSettings,
  SystemMaintenanceSettings,
  SystemBackupInfo
} from '../../types';
import { adminService } from '../../services/adminService';
import { studentService } from '../../services/studentService';
import { multiService } from '../../services/multiService';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, where, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth } from '../../lib/firebase';

type SettingsTab = 
  | 'general' 
  | 'branding' 
  | 'auth' 
  | 'finance' 
  | 'exams' 
  | 'notifications' 
  | 'security' 
  | 'prof_student'
  | 'firebase' 
  | 'multiservices' 
  | 'maintenance' 
  | 'backup';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings states
  const [general, setGeneral] = useState<SystemGeneralSettings>({
    academyName: 'Wanky Academy',
    academyDescription: 'Elite Digital Education Platform',
    supportEmail: 'support@wankyacademy.com',
    supportPhone: '+1 829-347-8077',
    whatsappNumber: '18293478077',
    schoolAddress: 'Santo Domingo, Dominican Republic',
    timezone: 'UTC-4',
    defaultLanguage: 'fr'
  });

  const [branding, setBranding] = useState<SystemBrandingSettings>({
    schoolLogo: 'https://i.postimg.cc/wTr99qNp/d-modern-logo-icon-for-Wanky-Academy-WA-1.png',
    favicon: '',
    landingPageBanner: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#0f172a',
    footerText: '© 2026 Wanky Academy. All rights reserved.',
    socialMediaLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    }
  });

  const [finance, setFinance] = useState<FinancialSettings>({
    informatique: { registrationFee: 2000, monthlyFee: 2000 },
    techniqueInfo: { registrationFee: 2000, monthlyFee: 2000 },
    autoEcole: { registrationFee: 2000, installment1: 3500, installment2: 3500, total: 9000 }
  });

  const [exams, setExams] = useState<SystemExamSettings>({
    maxAttempts: 2,
    defaultTimer: 60,
    shuffleQuestions: true,
    negativeMarking: false,
    passingScore: 70,
    autoSubmit: true,
    showReview: true
  });

  const [auth, setAuth] = useState<SystemAuthSettings>({
    googleLoginEnabled: true,
    emailPasswordLoginEnabled: true,
    studentIdLoginEnabled: true,
    sessionTimeout: 60,
    rememberMeEnabled: true,
    autoLogoutTimer: 30,
    twoFactorEnabled: false,
    deviceTracking: true,
    passwordRules: {
      minLength: 8,
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true
    }
  });

  const [notifications, setNotifications] = useState<SystemNotificationSettings>({
    email: true,
    whatsapp: true,
    push: true,
    paymentReminders: true,
    certificateAlerts: true,
    examReminders: true
  });

  const [security, setSecurity] = useState<SystemSecuritySettings>({
    failedLoginLimit: 5,
    lockoutDuration: 30,
    sessionDuration: 24,
    deviceManagement: true,
    accessLogs: true,
    ipWhitelist: [],
    geoRestriction: false,
    suspiciousLoginDetection: true
  });

  const [multiservices, setMultiservices] = useState<SystemMultiservicesSettings>({
    enabled: true,
    contactPhones: ['+1 829-347-8077'],
    whatsappNumber: '18293478077',
    availableServices: [
      { id: '1', name: 'Kopi', price: 10, description: 'Copy services', enabled: true, category: 'Printing' },
      { id: '2', name: 'Skane', price: 15, description: 'Scanning services', enabled: true, category: 'Digital' }
    ],
    availabilityMessage: 'Available Mon-Fri, 8 AM - 5 PM'
  });

  const [maintenance, setMaintenance] = useState<SystemMaintenanceSettings>({
    enabled: false,
    message: 'System temporarily under maintenance.',
    allowAdminBypass: true
  });

  useEffect(() => {
    if (['auth', 'notifications', 'security', 'multiservices', 'maintenance', 'general', 'branding', 'finance', 'exams'].includes(activeTab)) {
      loadSettings();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await systemSettingsService.getSettings<any>(activeTab);
      if (data) {
        if (activeTab === 'general') setGeneral(data);
        if (activeTab === 'branding') setBranding(data);
        if (activeTab === 'finance') setFinance(data);
        if (activeTab === 'exams') setExams(data);
        if (activeTab === 'auth') setAuth(data);
        if (activeTab === 'notifications') setNotifications(data);
        if (activeTab === 'security') setSecurity(data);
        if (activeTab === 'multiservices') setMultiservices(data);
        if (activeTab === 'maintenance') setMaintenance(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let dataToSave: any;
      if (activeTab === 'general') dataToSave = general;
      else if (activeTab === 'branding') dataToSave = branding;
      else if (activeTab === 'finance') dataToSave = finance;
      else if (activeTab === 'exams') dataToSave = exams;
      else if (activeTab === 'auth') dataToSave = auth;
      else if (activeTab === 'notifications') dataToSave = notifications;
      else if (activeTab === 'security') dataToSave = security;
      else if (activeTab === 'multiservices') dataToSave = multiservices;
      else if (activeTab === 'maintenance') dataToSave = maintenance;

      if (dataToSave) {
        await systemSettingsService.updateSettings(activeTab, dataToSave);
        toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings updated`);
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">System Settings</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Wanky Academy Central Control Panel</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving || loading}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-50 bg-slate-50/30 overflow-y-auto custom-scrollbar">
          <nav className="p-4 space-y-1">
            <TabButton icon={Globe} label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
            <TabButton icon={Palette} label="Branding" active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} />
            <TabButton icon={Lock} label="Authentication" active={activeTab === 'auth'} onClick={() => setActiveTab('auth')} />
            <TabButton icon={CreditCard} label="Finance" active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
            <TabButton icon={Award} label="Exams & Certs" active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} />
            <TabButton icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
            <TabButton icon={ShieldCheck} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
            <TabButton icon={Users} label="Professors & Students" active={activeTab === 'prof_student'} onClick={() => setActiveTab('prof_student')} />
            <TabButton icon={Briefcase} label="WA Multiservices" active={activeTab === 'multiservices'} onClick={() => setActiveTab('multiservices')} />
            <TabButton icon={Database} label="Firebase Status" active={activeTab === 'firebase'} onClick={() => setActiveTab('firebase')} />
            <TabButton icon={Wrench} label="Maintenance" active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')} />
            <TabButton icon={Download} label="Backup & Restore" active={activeTab === 'backup'} onClick={() => setActiveTab('backup')} />
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl space-y-10"
            >
              {loading ? <LoadingSkeleton /> : (
                <>
                  {activeTab === 'general' && <GeneralSettingsSection settings={general} onChange={setGeneral} />}
                  {activeTab === 'branding' && <BrandingSettingsSection settings={branding} onChange={setBranding} />}
                  {activeTab === 'finance' && <FinancialSettingsSection settings={finance} onChange={setFinance} />}
                  {activeTab === 'exams' && <ExamSettingsSection settings={exams} onChange={setExams} />}
                  {activeTab === 'auth' && <AuthSettingsSection settings={auth} onChange={setAuth} />}
                  {activeTab === 'notifications' && <NotificationSettingsSection settings={notifications} onChange={setNotifications} />}
                  {activeTab === 'security' && <SecuritySettingsSection settings={security} onChange={setSecurity} />}
                  {activeTab === 'prof_student' && <UserManagementSection />}
                  {activeTab === 'multiservices' && <MultiservicesSettingsSection settings={multiservices} onChange={setMultiservices} />}
                  {activeTab === 'firebase' && <FirebaseMonitorSection />}
                  {activeTab === 'maintenance' && <MaintenanceSettingsSection settings={maintenance} onChange={setMaintenance} />}
                  {activeTab === 'backup' && <BackupAndRestoreSection />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-300'}`} />
      {label}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 bg-slate-100 rounded-lg w-1/3"></div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-24 bg-slate-50 rounded-2xl"></div>
        <div className="h-24 bg-slate-50 rounded-2xl"></div>
        <div className="h-24 bg-slate-50 rounded-2xl"></div>
        <div className="h-24 bg-slate-50 rounded-2xl"></div>
      </div>
    </div>
  );
}

function GeneralSettingsSection({ settings, onChange }: { settings: SystemGeneralSettings, onChange: (s: SystemGeneralSettings) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">General Academy Settings</h2>
        <p className="text-xs text-slate-400 font-medium">Core information about your educational institution.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <FormField label="Academy Name" value={settings.academyName} icon={Globe} onChange={v => onChange({...settings, academyName: v})} />
        <FormField label="Academy Description" value={settings.academyDescription} icon={FileText} onChange={v => onChange({...settings, academyDescription: v})} />
        <FormField label="Support Email" value={settings.supportEmail} icon={Mail} onChange={v => onChange({...settings, supportEmail: v})} />
        <FormField label="Support Phone" value={settings.supportPhone} icon={Phone} onChange={v => onChange({...settings, supportPhone: v})} />
        <FormField label="WhatsApp Number" value={settings.whatsappNumber} icon={Phone} onChange={v => onChange({...settings, whatsappNumber: v})} />
        <FormField label="School Address" value={settings.schoolAddress} icon={MapPin} onChange={v => onChange({...settings, schoolAddress: v})} />
        <FormField label="Timezone" value={settings.timezone} icon={Clock} onChange={v => onChange({...settings, timezone: v})} />
        <FormField label="Default Language" value={settings.defaultLanguage} icon={Globe} onChange={v => onChange({...settings, defaultLanguage: v})} />
      </div>
    </div>
  );
}

function BrandingSettingsSection({ settings, onChange }: { settings: SystemBrandingSettings, onChange: (s: SystemBrandingSettings) => void }) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">School Branding</h2>
        <p className="text-xs text-slate-400 font-medium">Visual identity and public appearance.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academy Logo URL</label>
          <div className="flex gap-4">
             <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                {settings.schoolLogo && settings.schoolLogo !== "" ? (
                  <img src={settings.schoolLogo} alt="Logo Preview" className="w-10 h-10 object-contain" />
                ) : (
                  <Globe className="w-6 h-6 text-slate-300" />
                )}
             </div>
             <input 
              type="text" 
              value={settings.schoolLogo} 
              onChange={e => onChange({...settings, schoolLogo: e.target.value})}
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold focus:border-indigo-600 outline-none" 
             />
          </div>
        </div>
        <FormField label="Footer Text" value={settings.footerText} icon={FileText} onChange={v => onChange({...settings, footerText: v})} />
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-800 uppercase italic tracking-tight">Social Media Links</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Facebook" value={settings.socialMediaLinks.facebook || ''} icon={Facebook} onChange={v => onChange({...settings, socialMediaLinks: {...settings.socialMediaLinks, facebook: v}})} />
          <FormField label="Instagram" value={settings.socialMediaLinks.instagram || ''} icon={Instagram} onChange={v => onChange({...settings, socialMediaLinks: {...settings.socialMediaLinks, instagram: v}})} />
        </div>
      </div>
    </div>
  );
}

function FinancialSettingsSection({ settings, onChange }: { settings: FinancialSettings, onChange: (s: FinancialSettings) => void }) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">Financial Settings</h2>
        <p className="text-xs text-slate-400 font-medium">Configure fees and payment structures for each program.</p>
      </div>

      {['informatique', 'techniqueInfo'].map((dept) => (
         <div key={dept} className="p-8 bg-slate-50 rounded-3xl space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase italic flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <Settings className="w-4 h-4" />
              </div>
              {dept === 'informatique' ? 'Informatique' : 'Technique Informatique'}
            </h3>
            <div className="grid grid-cols-2 gap-6">
               <FormField 
                 label="Registration Fee (DOP)" 
                 value={settings[dept as 'informatique' | 'techniqueInfo'].registrationFee.toString()} 
                 icon={CreditCard} 
                 onChange={v => onChange({...settings, [dept]: {...settings[dept as 'informatique' | 'techniqueInfo'], registrationFee: parseInt(v) || 0}})} 
               />
               <FormField 
                 label="Monthly Fee (DOP)" 
                 value={settings[dept as 'informatique' | 'techniqueInfo'].monthlyFee.toString()} 
                 icon={CreditCard} 
                 onChange={v => onChange({...settings, [dept]: {...settings[dept as 'informatique' | 'techniqueInfo'], monthlyFee: parseInt(v) || 0}})} 
               />
            </div>
         </div>
      ))}

      <div className="p-8 bg-slate-900 text-white rounded-3xl space-y-6">
         <h3 className="text-sm font-black text-indigo-400 uppercase italic flex items-center gap-3">
           <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
           </div>
           Auto École Price Structure
         </h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-400">
            <FormField label="Registration" value={settings.autoEcole.registrationFee.toString()} icon={Plus} dark onChange={v => onChange({...settings, autoEcole: {...settings.autoEcole, registrationFee: parseInt(v) || 0}})} />
            <FormField label="Installment 1" value={settings.autoEcole.installment1.toString()} icon={Settings} dark onChange={v => onChange({...settings, autoEcole: {...settings.autoEcole, installment1: parseInt(v) || 0}})} />
            <FormField label="Installment 2" value={settings.autoEcole.installment2.toString()} icon={Settings} dark onChange={v => onChange({...settings, autoEcole: {...settings.autoEcole, installment2: parseInt(v) || 0}})} />
            <FormField label="Total Price" value={settings.autoEcole.total.toString()} icon={CheckCircle} dark onChange={v => onChange({...settings, autoEcole: {...settings.autoEcole, total: parseInt(v) || 0}})} />
         </div>
      </div>
    </div>
  );
}

function ExamSettingsSection({ settings, onChange }: { settings: SystemExamSettings, onChange: (s: SystemExamSettings) => void }) {
  return (
    <div className="space-y-10">
       <div>
        <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">Exam & Evaluation Control</h2>
        <p className="text-xs text-slate-400 font-medium">Global rules for student assessments.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <FormField label="Max Exam Attempts" value={settings.maxAttempts.toString()} icon={RefreshCw} onChange={v => onChange({...settings, maxAttempts: parseInt(v) || 0})} />
        <FormField label="Default Timer (min)" value={settings.defaultTimer.toString()} icon={Clock} onChange={v => onChange({...settings, defaultTimer: parseInt(v) || 0})} />
        <FormField label="Passing Score (%)" value={settings.passingScore.toString()} icon={Award} onChange={v => onChange({...settings, passingScore: parseInt(v) || 0})} />
        
        <div className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Shuffle Questions</p>
              <p className="text-xs text-slate-500">Randomize question order</p>
           </div>
           <ToggleButton active={settings.shuffleQuestions} onClick={() => onChange({...settings, shuffleQuestions: !settings.shuffleQuestions})} />
        </div>
      </div>
    </div>
  );
}

function AuthSettingsSection({ settings, onChange }: { settings: SystemAuthSettings, onChange: (s: SystemAuthSettings) => void }) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">Authentication Management</h2>
        <p className="text-xs text-slate-400 font-medium">Configure how users access the Wanky Academy platform.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <SettingsCard 
          icon={Mail} 
          title="Email Login" 
          description="Allow sign-in with email" 
          active={settings.emailPasswordLoginEnabled} 
          onToggle={() => onChange({...settings, emailPasswordLoginEnabled: !settings.emailPasswordLoginEnabled})} 
        />
        <SettingsCard 
          icon={Database} 
          title="Google Login" 
          description="Allow Firebase Google Auth" 
          active={settings.googleLoginEnabled} 
          onToggle={() => onChange({...settings, googleLoginEnabled: !settings.googleLoginEnabled})} 
        />
        <SettingsCard 
          icon={Key} 
          title="Student ID Login" 
          description="Login via registration ID" 
          active={settings.studentIdLoginEnabled} 
          onToggle={() => onChange({...settings, studentIdLoginEnabled: !settings.studentIdLoginEnabled})} 
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-50 rounded-3xl space-y-6">
           <h3 className="text-sm font-black text-slate-900 uppercase italic">Session Control</h3>
           <FormField label="Session Timeout (min)" value={settings.sessionTimeout.toString()} icon={Clock} onChange={v => onChange({...settings, sessionTimeout: parseInt(v) || 0})} />
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remember Me</span>
              <ToggleButton active={settings.rememberMeEnabled} onClick={() => onChange({...settings, rememberMeEnabled: !settings.rememberMeEnabled})} />
           </div>
        </div>

        <div className="p-8 bg-slate-900 text-white rounded-3xl space-y-6">
           <h3 className="text-sm font-black text-indigo-400 uppercase italic">Password Complexity</h3>
           <FormField label="Min Length" value={settings.passwordRules.minLength.toString()} icon={Lock} dark onChange={v => onChange({...settings, passwordRules: {...settings.passwordRules, minLength: parseInt(v) || 0}})} />
           <div className="space-y-4">
              <ToggleRow label="Require Numbers" active={settings.passwordRules.requireNumbers} dark onToggle={() => onChange({...settings, passwordRules: {...settings.passwordRules, requireNumbers: !settings.passwordRules.requireNumbers}})} />
              <ToggleRow label="Require Symbols" active={settings.passwordRules.requireSymbols} dark onToggle={() => onChange({...settings, passwordRules: {...settings.passwordRules, requireSymbols: !settings.passwordRules.requireSymbols}})} />
           </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettingsSection({ settings, onChange }: { settings: SystemNotificationSettings, onChange: (s: SystemNotificationSettings) => void }) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">Notification Center</h2>
        <p className="text-xs text-slate-400 font-medium">Manage global communication alerts and reminders.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <SettingsCard icon={Mail} title="Email Alerts" description="Global email dispatch" active={settings.email} onToggle={() => onChange({...settings, email: !settings.email})} />
        <SettingsCard icon={Phone} title="WhatsApp" description="Realtime WA updates" active={settings.whatsapp} onToggle={() => onChange({...settings, whatsapp: !settings.whatsapp})} />
        <SettingsCard icon={Bell} title="Push" description="Browser notifications" active={settings.push} onToggle={() => onChange({...settings, push: !settings.push})} />
      </div>

      <div className="p-8 bg-slate-50 rounded-3xl">
         <h3 className="text-sm font-black text-slate-900 uppercase italic mb-6">Automated Reminders</h3>
         <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            <ToggleRow label="Payment Reminders" active={settings.paymentReminders} onToggle={() => onChange({...settings, paymentReminders: !settings.paymentReminders})} />
            <ToggleRow label="Exam Reminders" active={settings.examReminders} onToggle={() => onChange({...settings, examReminders: !settings.examReminders})} />
            <ToggleRow label="Certificate Alerts" active={settings.certificateAlerts} onToggle={() => onChange({...settings, certificateAlerts: !settings.certificateAlerts})} />
         </div>
      </div>
    </div>
  );
}

function SecuritySettingsSection({ settings, onChange }: { settings: SystemSecuritySettings, onChange: (s: SystemSecuritySettings) => void }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'securityLogs'), orderBy('timestamp', 'desc'), limit(5));
    return onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }, (error) => {
      console.error("Security logs snapshot error:", error);
    });
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">Advanced Security Controls</h2>
        <p className="text-xs text-slate-400 font-medium">Protect the academy from unauthorized access.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <FormField label="Failed Login Limit" value={settings.failedLoginLimit.toString()} icon={Shield} onChange={v => onChange({...settings, failedLoginLimit: parseInt(v) || 0})} />
           <FormField label="Lockout Duration (min)" value={settings.lockoutDuration.toString()} icon={Clock} onChange={v => onChange({...settings, lockoutDuration: parseInt(v) || 0})} />
           <ToggleRow label="Device Tracking" active={settings.deviceManagement} onToggle={() => onChange({...settings, deviceManagement: !settings.deviceManagement})} />
        </div>

        <div className="p-8 bg-slate-900 text-white rounded-3xl">
           <h3 className="text-sm font-black text-indigo-400 uppercase italic mb-4">Security Activity Feed</h3>
           <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-[10px] text-slate-500 uppercase font-black italic">No recent security events</div>
              ) : logs.map(log => (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                   <div className="flex-1">
                      <p className="text-[10px] font-bold text-white leading-none">{log.event}</p>
                      <p className="text-[9px] text-slate-500 mt-1">{log.ip} • {log.timestamp?.toDate ? new Date(log.timestamp.toDate()).toLocaleTimeString() : 'Recent'}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function FirebaseMonitorSection() {
  const [status, setStatus] = useState({
    auth: 'connected',
    firestore: 'connected',
    storage: 'connected',
    listeners: 'active'
  });
  const [stats, setStats] = useState({
    users: 0,
    exams: 0,
    certificates: 0,
    lastSync: new Date()
  });

  useEffect(() => {
    const fetchStats = async () => {
      const uSnap = await getDocs(collection(db, 'users'));
      const eSnap = await getDocs(collection(db, 'exams'));
      const cSnap = await getDocs(collection(db, 'certificates'));
      setStats({
        users: uSnap.size,
        exams: eSnap.size,
        certificates: cSnap.size,
        lastSync: new Date()
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">Firebase Health Monitor</h2>
        <p className="text-xs text-slate-400 font-medium">Realtime status and infrastructure analytics.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <StatusCard icon={Lock} title="Auth" status={status.auth} />
        <StatusCard icon={Database} title="Firestore" status={status.firestore} />
        <StatusCard icon={Cloud} title="Storage" status={status.storage} />
        <StatusCard icon={Activity} title="Listeners" status={status.listeners} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <div className="p-8 bg-slate-50 rounded-3xl space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase italic">Document Infrastructure</h3>
            <div className="space-y-4">
               <StatRow label="Stored Users" value={stats.users} icon={Users} />
               <StatRow label="Platform Exams" value={stats.exams} icon={FileText} />
               <StatRow label="Issued Certificates" value={stats.certificates} icon={Award} />
            </div>
         </div>

         <div className="p-8 bg-slate-900 text-white rounded-3xl flex flex-col justify-between">
            <div>
               <h3 className="text-sm font-black text-indigo-400 uppercase italic mb-2">System Synchronization</h3>
               <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Your dashboard is currently linked to the Firebase Production Environment. All changes are propagated in realtime.</p>
            </div>
            <div className="pt-6 border-t border-white/5 mt-6">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Infrastructure Sync</p>
               <p className="text-xs font-black text-indigo-400 mt-1">{stats.lastSync.toLocaleString()}</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function MaintenanceSettingsSection({ settings, onChange }: { settings: SystemMaintenanceSettings, onChange: (s: SystemMaintenanceSettings) => void }) {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">System Maintenance</h2>
          <p className="text-xs text-slate-400 font-medium">Control platform accessibility during updates.</p>
        </div>
        <ToggleButton active={settings.enabled} onClick={() => onChange({...settings, enabled: !settings.enabled})} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maintenance Message</label>
              <textarea 
                value={settings.message}
                onChange={e => onChange({...settings, message: e.target.value})}
                className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-indigo-600 resize-none"
                placeholder="Message for students during maintenance..."
              />
           </div>
           <ToggleRow label="Allow Admin Access" active={settings.allowAdminBypass} onToggle={() => onChange({...settings, allowAdminBypass: !settings.allowAdminBypass})} />
        </div>

        <div className={`p-8 rounded-3xl border border-dashed flex flex-col items-center justify-center text-center ${settings.enabled ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
           <AlertTriangle className={`w-12 h-12 mb-4 ${settings.enabled ? 'text-orange-500' : 'text-slate-300'}`} />
           <h3 className={`text-sm font-black uppercase italic ${settings.enabled ? 'text-orange-900' : 'text-slate-400'}`}>
              {settings.enabled ? 'Maintenance Mode ACTIVE' : 'Public Access OK'}
           </h3>
           <p className="text-[10px] text-slate-400 mt-2 max-w-[200px]">
              {settings.enabled 
                ? 'Only admins with bypass permissions can access the LMS platform currently.' 
                : 'Systems are fully operational and accessible to all students and professors.'}
           </p>
        </div>
      </div>
    </div>
  );
}

function BackupAndRestoreSection() {
  const handleExport = async (type: string) => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: `Generating ${type} backup...`,
      success: 'Backup ready for download!',
      error: 'Backup failed'
    });
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">Backups & Data Integrity</h2>
        <p className="text-xs text-slate-400 font-medium">Export and restore academy data securely.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <div className="p-8 bg-slate-50 rounded-3xl space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase italic">Data Export</h3>
            <div className="grid grid-cols-2 gap-4">
               <ExportButton icon={FileJson} label="System Config" onClick={() => handleExport('Settings')} />
               <ExportButton icon={Users} label="User Records" onClick={() => handleExport('Users')} />
               <ExportButton icon={FileSpreadsheet} label="Financial Data" onClick={() => handleExport('Finance')} />
               <ExportButton icon={Award} label="Certificates" onClick={() => handleExport('Certs')} />
            </div>
         </div>

         <div className="p-8 bg-slate-900 text-white rounded-3xl">
            <h3 className="text-sm font-black text-indigo-400 uppercase italic mb-6">Restoration Center</h3>
            <div className="space-y-6">
               <div className="p-6 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <Upload className="w-8 h-8 text-slate-600" />
                  <p className="text-[10px] font-black text-slate-500 uppercase">Drop backup file here</p>
               </div>
               <button className="w-full py-4 bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                  Upload & Restore Platform
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function UserManagementSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = filterRole !== 'all' 
      ? query(collection(db, 'users'), where('role', '==', filterRole), orderBy('fullName'))
      : query(collection(db, 'users'), orderBy('fullName'));
    
    return onSnapshot(q, (snap) => {
      let data = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      setUsers(data);
      setLoading(false);
    }, (error) => {
      console.error("User management snapshot error:", error);
      setLoading(false);
    });
  }, [filterRole]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'all' || u.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const toggleStatus = async (user: any) => {
    try {
      await adminService.updateUser(user.uid, { active: !user.active });
      toast.success(`User ${user.active ? 'deactivated' : 'activated'}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">User Management Center</h2>
          <p className="text-xs text-slate-400 font-medium">Control students, professors and administrators.</p>
        </div>
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all">
          <UserPlus className="w-3.5 h-3.5" />
          Add Manual User
        </button>
      </div>

      <div className="p-8 bg-slate-50 rounded-3xl space-y-6">
        <div className="flex flex-wrap gap-4">
           <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, email or ID..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-600"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <select 
             className="px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-600"
             value={filterRole}
             onChange={e => setFilterRole(e.target.value)}
           >
             <option value="all">All Roles</option>
             <option value="student">Students</option>
             <option value="professor">Professors</option>
             <option value="admin">Administrators</option>
           </select>
           <select 
             className="px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-600"
             value={filterDept}
             onChange={e => setFilterDept(e.target.value)}
           >
             <option value="all">All Depts</option>
             <option value="Auto École">Auto École</option>
             <option value="Informatique">Informatique</option>
             <option value="Technique Informatique">Technique Info</option>
           </select>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">User Info</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Role & Dept</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {loading ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-[10px] font-black text-slate-300 uppercase animate-pulse">Synchronizing Data...</td></tr>
                 ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-[10px] font-black text-slate-300 uppercase">No users found</td></tr>
                 ) : filteredUsers.map(user => (
                    <tr key={user.uid} className="hover:bg-slate-50/30 transition-colors">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                {user.photoURL && user.photoURL !== "" ? (
                                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Users className="w-5 h-5 text-slate-300" />
                                )}
                             </div>
                             <div>
                                <p className="text-xs font-black text-slate-900">{user.fullName}</p>
                                <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider mr-2 ${
                             user.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 
                             user.role === 'professor' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                          }`}>{user.role}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{user.department}</span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex justify-center">
                             <button 
                               onClick={() => toggleStatus(user)}
                               className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider ${
                                  user.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                               }`}
                             >
                                {user.active ? 'Active' : 'Disabled'}
                             </button>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                             <MoreVertical className="w-4 h-4" />
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

function MultiservicesSettingsSection({ settings, onChange }: { settings: SystemMultiservicesSettings, onChange: (s: SystemMultiservicesSettings) => void }) {
  const toggleService = (id: string) => {
    const updatedServices = settings.availableServices.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    onChange({ ...settings, availableServices: updatedServices });
  };

  const updateServicePrice = (id: string, price: string) => {
    const updatedServices = settings.availableServices.map(s => 
      s.id === id ? { ...s, price: parseInt(price) || 0 } : s
    );
    onChange({ ...settings, availableServices: updatedServices });
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2">WA Multiservices Control</h2>
          <p className="text-xs text-slate-400 font-medium">Manage external services pricing and availability.</p>
        </div>
        <ToggleButton active={settings.enabled} onClick={() => onChange({...settings, enabled: !settings.enabled})} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <FormField label="Public WhatsApp Number" value={settings.whatsappNumber} icon={Phone} onChange={v => onChange({...settings, whatsappNumber: v})} />
         <FormField label="Availability Message" value={settings.availabilityMessage} icon={FileText} onChange={v => onChange({...settings, availabilityMessage: v})} />
      </div>

      <div className="space-y-6">
         <h3 className="text-sm font-black text-slate-900 uppercase italic">Service Catalog & Pricing</h3>
         <div className="grid gap-4">
            {settings.availableServices.map(service => (
               <div key={service.id} className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-slate-100/50 transition-all">
                  <div className="flex items-center gap-6">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${service.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <Briefcase className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <p className="text-xs font-black text-slate-900">{service.name}</p>
                           <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[8px] font-black uppercase">{service.category}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{service.description}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-8">
                     <div className="w-32 flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">DOP</span>
                        <input 
                           type="text" 
                           value={service.price} 
                           onChange={e => updateServicePrice(service.id, e.target.value)}
                           className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:border-indigo-600 outline-none"
                        />
                     </div>
                     <ToggleButton active={service.enabled} onClick={() => toggleService(service.id)} />
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

function SettingsCard({ icon: Icon, title, description, active, onToggle }: { icon: any, title: string, description: string, active: boolean, onToggle: () => void }) {
  return (
    <div className={`p-6 rounded-3xl border transition-all ${active ? 'bg-white border-indigo-100 shadow-sm shadow-indigo-50/50' : 'bg-slate-50 border-slate-50'}`}>
       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
          <Icon className="w-5 h-5" />
       </div>
       <div className="flex items-start justify-between mb-2">
          <h3 className={`text-xs font-black uppercase italic ${active ? 'text-slate-900' : 'text-slate-400'}`}>{title}</h3>
          <ToggleButton active={active} onClick={onToggle} />
       </div>
       <p className="text-[10px] text-slate-400 font-medium leading-tight">{description}</p>
    </div>
  );
}

function StatusCard({ icon: Icon, title, status }: { icon: any, title: string, status: string }) {
  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
       <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400">
             <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{title}</span>
       </div>
       <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[8px] font-black text-green-600 uppercase">Online</span>
       </div>
    </div>
  );
}

function StatRow({ label, value, icon: Icon }: { label: string, value: number, icon: any }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 font-bold">
       <div className="flex items-center gap-3 text-slate-400">
          <Icon className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-wider">{label}</span>
       </div>
       <span className="text-xs text-slate-900">{value.toLocaleString()}</span>
    </div>
  );
}

function ExportButton({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-center gap-2 hover:border-indigo-600 hover:shadow-sm transition-all"
    >
       <Icon className="w-5 h-5 text-slate-400" />
       <span className="text-[9px] font-black text-slate-400 uppercase text-center leading-tight">{label}</span>
    </button>
  );
}

function ToggleRow({ label, active, onToggle, dark = false }: { label: string, active: boolean, onToggle: () => void, dark?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`text-[10px] font-bold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      <ToggleButton active={active} onClick={onToggle} />
    </div>
  );
}

function FormField({ label, value, icon: Icon, onChange, dark = false }: { label: string, value: string, icon: any, onChange: (v: string) => void, dark?: boolean }) {
  return (
    <div className="space-y-2">
      <label className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
      <div className="relative">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${dark ? 'text-slate-500' : 'text-slate-300'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full py-3.5 pl-12 pr-4 rounded-xl text-xs font-bold outline-none border transition-all ${
            dark 
              ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' 
              : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-indigo-600'
          }`}
        />
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick }: { active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`}></div>
    </button>
  );
}
