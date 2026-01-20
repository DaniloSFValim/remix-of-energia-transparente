import { Button } from '@/components/ui/button';
import { Lightbulb, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
export const Header = () => {
  return <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Lightbulb className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Iluminação Pública - Niterói</h1>
              <p className="text-sm text-muted-foreground">Portal de Transparência</p>
            </div>
          </div>
          <Link to="/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Área Administrativa</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>;
};