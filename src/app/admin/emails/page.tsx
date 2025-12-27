"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Mail, 
  Send, 
  BarChart3, 
  Clock, 
  Users, 
  CheckCircle2,
  XCircle,
  Eye,
  MousePointer,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Loader2,
  Plus,
  Filter,
  TestTube,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface EmailStats {
  total_sent: number
  total_delivered: number
  total_opened: number
  total_clicked: number
  total_bounced: number
  total_failed: number
}

interface EmailConfig {
  id: string
  emails_enabled: boolean
  daily_limit: number
  send_start_hour: number
  send_end_hour: number
  send_days: number[]
  emails_sent_today: number
}

interface EmailLog {
  id: string
  email_to: string
  email_type: string
  subject: string
  status: string
  created_at: string
  opened_at: string | null
  clicked_at: string | null
}

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  total_recipients: number
  total_sent: number
  total_opened: number
  scheduled_for: string | null
  created_at: string
}

// Tipos de email disponíveis
const EMAIL_TYPES = [
  { value: "welcome", label: "🎉 Boas-vindas", subject: "Bem-vindo(a) ao Clube do ECG!" },
  { value: "reminder", label: "🫀 Lembrete", subject: "Continue seus estudos de ECG!" },
  { value: "new_content", label: "✨ Novo Conteúdo", subject: "Novo conteúdo disponível!" },
  { value: "weekly_summary", label: "📊 Resumo Semanal", subject: "Seu resumo semanal do Clube do ECG" },
]

