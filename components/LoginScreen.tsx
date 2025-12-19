
import React, { useState } from 'react';
import { User } from '../types';
import { Truck, Lock, User as UserIcon, ArrowRight, Mail, KeyRound } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [step, setStep] = useState<'login' | 'verification'>('login');
  const [inputUser, setInputUser] = useState('');
  const [password, setPassword] = useState('');
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
        // User is active, login directly
        onLogin(user);
      } else {
        // User needs verification
        setTempUser(user);
        setStep('verification');
        // Simulate sending email
        console.log(`[EMAIL SERVICE] Enviando código 123456 para ${user.email}`);
        alert(`Um código de verificação foi enviado para ${user.email}. (Use 123456 para teste)`);
      }
    } else {
      setError('Usuário ou senha inválidos');
    }
  };

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === '123456') { // Mock check
       if (tempUser) {
         // In a real app, we would call API to update user status
         const activatedUser = { ...tempUser, isActive: true };
         onLogin(activatedUser);
       }
    } else {
      setError('Código inválido. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-blue-600 p-8 text-center">
          <div className="inline-flex p-4 bg-white/10 rounded-full mb-4">
            <Truck size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FCMO LOG TECH</h1>
          <p className="text-blue-100 mt-2">Gestão Inteligente de Frotas</p>
        </div>

        <div className="p-8">
          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Usuário</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-400">
                    <UserIcon size={20} />
                  </div>
                  <input 
                    type="text"
                    placeholder="Nome ou E-mail"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={inputUser}
                    onChange={(e) => {
                      setInputUser(e.target.value);
                      setError('');
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Senha</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-400">
                    <Lock size={20} />
                  </div>
                  <input 
                    type="password"
                    placeholder="Sua senha"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
              >
                Entrar na Plataforma
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerification} className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Verifique seu E-mail</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Enviamos um código de acesso para <strong>{tempUser?.email}</strong>. Digite-o abaixo para ativar seu cadastro.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Código de Verificação</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-400">
                    <KeyRound size={20} />
                  </div>
                  <input 
                    type="text"
                    placeholder="Ex: 123456"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg font-bold"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                Verificar e Ativar
              </button>
              
              <button 
                type="button"
                onClick={() => setStep('login')}
                className="w-full text-slate-500 py-2 text-sm hover:text-slate-700"
              >
                Voltar para Login
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-400">
            <p>Ambiente Seguro • Versão 2.2.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};
