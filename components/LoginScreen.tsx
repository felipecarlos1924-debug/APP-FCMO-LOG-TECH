import React, { useState } from 'react';
import { User } from '../types';
import { Truck, Lock, User as UserIcon, ArrowRight, Mail, KeyRound, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [step, setStep] = useState<'login' | 'verification'>('login');
  const [inputUser, setInputUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [tempUser, setTempUser] = useState<User | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Find user
    const user = users.find(u => 
      u.email.toLowerCase() === inputUser.toLowerCase() || 
      u.name.toLowerCase() === inputUser.toLowerCase()
    );
    
    // Check password case-insensitively
    if (user && user.password && user.password.toLowerCase() === password.toLowerCase()) {
      if (user.isActive) {
        onLogin(user);
      } else {
        setTempUser(user);
        setStep('verification');
        alert(`Um código de verificação foi enviado para ${user.email}. (Use 123456 para teste)`);
      }
    } else {
      setError('Usuário ou senha inválidos');
    }
  };

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === '123456') {
       if (tempUser) {
         const activatedUser = { ...tempUser, isActive: true };
         onLogin(activatedUser);
       }
    } else {
      setError('Código inválido. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header de Login */}
        <div className="bg-blue-600 p-8 text-center shrink-0">
          <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-4 shadow-inner">
            <Truck size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter leading-none uppercase">FCMO<span className="opacity-60 font-light">LOG</span></h1>
          <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.2em] mt-2">Logistics Intelligence</p>
        </div>

        <div className="p-8">
          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Usuário / E-mail</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <UserIcon size={20} />
                  </div>
                  <input 
                    type="text"
                    placeholder="Seu e-mail ou nome"
                    autoComplete="username"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-400"
                    value={inputUser}
                    onChange={(e) => {
                      setInputUser(e.target.value);
                      setError('');
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Senha de Acesso</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha secreta"
                    autoComplete="current-password"
                    required
                    className="w-full pl-12 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1 active:scale-90"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm py-3 px-4 rounded-2xl font-black text-center animate-pulse">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group active:scale-[0.96] shadow-xl shadow-slate-900/10"
              >
                ENTRAR NO SISTEMA
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerification} className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-100">
                  <Mail size={36} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Verificação de Segurança</h3>
                <p className="text-sm text-slate-500 mt-2 px-4 leading-relaxed">
                  Enviamos o código de 6 dígitos para o e-mail <strong>{tempUser?.email}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 text-center">Código Enviado</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound size={20} />
                  </div>
                  <input 
                    type="text"
                    inputMode="numeric"
                    placeholder="0 0 0 0 0 0"
                    maxLength={6}
                    required
                    className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-[0.5em] text-3xl font-black text-slate-900"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm py-3 px-4 rounded-2xl font-black text-center">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 active:scale-[0.96] shadow-xl shadow-green-900/10"
              >
                VERIFICAR ACESSO
              </button>
              
              <button 
                type="button"
                onClick={() => setStep('login')}
                className="w-full text-slate-400 py-2 text-sm hover:text-slate-600 font-black uppercase tracking-widest transition-colors"
              >
                Voltar ao Início
              </button>
            </form>
          )}

          <div className="mt-10 text-center text-[10px] text-slate-300 uppercase tracking-[0.3em] font-black">
            <p>© 2024 FCMO LOG TECH • v2.4.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};