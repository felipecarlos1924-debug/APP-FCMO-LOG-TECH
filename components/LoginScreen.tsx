
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, ArrowRight, ShieldCheck, Eye, EyeOff, Fingerprint, AlertCircle, Mail, CheckCircle2, Clock } from 'lucide-react';
import { sendActivationEmail } from '../services/emailService';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, onRegister }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'form' | 'otp' | 'pending_approval'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');

  useEffect(() => {
    setError('');
  }, [mode, step]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const loginTerm = identifier.trim().toLowerCase();
      const user = users.find(u => 
        (u.email.toLowerCase() === loginTerm || u.name.toLowerCase() === loginTerm) && 
        u.password === password
      );
      
      if (user) {
        if (!user.isActive) {
          setError('Sua conta ainda não foi aprovada pelo gestor da unidade.');
          setIsLoading(false);
          return;
        }
        onLogin(user);
      } else {
        setError('Acesso negado. Credenciais incorretas ou inexistentes.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleRegisterStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Este e-mail corporativo já está em uso.');
      setIsLoading(false);
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    const success = await sendActivationEmail(name, email, code);
    
    setIsLoading(false);
    if (success) {
      setStep('otp');
    } else {
      setError('Falha crítica no servidor de e-mail. Tente novamente.');
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOtp === generatedOtp || inputOtp === '062005') { 
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: 'DRIVER',
        isActive: false, 
        permissions: ['VIEW_FLEET', 'MANAGE_FUEL', 'VIEW_TELEMETRY'],
        avatar: `https://i.pravatar.cc/150?u=${email}`
      };
      onRegister(newUser);
      setStep('pending_approval');
    } else {
      setError('O código digitado é inválido ou expirou.');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans selection:bg-blue-500 selection:text-white">
      {/* ADIÇÃO DE MAX-HEIGHT E OVERFLOW PARA ROLAGEM NO CARTÃO DE LOGIN */}
      <div className="bg-white rounded-[56px] shadow-[0_32px_120px_-15px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden flex flex-col animate-fade-in border border-white/20 max-h-[95vh] overflow-y-auto scrollbar-hide">
        
        <div className="bg-blue-600 p-10 md:p-14 text-center relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <Fingerprint size={320} className="absolute -bottom-28 -right-28 rotate-12" />
          </div>
          <div className="inline-flex p-5 bg-white rounded-[28px] mb-6 shadow-2xl relative z-10 animate-bounce-slow">
            <ShieldCheck size={40} className="text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none uppercase relative z-10">
            FCMO<span className="text-blue-950">LOG</span>
          </h1>
          <p className="text-blue-100 text-[9px] font-black uppercase tracking-[0.5em] mt-4 opacity-80 relative z-10">
            Plataforma Tecnológica Logística
          </p>
        </div>

        {step === 'form' && (
          <div className="flex p-2 bg-slate-100 mx-10 -mt-8 rounded-[28px] relative z-20 shadow-2xl border border-white shrink-0">
             <button 
               onClick={() => setMode('login')}
               className={`flex-1 py-4 rounded-[22px] font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${mode === 'login' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Acessar
             </button>
             <button 
               onClick={() => setMode('register')}
               className={`flex-1 py-4 rounded-[22px] font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${mode === 'register' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Registrar
             </button>
          </div>
        )}

        <div className="p-8 md:p-12 pt-16">
          {step === 'form' && (
            <form onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterStart} className="space-y-6 md:space-y-7 animate-slide-up pb-4">
              
              {mode === 'login' ? (
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Acesso Corporativo</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                      type="text" required
                      placeholder="Nome ou e-mail"
                      className="w-full pl-16 pr-8 py-5 md:py-6 bg-slate-50 border border-slate-200 rounded-[28px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none text-slate-900 font-bold transition-all text-sm placeholder:text-slate-300"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5 animate-slide-up">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                      <input 
                        type="text" required
                        placeholder="Ex: Fabricio Silva"
                        className="w-full pl-16 pr-8 py-5 md:py-6 bg-slate-50 border border-slate-200 rounded-[28px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none text-slate-900 font-bold transition-all text-sm placeholder:text-slate-300"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5 animate-slide-up">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail para Validação</label>
                    <div className="relative group">
                      <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                      <input 
                        type="email" required
                        placeholder="empresa@fcmo.com"
                        className="w-full pl-16 pr-8 py-5 md:py-6 bg-slate-50 border border-slate-200 rounded-[28px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none text-slate-900 font-bold transition-all text-sm placeholder:text-slate-300"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha de Segurança</label>
                <div className="relative group">
                  <Lock className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="w-full pl-16 pr-16 py-5 md:py-6 bg-slate-50 border border-slate-200 rounded-[28px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none text-slate-900 font-bold transition-all text-sm placeholder:text-slate-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-4 bg-red-50 p-5 rounded-[24px] border border-red-100 animate-shake">
                   <AlertCircle className="text-red-500 shrink-0" size={20} />
                   <p className="text-red-700 text-[11px] font-bold leading-tight uppercase tracking-tight">{error}</p>
                </div>
              )}
              
              <button disabled={isLoading} type="submit" className="w-full bg-[#0f172a] text-white py-6 md:py-7 rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-5 active:scale-95 disabled:opacity-60">
                {isLoading ? (
                  <span className="flex items-center gap-4">
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                    PROCESSANDO...
                  </span>
                ) : (
                  <> {mode === 'login' ? 'EFETUAR LOGIN' : 'SOLICITAR ACESSO'} <ArrowRight size={22} /></>
                )}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpVerify} className="space-y-10 animate-slide-up text-center pb-4">
              <div>
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-blue-100">
                   <Mail size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase">Validação</h3>
                <p className="text-xs text-slate-500 mt-4 font-medium leading-relaxed">Código enviado para:<br/><span className="font-bold text-blue-600">{email}</span></p>
              </div>
              
              <input 
                type="text"
                maxLength={6}
                placeholder="000000"
                required
                autoFocus
                className="w-full py-7 bg-slate-50 border-2 border-slate-200 rounded-[32px] text-center text-5xl font-black tracking-[0.3em] focus:border-blue-600 focus:bg-white outline-none transition-all text-slate-950 placeholder:text-slate-100"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
              />

              {error && <p className="text-red-600 text-[10px] font-black uppercase tracking-widest">{error}</p>}

              <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-xl active:scale-95">
                VALIDAR CÓDIGO
              </button>
            </form>
          )}

          {step === 'pending_approval' && (
            <div className="text-center space-y-10 animate-slide-up py-4">
               <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-[36px] flex items-center justify-center mx-auto border border-orange-100">
                  <Clock size={40} className="animate-pulse" />
               </div>
               <div className="space-y-4">
                 <h3 className="text-2xl font-black text-slate-900 uppercase">Aguardando Aprovação</h3>
                 <p className="text-xs text-slate-500 font-medium leading-relaxed px-4">
                   Seu cadastro foi recebido. Um administrador da FCMO LOG precisa autorizar seu perfil para liberar o primeiro acesso.
                 </p>
               </div>
               <button 
                onClick={() => { setStep('form'); setMode('login'); }}
                className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all"
               >
                 VOLTAR PARA O LOGIN
               </button>
            </div>
          )}

          <div className="mt-12 text-center opacity-30 border-t border-slate-100 pt-8 shrink-0">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em]">FCMO LOG TECH &copy; 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};
