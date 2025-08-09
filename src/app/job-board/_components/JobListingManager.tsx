"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Calendar,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface JobListing {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  jobType: string;
  status: string;
  experienceLevel?: string;
  remoteWorkType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  location?: string;
  applicationUrl?: string;
  image?: string;
  companyId: string;
  expiresAt?: string;
  company: Company;
  createdAt: string;
  updatedAt: string;
}

interface JobListingManagerProps {
  siteId: string;
}

export function JobListingManager({ siteId }: JobListingManagerProps) {
  const router = useRouter();
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (siteId) {
      setCurrentPage(1);
    }
  }, [siteId]);

  const fetchJobListings = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/sites/${siteId}/job-listings?page=${page}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setJobListings(data.jobListings || []);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
        setCurrentPage(data.pagination.page);
      }
    } catch (error) {
      console.error("Error fetching job listings:", error);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (siteId) {
      fetchJobListings(currentPage);
    }
  }, [siteId, currentPage, fetchJobListings]);

  const handleEditJobListing = (jobListing: JobListing) => {
    router.push(`/job-board/${jobListing.id}/edit`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "EXPIRED":
        return <Badge variant="destructive">Expired</Badge>;
      case "FILLED":
        return <Badge variant="outline">Filled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Job Listings</h3>
          <p className="text-sm text-muted-foreground">
            Manage job listings for your site
          </p>
        </div>
        <Button onClick={() => router.push("/job-board/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Job Listing
        </Button>
      </div>

      <div className="rounded-md border">
        {jobListings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No job listings yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first job listing to get started.
            </p>
            <Button onClick={() => router.push("/job-board/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Job Listing
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobListings.map((jobListing) => (
                <TableRow
                  key={jobListing.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleEditJobListing(jobListing)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {jobListing.image && (
                        <img
                          src={jobListing.image}
                          alt={jobListing.title}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <span
                        className="truncate max-w-[200px]"
                        title={jobListing.title}
                      >
                        {jobListing.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span
                        className="truncate max-w-[150px]"
                        title={jobListing.company.name}
                      >
                        {jobListing.company.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {jobListing.jobType.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {jobListing.location ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span
                          className="truncate max-w-[120px]"
                          title={jobListing.location}
                        >
                          {jobListing.location}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Remote
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(jobListing.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(jobListing.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination Controls */}
      {jobListings.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * 20 + 1} to{" "}
            {Math.min(currentPage * 20, totalItems)} of {totalItems} job
            listings
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
