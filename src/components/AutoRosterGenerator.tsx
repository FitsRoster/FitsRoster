
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, Plane } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AutoRosterService } from '../services/autoRosterService';
import { RosterAssignment } from '../types/rosterTypes';
import { crewService } from '../services/crewService';

const AutoRosterGenerator = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoster, setGeneratedRoster] = useState<{
    assignments: RosterAssignment[];
    violations: string[];
  } | null>(null);

  const handleGenerateRoster = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Please select both start and end dates',
        variant: 'destructive',
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      toast({
        title: 'Error',
        description: 'End date must be after start date',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating auto roster for period:', start, 'to', end);
      const result = await AutoRosterService.generateAutoRoster(start, end);
      setGeneratedRoster(result);
      
      toast({
        title: 'Roster Generated',
        description: `Generated ${result.assignments.length} assignments with ${result.violations.length} violations`,
      });
    } catch (error) {
      console.error('Error generating roster:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate roster',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyRoster = async () => {
    if (!generatedRoster) return;

    setIsGenerating(true);
    try {
      // Convert roster assignments to crew events/flight assignments
      for (const assignment of generatedRoster.assignments) {
        if (assignment.eventType === 'flight') {
          // Create flight assignment
          await crewService.addFlightAssignment({
            crewMemberId: assignment.crewMemberId,
            flightNumber: assignment.flightNumber || 'Unknown',
            route: 'Auto-generated',
            startTime: assignment.startTime,
            endTime: assignment.endTime,
            duration: (assignment.endTime.getTime() - assignment.startTime.getTime()) / (1000 * 60 * 60),
            type: 'domestic',
            status: 'scheduled'
          });
        } else {
          // Create crew event
          await crewService.addCrewEvent({
            crewMemberId: assignment.crewMemberId,
            type: assignment.eventType === 'off' ? 'OFF' : 
                  assignment.eventType === 'office_duty' ? 'Office Duty' :
                  assignment.eventType === 'standby' ? 'Standby' : 'OFF',
            startTime: assignment.startTime,
            endTime: assignment.endTime,
            notes: `Auto-generated ${assignment.eventType}`
          });
        }
      }

      toast({
        title: 'Roster Applied',
        description: `Applied ${generatedRoster.assignments.length} assignments to the roster`,
      });

      setGeneratedRoster(null);
    } catch (error) {
      console.error('Error applying roster:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply roster',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const flightSchedules = AutoRosterService.getFlightSchedules();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Auto Roster Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateRoster} 
              disabled={isGenerating || !startDate || !endDate}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Roster'}
            </Button>
            
            {generatedRoster && (
              <Button 
                onClick={handleApplyRoster}
                disabled={isGenerating}
                variant="outline"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Apply to Roster
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Flight Schedules Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Flight Schedules Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flightSchedules.map((flight, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{flight.flightNumber}</div>
                    <div className="text-sm text-gray-600">{flight.sector}</div>
                  </div>
                  <Badge variant="outline">{flight.frequency}</Badge>
                </div>
                <div className="text-sm">
                  <div>Departure: {flight.departure} | Arrival: {flight.arrival}</div>
                  <div>Duration: {flight.duration}h</div>
                </div>
                <div className="flex gap-2 text-xs">
                  <Badge variant="secondary">C: {flight.crewRequirement.captains}</Badge>
                  <Badge variant="secondary">FO: {flight.crewRequirement.firstOfficers}</Badge>
                  <Badge variant="secondary">CC: {flight.crewRequirement.cabinCrew}</Badge>
                  <Badge variant="secondary">SCC: {flight.crewRequirement.seniorCabinCrew}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Roster Results */}
      {generatedRoster && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Generated Roster Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {generatedRoster.assignments.filter(a => a.eventType === 'flight').length}
                </div>
                <div className="text-sm text-gray-600">Flight Assignments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {generatedRoster.assignments.filter(a => a.eventType === 'off').length}
                </div>
                <div className="text-sm text-gray-600">Off Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {generatedRoster.assignments.filter(a => a.eventType === 'office_duty').length}
                </div>
                <div className="text-sm text-gray-600">Office Duties</div>
              </div>
            </div>

            <Separator />

            {generatedRoster.violations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-semibold">Violations ({generatedRoster.violations.length})</span>
                </div>
                <div className="space-y-1">
                  {generatedRoster.violations.slice(0, 10).map((violation, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {violation}
                    </div>
                  ))}
                  {generatedRoster.violations.length > 10 && (
                    <div className="text-sm text-gray-500">
                      ... and {generatedRoster.violations.length - 10} more violations
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <div className="font-medium mb-2">Assignment Summary:</div>
              <div className="space-y-1">
                {Object.entries(
                  generatedRoster.assignments.reduce((acc, assignment) => {
                    acc[assignment.eventType] = (acc[assignment.eventType] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{type.replace('_', ' ')}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoRosterGenerator;
