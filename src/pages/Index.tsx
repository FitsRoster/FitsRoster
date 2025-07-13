import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RosterHeader from "../components/RosterHeader";
import CrewRoster from "../components/CrewRoster";
import AutoRosterGenerator from "../components/AutoRosterGenerator";
import CrewManagement from "../components/CrewManagement";
import LogoutButton from "../components/LogoutButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Airline Crew Roster</h1>
        <LogoutButton />
      </div>
      
      <div className="container mx-auto p-4">
        <Tabs defaultValue="roster" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roster">Current Roster</TabsTrigger>
            <TabsTrigger value="auto-roster">Auto Roster Generator</TabsTrigger>
            <TabsTrigger value="crew-management">Crew Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="roster" className="space-y-4">
            <div className="bg-white rounded-lg shadow">
              <RosterHeader />
              <CrewRoster />
            </div>
          </TabsContent>
          
          <TabsContent value="auto-roster">
            <AutoRosterGenerator />
          </TabsContent>
          
          <TabsContent value="crew-management">
            <CrewManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
