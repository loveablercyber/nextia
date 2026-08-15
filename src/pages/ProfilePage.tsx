import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Save,
  X,
  Shield,
  Users,
  ClipboardList,
  Briefcase,
  Lock,
  CheckCircle2,
  Calendar,
  Clock,
  Camera,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { requestJson } from '../lib/appData';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
}

interface ProfileActivity {
  summary: { services: number; requests: number; supportTickets: number };
  recentRequests: Array<{ id: string; title: string; status: string; created_at: string; service_name_snapshot?: string }>;
}

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatarUrl || null);
  const [activity, setActivity] = useState<ProfileActivity>({ summary: { services: 0, requests: 0, supportTickets: 0 }, recentRequests: [] });

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
      });
      if (user.avatarUrl) setPreviewUrl(user.avatarUrl);
    }
  }, [user]);

  useEffect(() => {
    if (!user || isAdmin) return;
    let active = true;
    requestJson<ProfileActivity>('/api/app/profile/activity')
      .then((data) => { if (active) setActivity(data); })
      .catch((error) => { console.error('[ProfilePage] Falha ao carregar atividade:', error); });
    return () => { active = false; };
  }, [isAdmin, user]);

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (success) setSuccess(false);
    if (formError) setFormError('');
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
    setFormError('');

    if (!validateForm()) return;

    setLoading(true);

    const initials = formData.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'NX';

    const res = await updateProfile({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      company: formData.company.trim(),
      avatarInitials: initials,
      avatarUrl: previewUrl || undefined,
    });

    setLoading(false);

    if (res.error) {
      setFormError(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');

    if (!pwForm.currentPassword) {
      setPwError('Informe a senha atual');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('As senhas não coincidem');
      return;
    }

    setPwLoading(true);
    setPwSuccess(false);

    const res = await changePassword(pwForm.currentPassword, pwForm.newPassword);

    setPwLoading(false);

    if (res.error) {
      setPwError(res.error);
    } else {
      setPwSuccess(true);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(false), 3000);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
      });
    }
    setErrors({});
    setSuccess(false);
    navigate(isAdmin ? '/admin' : '/painel');
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateString;
    }
  };

  const adminQuickLinks = [
    { label: 'Gerenciar Clientes', icon: Users, href: '/admin/clientes', color: 'from-[#5B4FE9] to-[#7c3aed]' },
    { label: 'Projetos Ativos', icon: Briefcase, href: '/admin/projetos', color: 'from-[#059669] to-[#10b981]' },
    { label: 'Central de Suporte', icon: HelpCircle, href: '/admin/suporte', color: 'from-[#db2777] to-[#ec4899]' },
  ];

  const userRequests = activity.recentRequests.map((r) => ({
    id: r.id,
    service: r.title,
    date: r.created_at,
    status: r.status === 'concluido' ? 'Concluído' : r.status === 'em-andamento' ? 'Em andamento' : 'Pendente',
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          {isAdmin ? 'Perfil do Administrador' : 'Meu Perfil'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isAdmin
            ? 'Gerencie suas informações pessoais, de acesso e dados administrativos'
            : 'Gerencie suas informações pessoais e preferências de conta'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar, Stats & Quick Links */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Summary Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Banner Theme */}
            <div
              className={`h-28 relative ${
                isAdmin
                  ? 'bg-gradient-to-r from-[#7c3aed] to-[#db2777]'
                  : 'bg-gradient-to-r from-[#5B4FE9] to-[#7c3aed]'
              }`}
            >
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className={`w-full h-full rounded-xl flex items-center justify-center text-white font-black text-xl ${
                          isAdmin
                            ? 'bg-gradient-to-br from-[#7c3aed] to-[#db2777]'
                            : 'bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed]'
                        }`}
                      >
                        {user?.avatarInitials || (isAdmin ? 'AD' : 'CL')}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-colors ${
                      isAdmin
                        ? 'bg-[#7c3aed] hover:bg-[#6d28d9]'
                        : 'bg-[#5B4FE9] hover:bg-[#4338CA]'
                    }`}
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
                <h3 className="font-bold text-gray-900">{user?.name || 'Usuário'}</h3>
                {user?.company && <p className="text-xs text-gray-500 mt-0.5">{user.company}</p>}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-xs">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Cadastro:</span>
                  <span className="font-semibold text-gray-900">{formatDateTime(user?.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Último acesso:</span>
                  <span className="font-semibold text-gray-900">{formatDateTime(user?.lastLogin)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    isAdmin ? 'bg-pink-50' : 'bg-green-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isAdmin ? 'bg-pink-100' : 'bg-green-100'
                    }`}
                  >
                    <Shield
                      className={`w-4 h-4 ${isAdmin ? 'text-pink-600' : 'text-green-600'}`}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Função da Conta</p>
                    <p
                      className={`text-xs font-bold uppercase ${
                        isAdmin ? 'text-pink-600' : 'text-green-600'
                      }`}
                    >
                      {isAdmin ? 'Administrador' : 'Cliente Ativo'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Stats Section */}
          {isAdmin ? (
            /* Admin Quick Stats & Links */
            <>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#7c3aed]" />
                  Dashboard Rápido
                </h3>
                <div className="space-y-3">
                  <div className="p-3.5 bg-gradient-to-r from-[#5B4FE9]/10 to-[#7c3aed]/10 rounded-2xl border border-[#5B4FE9]/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#5B4FE9] flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Clientes</p>
                          <p className="text-sm font-black text-[#5B4FE9]">Gerenciar</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-gradient-to-r from-[#db2777]/10 to-[#ec4899]/10 rounded-2xl border border-[#db2777]/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#db2777] flex items-center justify-center">
                          <ClipboardList className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Agendamentos</p>
                          <p className="text-sm font-black text-[#db2777]">Gerenciar</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-gradient-to-r from-[#059669]/10 to-[#10b981]/10 rounded-2xl border border-[#059669]/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#059669] flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Serviços</p>
                          <p className="text-sm font-black text-[#059669]">Gerenciar</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#7c3aed]" />
                  Atalhos Rápidos
                </h3>
                <div className="space-y-2">
                  {adminQuickLinks.map((link) => (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => navigate(link.href)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group text-left"
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${link.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                        <link.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Client Stats & Activity */
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#5B4FE9]" />
                Histórico de Atividade
              </h3>
              <div className="text-center py-4 bg-gradient-to-r from-[#5B4FE9]/5 to-[#7c3aed]/5 rounded-2xl border border-[#5B4FE9]/10 mb-4">
                <p className="text-3xl font-black text-[#5B4FE9]">{activity.summary.requests}</p>
                <p className="text-xs text-gray-600 mt-1">Solicitações Registradas</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700 mb-2">Últimas solicitações</p>
                {userRequests.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-400">
                    Nenhuma solicitação enviada até o momento.
                  </div>
                ) : (
                  userRequests.map((apt) => (
                    <div key={apt.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-gray-900 truncate">{apt.service}</p>
                        <span className="text-[10px] text-gray-500">{formatDateTime(apt.date)}</span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          apt.status === 'Concluído'
                            ? 'text-green-700 bg-green-100'
                            : apt.status === 'Em andamento'
                              ? 'text-amber-800 bg-amber-100'
                              : 'text-gray-700 bg-gray-200'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Edit Profile Form & Password Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <UserIcon className={`w-4 h-4 ${isAdmin ? 'text-[#7c3aed]' : 'text-[#5B4FE9]'}`} />
                Informações do Perfil
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Atualize seus dados pessoais e de contato para comunicação
              </p>
            </div>

            <div className="p-6">
              {/* Form Error Alert */}
              {formError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-sm text-red-700 font-medium">
                  {formError}
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-green-700">
                    Perfil atualizado com sucesso!
                  </span>
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
                        } focus:bg-white ${
                          isAdmin
                            ? 'focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10'
                            : 'focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10'
                        } outline-none transition-all text-sm`}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      E-mail de Acesso *
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
                        } focus:bg-white ${
                          isAdmin
                            ? 'focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10'
                            : 'focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10'
                        } outline-none transition-all text-sm`}
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
                        } focus:bg-white ${
                          isAdmin
                            ? 'focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10'
                            : 'focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10'
                        } outline-none transition-all text-sm`}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>}
                  </div>

                  {/* Company */}
                  <div>
                    <label htmlFor="company" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Empresa / Negócio
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white ${
                          isAdmin
                            ? 'focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10'
                            : 'focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10'
                        } outline-none transition-all text-sm`}
                        placeholder="Nome da sua empresa"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="justify-center"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    className={`justify-center ${
                      isAdmin
                        ? 'bg-gradient-to-r from-[#7c3aed] to-[#db2777] hover:from-[#6d28d9] hover:to-[#be185d]'
                        : ''
                    }`}
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

          {/* Security & Password Form */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Lock className={`w-4 h-4 ${isAdmin ? 'text-[#db2777]' : 'text-[#7c3aed]'}`} />
                Segurança e Acesso
              </h3>
              <p className="text-xs text-gray-500 mt-1">Altere sua senha de login com segurança</p>
            </div>

            <div className="p-6">
              {pwSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-green-700">Senha alterada com sucesso!</span>
                </div>
              )}

              {pwError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-sm text-red-700 font-medium">
                  {pwError}
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
                      placeholder="Mínimo 6 caracteres"
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
                      placeholder="Repita a nova senha"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button
                    type="submit"
                    variant="gradient"
                    size="sm"
                    loading={pwLoading}
                    className={
                      isAdmin
                        ? 'bg-gradient-to-r from-[#7c3aed] to-[#db2777] hover:from-[#6d28d9] hover:to-[#be185d]'
                        : ''
                    }
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
