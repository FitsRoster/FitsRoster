
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';

const LogoutButton = () => {
  const { logout, currentUser } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Success',
        description: 'Successfully logged out',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">
        Welcome, {currentUser?.email}
      </span>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
};

export default LogoutButton;
