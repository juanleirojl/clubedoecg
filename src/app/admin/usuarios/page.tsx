"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Search, 
  Shield, 
  Crown, 
  Sparkles,
  Edit2,
  Save,
  X,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: "user" | "admin" | "instructor"
  subscription_plan: "free" | "basic" | "pro"
  subscription_expires_at: string | null
  created_at: string
  updated_at: string
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  async function loadUsers() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao carregar usuários:", error)
    } else {
      setUsers(data || [])
      setFilteredUsers(data || [])
    }
    setIsLoading(false)
  }

  async function saveUser() {
    if (!editingUser) return

    setIsSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        role: editingUser.role,
        subscription_plan: editingUser.subscription_plan,
        subscription_expires_at: editingUser.subscription_expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingUser.id)

    if (error) {
      console.error("Erro ao salvar usuário:", error)
      alert("Erro ao salvar: " + error.message)
    } else {
      setSuccessMessage(`Usuário ${editingUser.full_name} atualizado com sucesso!`)
      setTimeout(() => setSuccessMessage(null), 3000)
      loadUsers()
      setEditingUser(null)
    }
    setIsSaving(false)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        )
      case "instructor":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Sparkles className="w-3 h-3 mr-1" />
            Instrutor
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            Usuário
          </Badge>
        )
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "pro":
        return (
          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            PRO
          </Badge>
        )
      case "basic":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Sparkles className="w-3 h-3 mr-1" />
            Básico
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-600 border-gray-200">
            Gratuito
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-gray-500">Gerencie os usuários da plataforma</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{users.length} usuários cadastrados</span>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-medium">
                          {user.full_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "?"}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || "Sem nome"}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getPlanBadge(user.subscription_plan)}</TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere as permissões e o plano do usuário
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-4 py-4">
              {/* User Info (Read-only) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                    {editingUser.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "?"}
                  </div>
                  <div>
                    <p className="font-semibold">{editingUser.full_name}</p>
                    <p className="text-sm text-gray-500">{editingUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label>Permissão (Role)</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: "user" | "admin" | "instructor") =>
                    setEditingUser({ ...editingUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Usuário
                      </div>
                    </SelectItem>
                    <SelectItem value="instructor">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        Instrutor
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-500" />
                        Administrador
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Administradores têm acesso total ao painel admin
                </p>
              </div>

              {/* Subscription Plan */}
              <div className="space-y-2">
                <Label>Plano de Assinatura</Label>
                <Select
                  value={editingUser.subscription_plan}
                  onValueChange={(value: "free" | "basic" | "pro") =>
                    setEditingUser({ ...editingUser, subscription_plan: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">
                      <div className="flex items-center gap-2">
                        Gratuito
                      </div>
                    </SelectItem>
                    <SelectItem value="basic">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        Básico
                      </div>
                    </SelectItem>
                    <SelectItem value="pro">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        PRO
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subscription Expiry */}
              {editingUser.subscription_plan !== "free" && (
                <div className="space-y-2">
                  <Label>Validade da Assinatura</Label>
                  <Input
                    type="date"
                    value={
                      editingUser.subscription_expires_at
                        ? editingUser.subscription_expires_at.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        subscription_expires_at: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={saveUser} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



