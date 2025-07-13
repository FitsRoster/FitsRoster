
import RosterHeader from '../components/RosterHeader';
import CrewRoster from '../components/CrewRoster';
import LogoutButton from '../components/LogoutButton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        <div className="mb-6 pt-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Flight Crew Roster</h1>
            <p className="text-muted-foreground">Manage flight assignments and crew schedules</p>
          </div>
          <LogoutButton />
        </div>
        
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <ScrollArea className="w-full h-[calc(100vh-200px)]">
            <div className="min-w-max">
              <RosterHeader />
              <CrewRoster />
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Index;
