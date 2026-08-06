import { useEffect, useState } from 'react';
import { 
  Users, Search, Edit2, Key, CheckCircle, AlertCircle, X, ShieldAlert,
  Building, Phone, Award, Lock, Trash2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import Button from '../../components/ui/Button';

export default function AdminClientsPage() {
  useEffect(() => {
    document.title = 'Gerenciar Clientes — Nextia';
  }, []);

  const { profiles, projects, refreshData, loading: adminLoading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    role: 'client'
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Filter clients (non-admins by default, or all, but let's show all and highlight admins)
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate client statistics
  const totalClients = profiles.filter(p => p.role === 'client').length;
  const totalAdmins = profiles.filter(p => p.role === 'admin').length;
  const clientsWithProjects = profiles.filter(p => 
    p.role === 'client' && projects.some(proj => proj.userId === p.id)
  ).length;

  const handleOpenEdit = (profile: any) => {
    setSelectedProfile(profile);
    setEditForm({
      name: profile.name || '',
      email: profile.email || '',
      company: profile.company || '',
      phone: profile.phone || '',
      role: profile.role || 'client'
    });
    setEditModalOpen(true);
  };

  const handleOpenPassword = (profile: any) => {
    setSelectedProfile(profile);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordModalOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUserId: selectedProfile.id,
          name: editForm.name,
          email: editForm.email,
          company: editForm.company,
          phone: editForm.phone,
          role: editForm.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar dados do cliente.');
      }

      setSuccess('Cadastro do cliente atualizado com sucesso!');
      setEditModalOpen(false);
      await refreshData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro inesperado ao atualizar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (profileId: string, name: string) => {
    if (!confirm(`Deseja realmente remover o cliente "${name}"? Todos os seus projetos, marcos, faturas, arquivos e chamados serão excluídos permanentemente.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/delete-item', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'client',
          id: profileId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover cliente.');
      }

      setSuccess(`Cliente "${name}" removido com sucesso!`);
      await refreshData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro inesperado ao remover.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUserId: selectedProfile.id,
          name: selectedProfile.name,
          company: selectedProfile.company,
          phone: selectedProfile.phone,
          role: selectedProfile.role,
          password: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar senha do cliente.');
      }

      setSuccess(`Senha do cliente ${selectedProfile.name} alterada com sucesso!`);
      setPasswordModalOpen(false);
      await refreshData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro inesperado ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };

  // Find active projects for a profile
  const getProfileProjects = (profileId: string) => {
    return projects.filter(p => p.userId === profileId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Painel Administrativo</p>
          <h2 className="text-xl font-bold text-gray-900">Gerenciar Clientes</h2>
          <p className="text-gray-500 text-xs mt-0.5">Acompanhe contratos, altere senhas e edite dados cadastrais.</p>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-xs font-semibold text-green-700 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-xs font-semibold text-red-700 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-5 border border-gray-150 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[11px] font-bold block">Total de Clientes</span>
            <span className="text-2xl font-black text-gray-950">{totalClients}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-150 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[11px] font-bold block">Clientes com Projetos</span>
            <span className="text-2xl font-black text-gray-950">{clientsWithProjects}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-150 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[11px] font-bold block">Administradores</span>
            <span className="text-2xl font-black text-gray-950">{totalAdmins}</span>
          </div>
        </div>
      </div>

      {/* Search & Table Section */}
      <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, negócio ou e-mail..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-sm"
          />
        </div>

        {adminLoading ? (
          <div className="py-12 text-center text-gray-400">Carregando dados...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500 min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="pb-3 w-[220px]">Cliente</th>
                  <th className="pb-3 w-[220px]">Negócio / Empresa</th>
                  <th className="pb-3 w-[250px]">Serviço Contratado</th>
                  <th className="pb-3 w-[100px]">Perfil</th>
                  <th className="pb-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {filteredProfiles.map(p => {
                  const clientProjs = getProfileProjects(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/20 transition-all">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#db2777] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {p.avatarInitials || 'US'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 block truncate">{p.name || 'Sem nome'}</span>
                            <span className="text-[10px] text-gray-400 block truncate">{p.email || 'Sem e-mail'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="min-w-0">
                          <span className="font-semibold text-gray-800 block truncate">{p.company || 'Pessoa Física'}</span>
                          <span className="text-[10px] text-gray-400 block truncate">{p.phone || 'Sem telefone'}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        {clientProjs.length === 0 ? (
                          <span className="text-gray-400 italic text-[11px]">Nenhum projeto ativo</span>
                        ) : (
                          <div className="space-y-1">
                            {clientProjs.map(proj => (
                              <div key={proj.id} className="flex items-center gap-1">
                                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                                  {proj.plan}
                                </span>
                                <span className="text-gray-700 font-medium truncate max-w-[150px]" title={proj.name}>
                                  {proj.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.role === 'admin'
                            ? 'bg-pink-100 text-pink-700'
                            : p.role === 'partner'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {p.role === 'admin' ? 'Admin' : p.role === 'partner' ? 'Parceiro' : 'Cliente'}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEdit(p)}
                          title="Editar dados"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenPassword(p)}
                          title="Alterar senha"
                        >
                          <Key className="w-3.5 h-3.5 text-pink-600" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteClient(p.id, p.name)}
                          title="Remover cliente"
                          className="hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Client Modal */}
      {editModalOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setEditModalOpen(false)} 
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Editar Cadastro do Cliente</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Nome completo</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">E-mail</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold pl-0.5">@</span>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Negócio / Empresa</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">WhatsApp / Celular</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Função / Perfil</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm bg-white"
                >
                  <option value="client">Cliente</option>
                  <option value="partner" disabled>Parceiro (gerencie na área de parceiros)</option>
                  <option value="admin">Administrador (Acesso Total)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gradient" loading={loading}>
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPasswordModalOpen(false)} />
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setPasswordModalOpen(false)} 
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Alterar Senha do Cliente</h3>
            </div>
            <p className="text-[11px] text-gray-400 mb-6">
              Defina uma nova senha de acesso para o cliente <strong>{selectedProfile.name}</strong>.
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Nova Senha (Mín. 6 dígitos)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Confirmar Nova Senha</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setPasswordModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gradient" loading={loading}>
                  Definir Nova Senha
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
