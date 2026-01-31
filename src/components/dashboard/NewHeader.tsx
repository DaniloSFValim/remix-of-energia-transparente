import { Button } from '@/components/ui/button';
import { Lightbulb, LayoutDashboard, MapPin, Sun, Moon, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

export const NewHeader = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
              <Sun className={`h-4 w-4 transition-colors ${!isDark ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
              />
              <Moon className={`h-4 w-4 transition-colors ${isDark ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
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
