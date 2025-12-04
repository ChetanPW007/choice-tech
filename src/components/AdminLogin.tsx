import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdminLoginProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AdminLogin = ({ onClose, onSuccess }: AdminLoginProps) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase
      .from('admin_passwords')
      .select('password')
      .eq('password', password)
      .maybeSingle();

    setIsLoading(false);

    if (data) {
      sessionStorage.setItem('isAdmin', 'true');
      onSuccess();
    } else {
      toast({
        title: 'Access Denied',
        description: 'Invalid admin password',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="card-glow rounded-xl p-6 md:p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <Lock className="w-12 h-12 text-neon-cyan mb-4" />
          <h2 className="font-orbitron text-xl md:text-2xl font-bold neon-text-cyan">
            ADMIN ACCESS
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-secondary/50 border-border/50 text-foreground font-rajdhani text-lg h-12"
          />
          <Button
            type="submit"
            disabled={isLoading || !password}
            className="w-full btn-glow-green py-3 font-orbitron text-lg rounded-lg"
          >
            {isLoading ? 'VERIFYING...' : 'ACCESS'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
