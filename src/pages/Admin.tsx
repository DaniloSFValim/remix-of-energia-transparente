import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegistroForm } from '@/components/admin/RegistroForm';
import { RegistrosList } from '@/components/admin/RegistrosList';
import { Button } from '@/components/ui/button';
import { RegistroEnergia } from '@/types/energia';
import { Lightbulb, LogOut, Plus, ArrowLeft, Loader2, ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Admin = () => {
  const { isAuthenticated, loading: authLoading, signOut, user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [showForm, setShowForm] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<RegistroEnergia | null>(null);

  const loading = authLoading || roleLoading;

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erro ao sair');
    } else {
      toast.success('Logout realizado com sucesso');
    }
  };

  const handleEdit = (registro: RegistroEnergia) => {
    setEditingRegistro(registro);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingRegistro(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRegistro(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <LoginForm onSuccess={() => {}} />
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <ShieldX className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>
                Você não possui permissão de administrador para acessar esta área.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Entre em contato com um administrador para solicitar acesso.
              </p>
              <div className="flex gap-2 justify-center">
                <Link to="/">
                  <Button variant="outline">Voltar ao Dashboard</Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout}>
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Admin */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Lightbulb className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Área Administrativa</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showForm ? (
          <div className="max-w-2xl mx-auto">
            <RegistroForm
              registro={editingRegistro}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ações */}
            <div className="flex justify-end">
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Registro
              </Button>
            </div>

            {/* Lista de Registros */}
            <RegistrosList onEdit={handleEdit} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
