import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, Plane, Shield } from 'lucide-react';
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
      console.log('Starting roster generation...');
      
      // Get existing assignments to avoid conflicts
      const [existingFlights, existingEvents] = await Promise.all([
        crewService.getFlightAssignments(),
        crewService.getCrewEvents()
      ]);
      
      console.log('Existing assignments:', { flights: existingFlights.length, events: existingEvents.length });
      
      const existingAssignments: RosterAssignment[] = [
        ...existingFlights.map(f => ({
          crewMemberId: f.crewMemberId,
          eventType: 'flight' as const,
          startTime: f.startTime,
          endTime: f.endTime,
          flightNumber: f.flightNumber,
          position: 'Captain' as const // This would need proper mapping in a real system
        })),
        ...existingEvents.map(e => ({
          crewMemberId: e.crewMemberId,
          eventType: e.type === 'OFF' ? 'off' as const : 
                    e.type === 'Office Duty' ? 'office_duty' as const :
                    e.type === 'Standby' ? 'standby' as const : 'off' as const,
          startTime: e.startTime,
          endTime: e.endTime
        }))
      ];
      
      const result = await AutoRosterService.generateAutoRoster(start, end, existingAssignments);
      setGeneratedRoster(result);
      
      const flightCount = result.assignments.filter(a => a.eventType === 'flight').length;
      const violationCount = result.violations.length;
      
      console.log('Roster generated:', { assignments: result.assignments.length, violations: violationCount });
      
      toast({
        title: 'Roster Generated Successfully',
        description: `Generated ${result.assignments.length} assignments (${flightCount} flights) with ${violationCount} compliance issues`,
        variant: violationCount === 0 ? 'default' : 'destructive'
      });
    } catch (error) {
      console.error('Error generating roster:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate roster',
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
      let appliedCount = 0;
      let errorCount = 0;
      
      console.log('Applying roster assignments:', generatedRoster.assignments.length);
      
      // Apply assignments one by one with proper error handling
      for (const assignment of generatedRoster.assignments) {
        try {
          if (assignment.eventType === 'flight') {
            await crewService.addFlightAssignment({
              crewMemberId: assignment.crewMemberId,
              flightNumber: assignment.flightNumber || 'Unknown',
              route: `Auto-generated route for ${assignment.flightNumber}`,
              startTime: assignment.startTime,
              endTime: assignment.endTime,
              duration: (assignment.endTime.getTime() - assignment.startTime.getTime()) / (1000 * 60 * 60),
              type: 'international',
              status: 'scheduled'
            });
            console.log(`Applied flight assignment: ${assignment.flightNumber}`);
          } else {
            const eventTypeMap = {
              'off': 'OFF',
              'office_duty': 'Office Duty',
              'standby': 'Standby',
              'rest': 'OFF'
            } as const;
            
            await crewService.addCrewEvent({
              crewMemberId: assignment.crewMemberId,
              type: eventTypeMap[assignment.eventType] || 'OFF',
              startTime: assignment.startTime,
              endTime: assignment.endTime,
              notes: `Auto-generated ${assignment.eventType} - ${assignment.position || ''}`
            });
            console.log(`Applied crew event: ${assignment.eventType}`);
          }
          appliedCount++;
        } catch (error) {
          console.error('Failed to apply assignment:', assignment, error);
          errorCount++;
        }
      }

      toast({
        title: 'Roster Applied',
        description: `Applied ${appliedCount} of ${generatedRoster.assignments.length} assignments${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
        variant: errorCount > 0 ? 'destructive' : 'default'
      });

      // Clear generated roster after successful application
      if (errorCount === 0) {
        setGeneratedRoster(null);
      }
    } catch (error) {
      console.error('Error applying roster:', error);
      toast({
        title: 'Application Failed',
        description: 'Failed to apply roster assignments to database',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const flightSchedules = AutoRosterService.getFlightSchedules();
  const crewRequirements = AutoRosterService.getCrewRequirementSummary();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Intelligent Auto Roster Generator
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
              {isGenerating ? 'Generating...' : 'Generate Smart Roster'}
            </Button>
            
            {generatedRoster && (
              <Button 
                onClick={handleApplyRoster}
                disabled={isGenerating}
                variant="outline"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Apply to Live Roster
              </Button>
            )}
          </div>

          {/* Crew Requirements Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Daily Crew Requirements
            </h4>
            <div className="grid grid-cols-4 gap-2 text-sm">
              {Object.entries(crewRequirements).map(([role, count]) => (
                <div key={role} className="text-center">
                  <div className="font-semibold text-blue-600">{count}</div>
                  <div className="text-gray-600">{role}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flight Schedules Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Flight Schedule Overview ({flightSchedules.length} routes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flightSchedules.map((flight, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-blue-600">{flight.flightNumber}</div>
                    <div className="text-sm text-gray-600">{flight.sector}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">{flight.frequency}</Badge>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Departure: {flight.departure}</span>
                    <span>Duration: {flight.duration}h</span>
                  </div>
                </div>
                <div className="flex gap-1 text-xs">
                  <Badge variant="secondary" className="px-1 py-0">C:{flight.crewRequirement.captains}</Badge>
                  <Badge variant="secondary" className="px-1 py-0">FO:{flight.crewRequirement.firstOfficers}</Badge>
                  <Badge variant="secondary" className="px-1 py-0">CC:{flight.crewRequirement.cabinCrew}</Badge>
                  <Badge variant="secondary" className="px-1 py-0">SCC:{flight.crewRequirement.seniorCabinCrew}</Badge>
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
              Generated Roster Analysis ({generatedRoster.assignments.length} total assignments)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {generatedRoster.assignments.filter(a => a.eventType === 'flight').length}
                </div>
                <div className="text-sm text-gray-600">Flight Assignments</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {generatedRoster.assignments.filter(a => a.eventType === 'off').length}
                </div>
                <div className="text-sm text-gray-600">Off Days</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {generatedRoster.assignments.filter(a => a.eventType === 'office_duty').length}
                </div>
                <div className="text-sm text-gray-600">Office Duties</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {generatedRoster.violations.length}
                </div>
                <div className="text-sm text-gray-600">Compliance Issues</div>
              </div>
            </div>

            <Separator />

            {/* Detailed Assignment Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-medium mb-2">Assignment Breakdown by Position:</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(
                  generatedRoster.assignments
                    .filter(a => a.eventType === 'flight')
                    .reduce((acc, assignment) => {
                      const key = assignment.position || 'Unknown';
                      acc[key] = (acc[key] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                ).map(([position, count]) => (
                  <div key={position} className="flex justify-between py-1">
                    <span>{position}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {generatedRoster.violations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-semibold">Compliance Issues ({generatedRoster.violations.length})</span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {generatedRoster.violations.slice(0, 10).map((violation, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded border-l-2 border-red-200">
                      {violation}
                    </div>
                  ))}
                  {generatedRoster.violations.length > 10 && (
                    <div className="text-sm text-gray-500 text-center p-2">
                      ... and {generatedRoster.violations.length - 10} more issues
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoRosterGenerator;
