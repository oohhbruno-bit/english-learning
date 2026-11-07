'use client'

import { useState } from 'react'
import { Bell, Moon, Sun, Monitor, Shield, Trash2, Download, Languages, Target, Palette, Save, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { cn } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const { theme, setTheme, addToast } = useUIStore()
  const [dailyGoal, setDailyGoal] = useState(50)
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    streakAlert: true,
    weeklyReport: true,
    achievementUnlock: true,
    leaderboardChanges: false,
  })
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<'general' | 'notifications' | 'appearance' | 'learning' | 'account'>('general')

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    addToast({ type: 'success', title: 'Salvo!', message: 'Suas configurações foram atualizadas.' })
  }

  const handleDangerZone = (action: string) => {
    if (action === 'delete' && window.confirm('Tem certeza? Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente excluídos.')) {
      addToast({ type: 'error', title: 'Conta excluída', message: 'Sua conta foi permanentemente removida.' })
      // In real app: await api.deleteAccount()
    }
    if (action === 'export') {
      addToast({ type: 'success', title: 'Exportado', message: 'Seus dados foram preparados para download.' })
      // In real app: trigger download
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configurações
        </h1>
        <p className="text-gray-600 mt-1">Gerencie sua conta, preferências e privacidade</p>
      </div>

      {/* Sidebar Navigation */}
      <div className="lg:grid lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <nav className="card p-2 space-y-1 sticky top-24" aria-label="Configurações">
            {[
              { id: 'general', label: 'Geral', icon: '⚙️' },
              { id: 'notifications', label: 'Notificações', icon: '🔔' },
              { id: 'appearance', label: 'Aparência', icon: '🎨' },
              { id: 'learning', label: 'Aprendizado', icon: '🎯' },
              { id: 'account', label: 'Conta', icon: '👤' },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all',
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <span className="text-lg">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General */}
          {activeSection === 'general' && (
            <SettingsCard title="Informações do Perfil" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} >
                <Input
                  label="Nome completo"
                  value={user?.name || ''}
                  onChange={e => updateUser({ name: e.target.value })}
                  placeholder="Seu nome"
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  helperText="O e-mail não pode ser alterado"
                />
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-700">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Avatar</p>
                    <p className="text-sm text-gray-500">Clique no avatar no cabeçalho para alterar</p>
                  </div>
                </div>
            </SettingsCard>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <SettingsCard title="Preferências de Notificação" icon={<Bell className="w-5 h-5" />}>
              <div className="space-y-4">
                {[
                  { key: 'dailyReminder', label: 'Lembrete diário', desc: 'Receba um lembrete para estudar todos os dias' },
                  { key: 'streakAlert', label: 'Alerta de streak', desc: 'Aviso quando seu streak estiver em risco' },
                  { key: 'weeklyReport', label: 'Relatório semanal', desc: 'Resumo do seu progresso toda semana' },
                  { key: 'achievementUnlock', label: 'Conquistas desbloqueadas', desc: 'Notificação quando ganhar uma nova conquista' },
                  { key: 'leaderboardChanges', label: 'Mudanças no ranking', desc: 'Aviso quando sua posição mudar significativamente' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={e => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>
                ))}
              </div>
            </SettingsCard>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <SettingsCard title="Aparência" icon={<Palette className="w-5 h-5" />}>
              <div className="space-y-6">
                <div>
                  <label className="label">Tema</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Claro', icon: <Sun className="w-5 h-5" />, desc: 'Sempre claro' },
                      { value: 'dark', label: 'Escuro', icon: <Moon className="w-5 h-5" />, desc: 'Sempre escuro' },
                      { value: 'system', label: 'Sistema', icon: <Monitor className="w-5 h-5" />, desc: 'Seguir o sistema' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as any)}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all',
                          theme === option.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                            {option.icon}
                          </div>
                          <span className="font-medium text-gray-900">{option.label}</span>
                        </div>
                        <p className="text-sm text-gray-500 ml-13">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Idioma da Interface</label>
                  <select className="input" defaultValue="pt-BR">
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* Learning */}
          {activeSection === 'learning' && (
            <SettingsCard title="Preferências de Aprendizado" icon={<Target className="w-5 h-5" />}>
              <div className="space-y-6">
                <div>
                  <label className="label">Meta Diária de XP</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={dailyGoal}
                      onChange={e => setDailyGoal(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none accent-primary-600"
                    />
                    <span className="text-lg font-bold text-gray-900 w-16 text-right">{dailyGoal} XP</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Meta atual: {dailyGoal} XP por dia</p>
                </div>

                <div>
                  <label className="label">Velocidade de Áudio</label>
                  <select className="input" defaultValue="1">
                    <option value="0.75">0.75x - Lento</option>
                    <option value="1" selected>1x - Normal</option>
                    <option value="1.25">1.25x - Rápido</option>
                    <option value="1.5">1.5x - Muito rápido</option>
                  </select>
                </div>

                <div>
                  <label className="label">Dificuldade Preferida</label>
                  <div className="flex gap-2">
                    {['Fácil', 'Médio', 'Difícil'].map((level, i) => (
                      <button
                        key={level}
                        className={cn(
                          'flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all',
                          i === 1
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 rounded-lg bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Reprodução automática de áudio</p>
                      <p className="text-sm text-gray-500">Tocar pronúncia automaticamente nos exercícios</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 border-gray-300 rounded" />
                  </label>
                  <label className="flex items-center justify-between p-4 rounded-lg bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Modo estrito</p>
                      <p className="text-sm text-gray-500">Exigir acentos e pontuação corretos nas respostas</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-primary-600 border-gray-300 rounded" />
                  </label>
                  <label className="flex items-center justify-between p-4 rounded-lg bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Repetição espaçada (SRS)</p>
                      <p className="text-sm text-gray-500">Revisar palavras no momento ideal para memorização</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 border-gray-300 rounded" />
                  </label>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* Account */}
          {activeSection === 'account' && (
            <>
              <SettingsCard title="Segurança" icon={<Shield className="w-5 h-5" />}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Alterar Senha</p>
                      <p className="text-sm text-gray-500">Atualize sua senha regularmente</p>
                    </div>
                    <Button variant="secondary" size="sm">Alterar</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Autenticação de Dois Fatores</p>
                      <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
                    </div>
                    <Button variant="secondary" size="sm">Ativar</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Sessões Ativas</p>
                      <p className="text-sm text-gray-500">Gerencie onde sua conta está logada</p>
                    </div>
                    <Button variant="secondary" size="sm">Ver</Button>
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard title="Dados e Privacidade" icon={<Download className="w-5 h-5" />}>
                <div className="space-y-3">
                  <Button variant="secondary" className="w-full justify-start gap-3" onClick={() => handleDangerZone('export')}>
                    <Download className="w-4 h-4" />
                    <span>Baixar meus dados</span>
                  </Button>
                  <Button variant="secondary" className="w-full justify-start gap-3" onClick={() => handleDangerZone('delete')}>
                    <Trash2 className="w-4 h-4" />
                    <span className="text-red-600">Excluir conta permanentemente</span>
                  </Button>
                </div>
              </SettingsCard>

              <SettingsCard title="Informações Legais" icon={<Shield className="w-5 h-5" />}>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Versão do aplicativo: 1.0.0</p>
                  <p>Última atualização: Janeiro 2025</p>
                  <div className="flex gap-4 pt-2 border-t border-gray-100">
                    <a href="/terms" className="text-primary-600 hover:underline">Termos de Uso</a>
                    <a href="/privacy" className="text-primary-600 hover:underline">Política de Privacidade</a>
                    <a href="/cookies" className="text-primary-600 hover:underline">Cookies</a>
                  </div>
                </div>
              </SettingsCard>
            </>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}