import { useState, useEffect } from 'react'
import { api, type User } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { IconPlus, IconTrash, IconEdit, IconUserShield, IconUser } from '@tabler/icons-react'
import { useWorks } from '@/contexts/WorksContext'

export default function GerenciarUsuarios() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { works } = useWorks()

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'standard' as 'master' | 'standard',
    developerName: ''
  })

  // Lista de desenvolvedores únicos
  const developers = Array.from(new Set(works.map(w => w.developer).filter(Boolean)))

  const loadUsers = async () => {
    try {
      const data = await api.getUsers()
      setUsers(data)
    } catch {
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username || !formData.password) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (formData.role === 'standard' && !formData.developerName) {
      toast.error('Selecione um desenvolvedor para usuário padrão')
      return
    }

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, formData)
        toast.success('Usuário atualizado com sucesso')
      } else {
        await api.createUser(formData)
        toast.success('Usuário criado com sucesso')
      }
      
      setDialogOpen(false)
      resetForm()
      loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar usuário')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return

    try {
      await api.deleteUser(id)
      toast.success('Usuário deletado com sucesso')
      loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao deletar usuário')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      developerName: user.developer_name || ''
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingUser(null)
    setFormData({
      username: '',
      password: '',
      role: 'standard',
      developerName: ''
    })
  }

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Crie e gerencie credenciais de acesso</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Atualize as informações do usuário' : 'Crie um novo usuário para o sistema'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Digite o nome de usuário"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha {editingUser && '(deixe em branco para manter)'}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Digite a senha"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'master' | 'standard') => 
                    setFormData({ ...formData, role: value, developerName: value === 'master' ? '' : formData.developerName })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="master">Master (Administrador)</SelectItem>
                    <SelectItem value="standard">Padrão (Desenvolvedor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'standard' && (
                <div className="space-y-2">
                  <Label htmlFor="developer">Desenvolvedor Associado</Label>
                  <Select
                    value={formData.developerName}
                    onValueChange={(value) => setFormData({ ...formData, developerName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um desenvolvedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {developers.map((dev) => (
                        <SelectItem key={dev} value={dev!}>
                          {dev}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingUser ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            Total de {users.length} usuário(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Desenvolvedor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {user.role === 'master' ? (
                        <IconUserShield className="w-4 h-4 text-primary" />
                      ) : (
                        <IconUser className="w-4 h-4 text-muted-foreground" />
                      )}
                      {user.username}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'master' ? 'default' : 'secondary'}>
                      {user.role === 'master' ? 'Master' : 'Padrão'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.developer_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.active ? 'default' : 'destructive'}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <IconEdit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        disabled={user.username === 'jvxadmin'}
                      >
                        <IconTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
