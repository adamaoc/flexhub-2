"use client";

import { useSession } from "next-auth/react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Filter,
  X,
  MessageSquare,
  Globe,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface ContactSubmissionData {
  id: string;
  contactFormField: {
    fieldName: string;
    fieldLabel: string;
    fieldType: string;
  };
  value: string;
}

interface ContactSubmission {
  id: string;
  site: {
    id: string;
    name: string;
    domain: string;
  };
  contactForm: {
    id: string;
    name: string;
  };
  submitterIp: string | null;
  submitterUserAgent: string | null;
  isRead: boolean;
  isArchived: boolean;
  submissionData: ContactSubmissionData[];
  submittedAt: string;
}

interface Site {
  id: string;
  name: string;
  domain: string;
  _count: {
    contactSubmissions: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminMessagesPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    siteId: "all",
    isRead: "all",
  });
  const [selectedSubmission, setSelectedSubmission] =
    useState<ContactSubmission | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.siteId && filters.siteId !== "all")
        params.append("siteId", filters.siteId);
      if (filters.isRead && filters.isRead !== "all")
        params.append("isRead", filters.isRead);

      const response = await fetch(`/api/admin/contact-submissions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.submissions);
        setSites(data.sites);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || "Failed to fetch submissions");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load contact submissions");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ siteId: "all", isRead: "all" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFieldValue = (submission: ContactSubmission, fieldName: string) => {
    const field = submission.submissionData.find(
      (data) => data.contactFormField.fieldName === fieldName
    );
    return field?.value || "";
  };

  const getSubmissionPreview = (submission: ContactSubmission) => {
    // Try to get common fields for preview
    const name =
      getFieldValue(submission, "firstName") ||
      getFieldValue(submission, "name") ||
      "Anonymous";
    const email = getFieldValue(submission, "email") || "No email";
    const message =
      getFieldValue(submission, "message") ||
      getFieldValue(submission, "comment") ||
      "No message";

    return {
      name,
      email,
      message: message.substring(0, 100) + (message.length > 100 ? "..." : ""),
    };
  };

  // Check if user has admin access
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Access Denied
            </h1>
            <p className="text-muted-foreground mt-2">
              You don&apos;t have permission to access this page. Admin
              privileges required.
            </p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (loading && submissions.length === 0) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Contact Messages</h1>
            <p className="text-muted-foreground">
              View contact form submissions from all sites with Contact
              Management feature
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading submissions...</p>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground">
            View contact form submissions from all sites with Contact Management
            feature
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <CardTitle>Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Site</label>
                <Select
                  value={filters.siteId}
                  onValueChange={(value) => handleFilterChange("siteId", value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sites</SelectItem>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name} ({site._count.contactSubmissions})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.isRead}
                  onValueChange={(value) => handleFilterChange("isRead", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="false">Unread</SelectItem>
                    <SelectItem value="true">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contact Submissions</CardTitle>
                <CardDescription>
                  {pagination.total} total submissions
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {submissions.filter((s) => !s.isRead).length} unread
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No contact submissions found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Message Preview</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => {
                      const preview = getSubmissionPreview(submission);
                      return (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {submission.site.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {submission.site.domain || "No domain"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {preview.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {preview.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {preview.message}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                submission.isRead ? "secondary" : "default"
                              }
                            >
                              {submission.isRead ? "Read" : "Unread"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {formatDate(submission.submittedAt)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedSubmission(submission)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Contact Submission Details
                                  </DialogTitle>
                                  <DialogDescription>
                                    Submission from {submission.site.name} on{" "}
                                    {formatDate(submission.submittedAt)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Site
                                      </label>
                                      <p className="font-medium">
                                        {submission.site.name}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        IP Address
                                      </label>
                                      <p className="font-mono text-sm">
                                        {submission.submitterIp || "Unknown"}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Form Data
                                    </label>
                                    <div className="mt-2 space-y-2">
                                      {submission.submissionData.map((data) => (
                                        <div
                                          key={data.id}
                                          className="border rounded-lg p-3"
                                        >
                                          <div className="text-sm font-medium text-muted-foreground">
                                            {data.contactFormField.fieldLabel}
                                          </div>
                                          <div className="mt-1">
                                            {data.value || (
                                              <span className="text-muted-foreground">
                                                No value
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{" "}
                      of {pagination.total} submissions
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: prev.page - 1,
                          }))
                        }
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: prev.page + 1,
                          }))
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
