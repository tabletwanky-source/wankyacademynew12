import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { uploadImage } from '../../utils/upload';
import { motion } from 'motion/react';
import { 
  User, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  ShieldCheck, 
  Lock, 
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudentProfile() {
  const { studentData, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    emergencyContact: '',
    photoURL: ''
  });
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (studentData) {
      setFormData({
        fullName: studentData.fullName || '',
        phone: studentData.phone || '',
        address: studentData.address || '',
        emergencyContact: (studentData as any).emergencyContact || '',
        photoURL: studentData.photoURL || ''
      });
    }
  }, [studentData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const path = `profile-photos/${user.uid}/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, path);
      setFormData(prev => ({ ...prev, photoURL: url }));
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await studentService.updateStudentProfile(
        user.uid, 
        formData, 
        passwords.newPassword || undefined
      );
      toast.success('Profile updated successfully');
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!studentData) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase italic">Student Profile</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage your identity and security</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
           <ShieldCheck className="w-5 h-5 text-indigo-600" />
           <div className="leading-tight">
             <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Student ID</p>
             <p className="text-xs font-mono font-bold text-slate-700">{studentData.studentId}</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-12 gap-8">
        {/* Left Column: Photo & Static Info */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
             <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-50 overflow-hidden bg-slate-100">
                  <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors active:scale-95">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
             </div>
             <h2 className="mt-4 font-black text-slate-800 italic">{studentData.fullName}</h2>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{studentData.department}</p>
             
             <div className="w-full mt-6 pt-6 border-t border-slate-50 space-y-3">
               <div className="flex justify-between items-center text-[10px] group">
                  <span className="text-slate-400 font-bold uppercase">Status</span>
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase">Active</span>
               </div>
               <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Role</span>
                  <span className="text-slate-600 font-black uppercase">Student</span>
               </div>
             </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex gap-4">
             <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0" />
             <p className="text-xs font-bold text-emerald-800 leading-relaxed">
               Security Note: Your Student ID and Department are managed by the administration and cannot be edited.
             </p>
          </div>
        </div>

        {/* Right Column: Editable Info */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] italic flex items-center gap-3">
              <User className="w-4 h-4 text-indigo-600" />
              Information Personnelle
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Permanent Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Emergency Contact (Name/Phone)</label>
              <input 
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] italic flex items-center gap-3">
              <Lock className="w-4 h-4 text-indigo-600" />
              Sécurité du Compte
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">New Password</label>
                <input 
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirm Password</label>
                <input 
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] italic shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Profile Changes
          </button>
        </div>
      </form>
    </motion.div>
  );
}
