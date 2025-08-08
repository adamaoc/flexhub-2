"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Briefcase } from "lucide-react";
import { CompanyManager } from "./CompanyManager";
import { JobListingManager } from "./JobListingManager";

interface JobBoardManagerProps {
  siteId: string;
}

export function JobBoardManager({ siteId }: JobBoardManagerProps) {
  const [activeTab, setActiveTab] = useState("jobs");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Board Management
          </CardTitle>
          <CardDescription>
            Manage companies and job listings for your site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Listings
              </TabsTrigger>
              <TabsTrigger
                value="companies"
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Companies
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="mt-6">
              <JobListingManager siteId={siteId} />
            </TabsContent>
            <TabsContent value="companies" className="mt-6">
              <CompanyManager siteId={siteId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
