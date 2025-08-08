import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { JobBoardManager } from "./JobBoardManager";
import { getCurrentSiteAndFeature } from "@/lib/server-utils";

export async function JobBoardDataProvider() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const { site, isFeatureEnabled, error } = await getCurrentSiteAndFeature(
    session.user.email
  );

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Board
            </CardTitle>
            <CardDescription>
              Manage job listings and company profiles for your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {error === "No sites found" ? "No Site Found" : "Access Error"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {error === "No sites found"
                  ? "You don&apos;t have access to any sites. Contact your administrator to get access to a site."
                  : "There was an error accessing your site. Please try again or contact support."}
              </p>
              <Button variant="outline" disabled>
                Enable Job Board
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isFeatureEnabled) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Board
            </CardTitle>
            <CardDescription>
              Manage job listings and company profiles for your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Job Board Feature Not Enabled
              </h3>
              <p className="text-muted-foreground mb-4">
                The job board feature is not enabled for this site. Contact your
                administrator to enable this feature.
              </p>
              <Button variant="outline" disabled>
                Enable Job Board
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Job Board</h1>
        <p className="text-muted-foreground">
          Manage job listings and company profiles for your site
        </p>
      </div>

      <JobBoardManager siteId={site!.id} />
    </div>
  );
}