export default function AdminEmailsPage() {
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<EmailStats>({
    total_sent: 0,
    total_delivered: 0,
    total_opened: 0,
    total_clicked: 0,
    total_bounced: 0,
    total_failed: 0,
  })
  const [config, setConfig] = useState<EmailConfig | null>(null)
  const [recentEmails, setRecentEmails] = useState<EmailLog[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  
  // Estado para o modal de teste de email
  const [testEmailOpen, setTestEmailOpen] = useState(false)
  const [testEmailTo, setTestEmailTo] = useState("")
  const [testEmailType, setTestEmailType] = useState("welcome")
  const [testEmailSubject, setTestEmailSubject] = useState("")
  const [isSendingTest, setIsSendingTest] = useState(false)
  
  // Carregar dados
  const loadData = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // Carregar configuração
      const { data: configData } = await supabase
        .from("email_config")
        .select("*")
        .single()
      
      if (configData) setConfig(configData)
      
      // Carregar estatísticas
      const { data: emailLogs } = await supabase
        .from("email_log")
        .select("status")
      
      if (emailLogs) {
        const newStats: EmailStats = {
          total_sent: emailLogs.filter(e => e.status !== "pending" && e.status !== "failed").length,
          total_delivered: emailLogs.filter(e => e.status === "delivered" || e.status === "opened" || e.status === "clicked").length,
          total_opened: emailLogs.filter(e => e.status === "opened" || e.status === "clicked").length,
          total_clicked: emailLogs.filter(e => e.status === "clicked").length,
          total_bounced: emailLogs.filter(e => e.status === "bounced").length,
          total_failed: emailLogs.filter(e => e.status === "failed").length,
        }
        setStats(newStats)
      }
      
      // Carregar emails recentes
      const { data: recentData } = await supabase
        .from("email_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)
      
      if (recentData) setRecentEmails(recentData)
      
      // Carregar campanhas
      const { data: campaignsData } = await supabase
        .from("notification_campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)
      
      if (campaignsData) setCampaigns(campaignsData)
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])
  
  useEffect(() => {
    loadData()
  }, [loadData])
  
  // Salvar configuração
  const saveConfig = async (updates: Partial<EmailConfig>) => {
    if (!config) return
    
    setIsSaving(true)
    
    try {
      const { error } = await supabase
        .from("email_config")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", config.id)
      
      if (error) throw error
      
      setConfig({ ...config, ...updates })
    } catch (error) {
      console.error("Erro ao salvar configuração:", error)
    } finally {
      setIsSaving(false)
    }
  }
  
  // Executar cron manualmente
  const runCronManually = async () => {
    try {
      const response = await fetch("/api/emails/cron", {
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || "dev"}`,
        },
      })
      const data = await response.json()
      toast.success(`Cron executado: ${data.sent || 0} emails enviados`)
      loadData()
    } catch (error) {
      console.error("Erro ao executar cron:", error)
      toast.error("Erro ao executar cron")
    }
  }
  
  // Enviar email de teste
  const sendTestEmail = async () => {
    if (!testEmailTo || !testEmailType) {
      toast.error("Preencha todos os campos")
      return
    }
    
    setIsSendingTest(true)
    
    try {
      const emailTypeInfo = EMAIL_TYPES.find(t => t.value === testEmailType)
      
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: testEmailTo,
          type: testEmailType,
          subject: testEmailSubject || emailTypeInfo?.subject || "Email de Teste",
          force: true, // Força o envio mesmo com limites
          templateData: {
            userName: "Usuário de Teste",
            daysInactive: 3,
            lastCourseName: "ECG Básico",
            lastCourseProgress: 45,
            lastCourseSlug: "ecg-basico",
            contentTitle: "Nova Aula: Arritmias",
            contentType: "aula",
            contentSlug: "arritmias",
          },
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(`Email enviado com sucesso! ID: ${data.resendId}`)
        setTestEmailOpen(false)
        setTestEmailTo("")
        setTestEmailSubject("")
        loadData()
      } else {
        toast.error(data.error || "Erro ao enviar email")
      }
    } catch (error) {
      console.error("Erro ao enviar email:", error)
      toast.error("Erro ao enviar email de teste")
    } finally {
      setIsSendingTest(false)
    }
  }
  
  // Formatar data
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  
  // Status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      sent: "bg-blue-500/20 text-blue-400",
      delivered: "bg-green-500/20 text-green-400",
      opened: "bg-purple-500/20 text-purple-400",
      clicked: "bg-yellow-500/20 text-yellow-400",
      bounced: "bg-red-500/20 text-red-400",
      failed: "bg-red-500/20 text-red-400",
      pending: "bg-gray-500/20 text-gray-400",
    }
    
    return (
      <span className={cn("px-2 py-1 rounded text-xs font-medium", styles[status] || styles.pending)}>
        {status.toUpperCase()}
      </span>
    )
  }
  
  // Calcular taxa de abertura
  const openRate = stats.total_sent > 0 
    ? Math.round((stats.total_opened / stats.total_sent) * 100) 
    : 0
  
  const clickRate = stats.total_opened > 0 
    ? Math.round((stats.total_clicked / stats.total_opened) * 100) 
    : 0
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gerenciamento de Emails</h1>
          <p className="text-gray-400">Configure e monitore o envio de emails</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={testEmailOpen} onOpenChange={setTestEmailOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                <TestTube className="w-4 h-4 mr-2" />
                Enviar Teste
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-purple-400" />
                  Enviar Email de Teste
                </DialogTitle>
                <DialogDescription>
                  Envie um email de teste para verificar se está funcionando corretamente.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Email de Destino</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={testEmailTo}
                    onChange={(e) => setTestEmailTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Email</Label>
                  <Select value={testEmailType} onValueChange={setTestEmailType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-subject">Assunto (opcional)</Label>
                  <Input
                    id="test-subject"
                    placeholder={EMAIL_TYPES.find(t => t.value === testEmailType)?.subject}
                    value={testEmailSubject}
                    onChange={(e) => setTestEmailSubject(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTestEmailOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={sendTestEmail} disabled={isSendingTest}>
                  {isSendingTest ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Teste
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={runCronManually}>
            <Play className="w-4 h-4 mr-2" />
            Executar Cron
          </Button>
        </div>
      </div>
      
      {/* Status Global */}
      {config && (
        <Card className={cn(
          "border-2",
          config.emails_enabled ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
        )}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.emails_enabled ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className="font-medium text-white">
                  {config.emails_enabled ? "Emails Ativos" : "Emails Pausados"}
                </p>
                <p className="text-sm text-gray-400">
                  {config.emails_sent_today}/{config.daily_limit} enviados hoje
                </p>
              </div>
            </div>
            <Switch
              checked={config.emails_enabled}
              onCheckedChange={(checked) => saveConfig({ emails_enabled: checked })}
              size="lg"
            />
          </CardContent>
        </Card>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Send className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-white">{stats.total_sent}</p>
            <p className="text-xs text-gray-400">Enviados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-white">{stats.total_delivered}</p>
            <p className="text-xs text-gray-400">Entregues</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <p className="text-2xl font-bold text-white">{stats.total_opened}</p>
            <p className="text-xs text-gray-400">Abertos ({openRate}%)</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MousePointer className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold text-white">{stats.total_clicked}</p>
            <p className="text-xs text-gray-400">Clicados ({clickRate}%)</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-orange-400" />
            <p className="text-2xl font-bold text-white">{stats.total_bounced}</p>
            <p className="text-xs text-gray-400">Bounces</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="w-6 h-6 mx-auto mb-2 text-red-400" />
            <p className="text-2xl font-bold text-white">{stats.total_failed}</p>
            <p className="text-xs text-gray-400">Falhas</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações
            </CardTitle>
            <CardDescription>
              Ajuste o comportamento do sistema de emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {config && (
              <>
                {/* Limite diário */}
                <div className="space-y-2">
                  <Label>Limite Diário</Label>
                  <Input
                    type="number"
                    value={config.daily_limit}
                    onChange={(e) => saveConfig({ daily_limit: parseInt(e.target.value) || 100 })}
                    min={1}
                    max={10000}
                  />
                  <p className="text-xs text-gray-500">
                    Máximo de emails por dia
                  </p>
                </div>
                
                {/* Horário de envio */}
                <div className="space-y-2">
                  <Label>Horário de Envio (UTC)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      value={config.send_start_hour}
                      onChange={(e) => saveConfig({ send_start_hour: parseInt(e.target.value) || 9 })}
                      min={0}
                      max={23}
                      className="w-20"
                    />
                    <span className="text-gray-400">até</span>
                    <Input
                      type="number"
                      value={config.send_end_hour}
                      onChange={(e) => saveConfig({ send_end_hour: parseInt(e.target.value) || 18 })}
                      min={0}
                      max={23}
                      className="w-20"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Horário em UTC (Brasil = UTC-3)
                  </p>
                </div>
                
                {/* Dias da semana */}
                <div className="space-y-2">
                  <Label>Dias de Envio</Label>
                  <div className="flex gap-1">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const newDays = config.send_days.includes(index)
                            ? config.send_days.filter(d => d !== index)
                            : [...config.send_days, index].sort()
                          saveConfig({ send_days: newDays })
                        }}
                        className={cn(
                          "w-8 h-8 rounded text-sm font-medium transition-colors",
                          config.send_days.includes(index)
                            ? "bg-primary text-white"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                
                {isSaving && (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Salvando...
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Emails Recentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Emails Recentes
                </CardTitle>
                <CardDescription>
                  Últimos emails enviados
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="reminder">Lembretes</option>
                  <option value="new_content">Novo Conteúdo</option>
                  <option value="weekly_summary">Resumo Semanal</option>
                  <option value="welcome">Boas-vindas</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentEmails
                .filter(e => filterType === "all" || e.email_type === filterType)
                .map((email) => (
                  <div 
                    key={email.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {email.subject}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {email.email_to}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-xs text-gray-500">
                        {formatDate(email.created_at)}
                      </span>
                      {getStatusBadge(email.status)}
                    </div>
                  </div>
                ))}
              
              {recentEmails.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhum email enviado ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Campanhas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Campanhas
              </CardTitle>
              <CardDescription>
                Campanhas de email manuais
              </CardDescription>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Campanha
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {campaigns.length > 0 ? (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div 
                  key={campaign.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-white">{campaign.name}</p>
                    <p className="text-sm text-gray-400">{campaign.subject}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-white">{campaign.total_sent} enviados</p>
                      <p className="text-gray-400">
                        {campaign.total_opened} abertos 
                        ({campaign.total_sent > 0 
                          ? Math.round((campaign.total_opened / campaign.total_sent) * 100) 
                          : 0}%)
                      </p>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 mb-4">Nenhuma campanha criada</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Campanha
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

