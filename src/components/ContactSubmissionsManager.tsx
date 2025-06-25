'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCurrentSite } from '@/hooks/use-current-site';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Archive, Trash2, Filter, X } from "lucide-react";
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
  submitterIp: string;
  submitterUserAgent: string;
  isRead: boolean;
  isArchived: boolean;
  submittedAt: string;
  submissionData: ContactSubmissionData[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ContactSubmissionsManager() {
  const { currentSite } = useCurrentSite();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    isRead: '',
    isArchived: '',
    search: ''
  });


  const fetchSubmissions = useCallback(async () => {
    if (!currentSite) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.isRead) params.append('isRead', filters.isRead);
      if (filters.isArchived) params.append('isArchived', filters.isArchived);

      const response = await fetch(`/api/sites/${currentSite.id}/contact-submissions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.submissions);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  }, [currentSite, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    if (currentSite) {
      fetchSubmissions();
    }
  }, [currentSite, fetchSubmissions]);

  const updateSubmission = async (submissionId: string, updates: Partial<ContactSubmission>) => {
    if (!currentSite) return;

    try {
      const response = await fetch(`/api/sites/${currentSite.id}/contact-submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(prev => 
          prev.map(s => s.id === submissionId ? data.submission : s)
        );
        toast.success('Submission updated successfully');
      } else {
        throw new Error('Failed to update submission');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    if (!currentSite) return;
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/sites/${currentSite.id}/contact-submissions/${submissionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
        toast.success('Submission deleted successfully');
      } else {
        throw new Error('Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
    }
  };

  const markAsRead = (submissionId: string) => {
    updateSubmission(submissionId, { isRead: true });
  };

  const toggleArchive = (submission: ContactSubmission) => {
    updateSubmission(submission.id, { isArchived: !submission.isArchived });
  };

  const getFieldValue = (submission: ContactSubmission, fieldName: string) => {
    const fieldData = submission.submissionData.find(
      data => data.contactFormField.fieldName === fieldName
    );
    return fieldData?.value || '';
  };

  const getSubmissionPreview = (submission: ContactSubmission) => {
    const firstName = getFieldValue(submission, 'firstName');
    const lastName = getFieldValue(submission, 'lastName');
    const email = getFieldValue(submission, 'email');
    const message = getFieldValue(submission, 'message');

    const name = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
    const preview = message.substring(0, 100) + (message.length > 100 ? '...' : '');
    
    return { name, email, preview };
  };

  const clearFilters = () => {
    setFilters({
      isRead: '',
      isArchived: '',
      search: ''
    });
  };

  if (loading && submissions.length === 0) {
    return <div>Loading contact submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Submissions</h2>
          <p className="text-muted-foreground">
            View and manage contact form submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {pagination.total} total submissions
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={filters.isRead}
              onValueChange={(value) => setFilters(prev => ({ ...prev, isRead: value }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Read Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Read</SelectItem>
                <SelectItem value="false">Unread</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isArchived}
              onValueChange={(value) => setFilters(prev => ({ ...prev, isArchived: value }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Archive Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Active</SelectItem>
                <SelectItem value="true">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search submissions..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="max-w-sm"
            />

            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Message Preview</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => {
                const preview = getSubmissionPreview(submission);
                return (
                  <TableRow 
                    key={submission.id}
                    className={!submission.isRead ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{preview.name}</div>
                        {preview.email && (
                          <div className="text-sm text-muted-foreground">{preview.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm">{preview.preview}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!submission.isRead && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                        {submission.isArchived && (
                          <Badge variant="secondary" className="text-xs">Archived</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (!submission.isRead) {
                                  markAsRead(submission.id);
                                }
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Contact Submission Details</DialogTitle>
                              <DialogDescription>
                                Submitted on {new Date(submission.submittedAt).toLocaleString()}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {submission.submissionData.map((data) => (
                                <div key={data.id}>
                                  <h4 className="font-medium">{data.contactFormField.fieldLabel}</h4>
                                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                    {data.value || 'No value provided'}
                                  </p>
                                </div>
                              ))}
                              <div className="flex gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => toggleArchive(submission)}
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  {submission.isArchived ? 'Unarchive' : 'Archive'}
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => deleteSubmission(submission.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleArchive(submission)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubmission(submission.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {submissions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No contact submissions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} submissions
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 