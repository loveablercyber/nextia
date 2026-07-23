import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  Save,
  X,
  Camera,
  Lock,
  CheckCircle2,
  ClipboardList,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatarUrl || null);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (success) setSuccess(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update profile in context
    updateProfile(formData);

    setLoading(false);
    setSuccess(true);

    setTimeout(() => setSuccess(false), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return;

    setPwLoading(true);
    setPwSuccess(false);

    // Simulate saving
    await new Promise((resolve) => setTimeout(resolve, 800));

    setPwLoading(false);
    setPwSuccess(true);
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setErrors({});
    setSuccess(false);
    navigate('/painel');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Mock data for demonstration
  const appointmentCount = 3;
  const lastAppointments = [
    { id: 1, service: 'Criação de Landing Page', date: '2025-01-10', status: 'Concluído' },
    { id: 2, service: 'Revisão de Design', date: '2025-01-05', status: 'Concluído' },
    { id: 3, service: 'Suporte Técnico', date: '2024-12-20', status: 'Concluído' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Meu Perfil</h2>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas informações pessoais e preferências de conta</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card & Security */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Summary Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Banner */}
            <div className="h-28 bg-gradient-to-r from-[#5B4FE9] to-[#7c3aed] relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center text-white font-black text-xl">
                        {user?.avatarInitials || 'CL'}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#5B4FE9] hover:bg-[#4338CA] flex items-center justify-center shadow-md transition-colors"
                    title="Alterar foto"
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-12 pb-6 px-6">
              <div className="text-center mb-4">
                <h3 className="font-bold text-gray-900">{user?.name}</h3>
                <p className="text-xs text-gray-500">{user?.company}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-xs">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Cadastro:</span>
                  <span className="font-semibold text-gray-900">{formatDate(user?.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Último acesso:</span>
                  <span className="font-semibold text-gray-900">{formatDate(user?.lastLogin)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Status da conta</p>
                    <p className="text-xs font-bold text-green-600 uppercase">Ativa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Type Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#5B4FE9]" />
              Tipo de Conta
            </h3>
            <div className="p-4 bg-gradient-to-r from-[#5B4FE9]/10 to-[#7c3aed]/10 rounded-2xl border border-[#5B4FE9]/20">
              <p className="text-sm font-bold text-[#5B4FE9] uppercase">Cliente</p>
              <p className="text-xs text-gray-600 mt-1">Acesso completo ao painel do cliente</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#5B4FE9]" />
              Histórico
            </h3>
            <div className="text-center py-4">
              <p className="text-3xl font-black text-[#5B4FE9]">{appointmentCount}</p>
              <p className="text-xs text-gray-600 mt-1">Agendamentos realizados</p>
            </div>
            {lastAppointments.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-700 mb-2">Últimos agendamentos</p>
                {lastAppointments.map((apt) => (
                  <div key={apt.id} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs font-semibold text-gray-900 truncate">{apt.service}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-500">{formatDate(apt.date)}</span>
                      <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#5B4FE9]" />
                Dados Pessoais
              </h3>
              <p className="text-xs text-gray-500 mt-1">Atualize suas informações de contato</p>
            </div>

            <div className="p-6">
              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-green-700">Perfil atualizado com sucesso!</span>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                          errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                        } focus:bg-white focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10 outline-none transition-all text-sm`}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      E-mail *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                          errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                        } focus:bg-white focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10 outline-none transition-all text-sm`}
                        placeholder="seu@email.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Telefone / WhatsApp *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                          errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                        } focus:bg-white focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10 outline-none transition-all text-sm`}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>}
                  </div>

                  {/* Company (Read-only) */}
                  <div>
                    <label htmlFor="company" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Empresa / Negócio
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={user?.company || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Não é possível alterar</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 sm:flex-none justify-center"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    className="flex-1 sm:flex-none justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#7c3aed]" />
                Segurança
              </h3>
              <p className="text-xs text-gray-500 mt-1">Altere sua senha de acesso</p>
            </div>

            <div className="p-6">
              {pwSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-green-700">Senha atualizada com sucesso!</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label htmlFor="currentPassword" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-sm"
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="newPassword" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-sm"
                      placeholder="Nova senha"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-sm"
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button
                    type="submit"
                    variant="gradient"
                    size="sm"
                    loading={pwLoading}
                  >
                    <Save className="w-3.5 h-3.5" />
                    Alterar Senha
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
