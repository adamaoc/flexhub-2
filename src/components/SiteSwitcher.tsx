"use client";

import { useState } from "react";
import { useCurrentSite } from "@/hooks/use-current-site";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function SiteSwitcher() {
  const { currentSite, sites, setCurrentSite } = useCurrentSite();
  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const router = useRouter();

  // Only show the switcher if there are multiple sites
  if (!sites || sites.length <= 1) {
    return null;
  }

  const handleSiteSwitch = async (site: (typeof sites)[0]) => {
    try {
      setIsSwitching(true);

      // Update the local state (this will also update the database)
      await setCurrentSite(site);
      setSwitchModalOpen(false);

      // Refresh the page to ensure server components get the new site
      router.refresh();
    } catch (error) {
      console.error("Error switching site:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Dialog open={switchModalOpen} onOpenChange={setSwitchModalOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="ml-2">
          Switch Site
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch Site</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {sites
            .filter((site) => site.id !== currentSite?.id)
            .map((site) => (
              <Button
                key={site.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSiteSwitch(site)}
                disabled={isSwitching}
              >
                {site.name}
              </Button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
