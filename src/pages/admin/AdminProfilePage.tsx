import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building2, Save, X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export default function AdminProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (success) setSuccess(false);
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
    
    if (!formData.company.trim()) {
      newErrors.company = 'Empresa é obrigatória';
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
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      company: user?.company || '',
      phone: user?.phone || '',
    });
    setErrors({});
    setSuccess(false);
    navigate('/admin');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Perfil do Administrador</h2>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas informações pessoais e de acesso</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#7c3aed] to-[#db2777] relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#db2777] flex items-center justify-center text-white font-black text-2xl">
                {user?.avatarInitials || 'AD'}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-8 px-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-green-700">Perfil atualizado com sucesso!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-pink-600" />
                Informações Pessoais
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                      } focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm`}
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
                      } focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm`}
                      placeholder="seu@email.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Professional Info Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-pink-600" />
                Informações Profissionais
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-5">
                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Empresa *
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
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                        errors.company ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                      } focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm`}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  {errors.company && <p className="mt-1 text-xs text-red-500 font-medium">{errors.company}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Telefone *
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
                      } focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm`}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Role Badge */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Cargo</p>
                  <p className="text-sm font-bold text-pink-600 uppercase">Administrador</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
                variant="primary"
                className="flex-1 sm:flex-none justify-center bg-gradient-to-r from-[#7c3aed] to-[#db2777] hover:from-[#6d28d9] hover:to-[#be185d]"
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
    </div>
  );
}
