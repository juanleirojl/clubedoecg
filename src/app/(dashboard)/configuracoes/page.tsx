"use client"

import { useState, useEffect } from "react"
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
  Moon
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

export default function ConfiguracoesPage() {
  const { user, profile } = useUser()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClient()
  
  // Estados do formulário
  const [fullName, setFullName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")
  
  // Estados de alteração de senha
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  
  // Estados de preferências
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [progressReminders, setProgressReminders] = useState(true)
  const [newContentAlerts, setNewContentAlerts] = useState(true)
  
  // Carregar dados do perfil
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name)
    }
  }, [profile])
  
  // Salvar perfil
  const handleSaveProfile = async () => {
    if (!user) return
    
    setIsSaving(true)
    setSaveError("")
    setSaveSuccess(false)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)
      
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
    if (!user) return
    
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
      setCurrentPassword("")
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
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 text-white text-2xl font-bold">
                    {(fullName || user?.email || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="font-medium">Foto de Perfil</p>
              <p className="text-sm text-muted-foreground">JPG, PNG ou GIF. Máx 2MB.</p>
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
                value={profile?.email || user?.email || "Carregando..."}
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
          </CardTitle>
          <CardDescription>
            Configure como você quer receber atualizações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium">Notificações por Email</p>
              <p className="text-sm text-muted-foreground">Receba atualizações importantes</p>
            </div>
            <Switch 
              checked={emailNotifications} 
              onCheckedChange={setEmailNotifications}
              size="lg"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium">Lembretes de Progresso</p>
              <p className="text-sm text-muted-foreground">Lembrar de continuar os estudos</p>
            </div>
            <Switch 
              checked={progressReminders} 
              onCheckedChange={setProgressReminders}
              size="lg"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium">Novos Conteúdos</p>
              <p className="text-sm text-muted-foreground">Avisar quando houver novas aulas</p>
            </div>
            <Switch 
              checked={newContentAlerts} 
              onCheckedChange={setNewContentAlerts}
              size="lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Aparência - Tema */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Aparência
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
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              size="lg"
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
