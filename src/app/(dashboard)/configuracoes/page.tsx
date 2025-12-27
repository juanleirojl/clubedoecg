"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { 
  User, 
  Mail, 
  Lock,
  Bell,
  Palette,
  CreditCard,
  Shield,
  LogOut,
  Camera,
  Save,
  Loader2,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useUser } from "@/contexts/user-context"
import { useTheme } from "@/contexts/theme-context"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface UserSettings {
  email_notifications: boolean
  progress_reminders: boolean
  new_content_alerts: boolean
  weekly_summary: boolean
  reminder_frequency: 'daily' | 'weekly' | 'monthly' | 'never'
  theme: 'light' | 'dark' | 'system'
}

export default function ConfiguracoesPage() {
  const { profile, refreshData } = useUser()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estado para o user do Auth (não vem do contexto)
  const [authUser, setAuthUser] = useState<{ id: string; email?: string } | null>(null)
  
  // Estados do formulário
  const [fullName, setFullName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")
  
  // Estados para upload de avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState("")
  
  // Estados de alteração de senha
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  
  // Estados de preferências (do banco de dados)
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    progress_reminders: true,
    new_content_alerts: true,
    weekly_summary: true,
    reminder_frequency: 'weekly',
    theme: 'dark'
  })
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  
  // Carregar dados do usuário autenticado
  useEffect(() => {
    const getAuthUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setAuthUser({ id: user.id, email: user.email })
      }
    }
    getAuthUser()
  }, [supabase.auth])
  
  // Carregar dados do perfil
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name)
    }
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url)
    }
  }, [profile])
  
  // Carregar configurações do banco de dados
  const loadSettings = useCallback(async () => {
    if (!authUser?.id) return
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle()
      
      if (error) {
        throw error
      }
      
      if (!data) {
        // Se não existe, criar
        const { data: newData, error: insertError } = await supabase
          .from('user_settings')
          .insert({ user_id: authUser.id })
          .select()
          .single()
        
        if (insertError) {
          // Ignorar erro de duplicidade
          if (!insertError.message.includes('duplicate')) {
            throw insertError
          }
        }
        
        if (newData) {
          setSettings({
            email_notifications: newData.email_notifications ?? true,
            progress_reminders: newData.progress_reminders ?? true,
            new_content_alerts: newData.new_content_alerts ?? true,
            weekly_summary: newData.weekly_summary ?? true,
            reminder_frequency: newData.reminder_frequency ?? 'weekly',
            theme: newData.theme ?? 'dark'
          })
        }
      } else {
        setSettings({
          email_notifications: data.email_notifications ?? true,
          progress_reminders: data.progress_reminders ?? true,
          new_content_alerts: data.new_content_alerts ?? true,
          weekly_summary: data.weekly_summary ?? true,
          reminder_frequency: data.reminder_frequency ?? 'weekly',
          theme: data.theme ?? 'dark'
        })
        
        // Sincronizar tema
        if (data.theme && data.theme !== theme) {
          setTheme(data.theme)
        }
      }
    } catch {
      // Silenciar erro, usar valores padrão
    } finally {
      setIsLoadingSettings(false)
    }
  }, [authUser?.id, supabase, theme, setTheme])
  
  useEffect(() => {
    if (authUser?.id) {
      loadSettings()
    }
  }, [authUser?.id, loadSettings])
  
  // Salvar configuração individual
  const saveSettings = async (field: keyof UserSettings, value: boolean | string) => {
    if (!authUser?.id) return
    
    setIsSavingSettings(true)
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ 
          [field]: value,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authUser.id)
      
      if (error) throw error
      
      // Atualizar estado local
      setSettings(prev => ({ ...prev, [field]: value }))
      
      // Se for tema, atualizar o contexto
      if (field === 'theme') {
        setTheme(value as 'light' | 'dark')
      }
    } catch {
      // Reverter em caso de erro
      loadSettings()
    } finally {
      setIsSavingSettings(false)
    }
  }
  
  // Salvar perfil
  const handleSaveProfile = async () => {
    if (!authUser?.id) return
    
    setIsSaving(true)
    setSaveError("")
    setSaveSuccess(false)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', authUser.id)
      
      if (error) throw error
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError("Erro ao salvar. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }
  
  // Alterar senha
  const handleChangePassword = async () => {
    if (!authUser?.id) return
    
    // Validações
    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres")
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem")
      return
    }
    
    setIsChangingPassword(true)
    setPasswordError("")
    setPasswordSuccess(false)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      setPasswordSuccess(true)
      setShowPasswordForm(false)
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch {
      setPasswordError("Erro ao alterar senha. Tente novamente.")
    } finally {
      setIsChangingPassword(false)
    }
  }
  
  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }
  
  // Upload de avatar
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !authUser?.id) return
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setAvatarError("Selecione uma imagem válida (JPG, PNG ou GIF)")
      return
    }
    
    // Validar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("A imagem deve ter no máximo 2MB")
      return
    }
    
    setAvatarError("")
    setIsUploadingAvatar(true)
    
    // Mostrar preview imediato
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    
    try {
      // Nome do arquivo: {userId}/avatar.{ext}
      const fileExt = file.name.split('.').pop()
      const fileName = `${authUser.id}/avatar.${fileExt}`
      
      // Remover arquivo anterior se existir
      await supabase.storage
        .from('avatars')
        .remove([`${authUser.id}/avatar.jpg`, `${authUser.id}/avatar.png`, `${authUser.id}/avatar.gif`, `${authUser.id}/avatar.webp`])
      
      // Upload do novo arquivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })
      
      if (uploadError) throw uploadError
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      // Adicionar timestamp para evitar cache
      const finalUrl = `${publicUrl}?t=${Date.now()}`
      
      // Atualizar profile no banco
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: finalUrl })
        .eq('id', authUser.id)
      
      if (updateError) throw updateError
      
      // Atualizar estados
      setAvatarUrl(finalUrl)
      setAvatarPreview(null)
      
      // Atualizar contexto do usuário
      refreshData()
      
    } catch (err) {
      console.error('Erro ao fazer upload:', err)
      setAvatarError("Erro ao fazer upload. Tente novamente.")
      setAvatarPreview(null)
    } finally {
      setIsUploadingAvatar(false)
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  const handleRemoveAvatar = async () => {
    if (!authUser?.id) return
    
    setIsUploadingAvatar(true)
    
    try {
      // Remover arquivo do storage (tentar todas as extensões possíveis)
      await supabase.storage
        .from('avatars')
        .remove([
          `${authUser.id}/avatar.jpg`, 
          `${authUser.id}/avatar.jpeg`, 
          `${authUser.id}/avatar.png`, 
          `${authUser.id}/avatar.gif`, 
          `${authUser.id}/avatar.webp`
        ])
      
      // Atualizar profile no banco
      await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', authUser.id)
      
      setAvatarUrl(null)
      setAvatarPreview(null)
      refreshData()
      
    } catch (err) {
      console.error('Erro ao remover avatar:', err)
      setAvatarError("Erro ao remover. Tente novamente.")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Handlers para notificações
  const handleEmailNotifications = (checked: boolean) => {
    saveSettings('email_notifications', checked)
  }
  
  const handleProgressReminders = (checked: boolean) => {
    saveSettings('progress_reminders', checked)
  }
  
  const handleNewContentAlerts = (checked: boolean) => {
    saveSettings('new_content_alerts', checked)
  }
  
  const handleWeeklySummary = (checked: boolean) => {
    saveSettings('weekly_summary', checked)
  }
  
  const handleReminderFrequency = (frequency: 'daily' | 'weekly' | 'monthly' | 'never') => {
    saveSettings('reminder_frequency', frequency)
  }
  
  const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light'
    saveSettings('theme', newTheme)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
      </div>

      {/* Perfil */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Informações do Perfil
          </CardTitle>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Input hidden para upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 relative">
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
                
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (avatarUrl || profile?.avatar_url) ? (
                  <Image
                    src={(avatarUrl || profile?.avatar_url) as string}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 text-white text-2xl font-bold">
                    {(fullName || authUser?.email || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Botão de câmera para upload */}
              <button 
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
              </button>
              
              {/* Botão para remover avatar (só aparece se tiver foto) */}
              {(avatarUrl || profile?.avatar_url) && !isUploadingAvatar && (
                <button 
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  title="Remover foto"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div>
              <p className="font-medium">Foto de Perfil</p>
              <p className="text-sm text-muted-foreground">JPG, PNG ou GIF. Máx 2MB.</p>
              {avatarError && (
                <p className="text-xs text-red-500 mt-1">{avatarError}</p>
              )}
            </div>
          </div>
          
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>
          
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                value={profile?.email || authUser?.email || "Carregando..."}
                disabled
                className="bg-slate-50 dark:bg-slate-800 pr-10"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado
            </p>
          </div>
          
          {/* Mensagens de feedback */}
          {saveError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {saveError}
            </div>
          )}
          
          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="w-4 h-4" />
              Alterações salvas com sucesso!
            </div>
          )}
          
          {/* Botão Salvar */}
          <Button 
            onClick={handleSaveProfile} 
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Segurança - Alterar Senha */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Segurança
          </CardTitle>
          <CardDescription>
            Gerencie a segurança da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showPasswordForm ? (
            <button 
              onClick={() => setShowPasswordForm(true)}
              className="w-full flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Alterar Senha</p>
                  <p className="text-sm text-muted-foreground">Atualize sua senha de acesso</p>
                </div>
              </div>
              {passwordSuccess && (
                <span className="text-green-600 text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Alterada!
                </span>
              )}
            </button>
          ) : (
            <div className="space-y-4 p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                />
              </div>
              
              {passwordError && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {passwordError}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !newPassword || !confirmPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    "Alterar Senha"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPasswordForm(false)
                    setNewPassword("")
                    setConfirmPassword("")
                    setPasswordError("")
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notificações
            {isSavingSettings && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </CardTitle>
          <CardDescription>
            Configure como você quer receber atualizações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingSettings ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Notificações por Email</p>
                  <p className="text-sm text-muted-foreground">Receba atualizações importantes</p>
                </div>
                <Switch 
                  checked={settings.email_notifications} 
                  onCheckedChange={handleEmailNotifications}
                  size="lg"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Lembretes de Progresso</p>
                  <p className="text-sm text-muted-foreground">Lembrar de continuar os estudos</p>
                </div>
                <Switch 
                  checked={settings.progress_reminders} 
                  onCheckedChange={handleProgressReminders}
                  size="lg"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Novos Conteúdos</p>
                  <p className="text-sm text-muted-foreground">Avisar quando houver novas aulas</p>
                </div>
                <Switch 
                  checked={settings.new_content_alerts} 
                  onCheckedChange={handleNewContentAlerts}
                  size="lg"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Resumo Semanal</p>
                  <p className="text-sm text-muted-foreground">Receber relatório de progresso toda semana</p>
                </div>
                <Switch 
                  checked={settings.weekly_summary} 
                  onCheckedChange={handleWeeklySummary}
                  size="lg"
                />
              </div>
              
              {/* Frequência de Lembretes */}
              {settings.progress_reminders && (
                <div className="pt-4 border-t border-border">
                  <p className="font-medium mb-3">Frequência de Lembretes</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Com que frequência deseja receber lembretes para estudar?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'daily', label: 'Diário', desc: 'Se não estudar no dia' },
                      { value: 'weekly', label: 'Semanal', desc: 'Recomendado' },
                      { value: 'monthly', label: 'Mensal', desc: 'Apenas 1x/mês' },
                      { value: 'never', label: 'Nunca', desc: 'Desativar lembretes' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleReminderFrequency(option.value as 'daily' | 'weekly' | 'monthly' | 'never')}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          settings.reminder_frequency === option.value
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs opacity-70">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Aparência - Tema */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Aparência
            {isSavingSettings && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </CardTitle>
          <CardDescription>
            Personalize a interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-blue-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">Tema {theme === "dark" ? "Escuro" : "Claro"}</p>
                <p className="text-sm text-muted-foreground">
                  {theme === "dark" ? "Melhor para ambientes escuros" : "Melhor para ambientes claros"}
                </p>
              </div>
            </div>
            <Switch 
              checked={theme === "dark"} 
              onCheckedChange={handleThemeChange}
              size="lg"
              disabled={isLoadingSettings}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assinatura */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Assinatura
          </CardTitle>
          <CardDescription>
            Gerencie seu plano e pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">PRO</span>
                <span className="font-semibold">Plano Clube do ECG</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Acesso completo a todos os cursos</p>
            </div>
            <Button variant="outline" size="sm">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sair */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </CardContent>
      </Card>

      {/* Espaço extra no final */}
      <div className="h-8" />
    </div>
  )
}
