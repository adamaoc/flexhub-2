'use client';

import { useState } from 'react';
import { useCurrentSite } from '@/hooks/use-current-site';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function SiteSwitcher() {
  const { currentSite, sites, setCurrentSite } = useCurrentSite();
  const [switchModalOpen, setSwitchModalOpen] = useState(false);

  // Only show the switcher if there are multiple sites
  if (!sites || sites.length <= 1) {
    return null;
  }

  return (
    <Dialog open={switchModalOpen} onOpenChange={setSwitchModalOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="ml-2">Switch Site</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch Site</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {sites.filter(site => site.id !== currentSite?.id).map(site => (
            <Button
              key={site.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setCurrentSite(site);
                setSwitchModalOpen(false);
              }}
            >
              {site.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 