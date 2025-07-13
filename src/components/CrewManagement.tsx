
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserPlus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { crewService, CrewMember } from '../services/crewService';

const CrewManagement = () => {
  const { toast } = useToast();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCrew, setNewCrew] = useState({
    name: '',
    role: 'Flight Attendant' as 'Captain' | 'First Officer' | 'Flight Attendant',
    totalFlightHours: 0,
    totalDutyHours: 0,
    restHours: 12,
    certifications: [] as string[]
  });

  useEffect(() => {
    loadCrewMembers();
  }, []);

  const loadCrewMembers = async () => {
    setLoading(true);
    try {
      const members = await crewService.getCrewMembers();
      setCrewMembers(members);
    } catch (error) {
      console.error('Error loading crew members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load crew members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCrew.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter crew member name',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await crewService.addCrewMember({
        name: newCrew.name.trim(),
        role: newCrew.role,
        totalFlightHours: newCrew.totalFlightHours,
        totalDutyHours: newCrew.totalDutyHours,
        restHours: newCrew.restHours,
        certifications: newCrew.certifications.filter(cert => cert.trim() !== '')
      });

      toast({
        title: 'Success',
        description: `${newCrew.name} has been added to the crew roster`,
      });

      setNewCrew({
        name: '',
        role: 'Flight Attendant',
        totalFlightHours: 0,
        totalDutyHours: 0,
        restHours: 12,
        certifications: []
      });
      
      setIsAddDialogOpen(false);
      await loadCrewMembers();
    } catch (error) {
      console.error('Error adding crew member:', error);
      toast({
        title: 'Error',
        description: 'Failed to add crew member',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCertificationChange = (value: string) => {
    const certs = value.split(',').map(cert => cert.trim()).filter(cert => cert !== '');
    setNewCrew({ ...newCrew, certifications: certs });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Captain':
        return 'bg-yellow-500';
      case 'First Officer':
        return 'bg-blue-500';
      case 'Flight Attendant':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Crew Management ({crewMembers.length} members)
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Crew Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Crew Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddCrew} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newCrew.name}
                      onChange={(e) => setNewCrew({ ...newCrew, name: e.target.value })}
                      placeholder="Enter crew member name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newCrew.role} onValueChange={(value: 'Captain' | 'First Officer' | 'Flight Attendant') => setNewCrew({ ...newCrew, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Captain">Captain</SelectItem>
                        <SelectItem value="First Officer">First Officer</SelectItem>
                        <SelectItem value="Flight Attendant">Flight Attendant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flightHours">Total Flight Hours</Label>
                      <Input
                        id="flightHours"
                        type="number"
                        min="0"
                        value={newCrew.totalFlightHours}
                        onChange={(e) => setNewCrew({ ...newCrew, totalFlightHours: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dutyHours">Total Duty Hours</Label>
                      <Input
                        id="dutyHours"
                        type="number"
                        min="0"
                        value={newCrew.totalDutyHours}
                        onChange={(e) => setNewCrew({ ...newCrew, totalDutyHours: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restHours">Rest Hours</Label>
                    <Input
                      id="restHours"
                      type="number"
                      min="0"
                      max="24"
                      value={newCrew.restHours}
                      onChange={(e) => setNewCrew({ ...newCrew, restHours: parseInt(e.target.value) || 12 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                    <Input
                      id="certifications"
                      value={newCrew.certifications.join(', ')}
                      onChange={(e) => handleCertificationChange(e.target.value)}
                      placeholder="e.g., A320, A330, Safety, Service"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Crew Member'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading crew members...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crewMembers.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{member.name}</h3>
                      <Badge className={`${getRoleColor(member.role)} text-white`}>
                        {member.role}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Flight Hours:</span>
                        <span>{member.totalFlightHours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duty Hours:</span>
                        <span>{member.totalDutyHours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rest Hours:</span>
                        <span>{member.restHours}</span>
                      </div>
                    </div>

                    {member.certifications.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Certifications:</div>
                        <div className="flex flex-wrap gap-1">
                          {member.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrewManagement;
