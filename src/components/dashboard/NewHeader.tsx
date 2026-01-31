import { Button } from '@/components/ui/button';
import { Lightbulb, LayoutDashboard, MapPin, Sun, Moon, User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const NewHeader = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">
                Secretaria de Conservação e Serviços Públicos - SECONSER
              </h1>
              <p className="text-xs text-muted-foreground">Diretoria de Iluminação Pública</p>
            </div>
          </div>

          {/* Navegação Central */}
          <div className="hidden md:flex items-center gap-1">
            <Button variant="default" size="sm" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Mapa
            </Button>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
