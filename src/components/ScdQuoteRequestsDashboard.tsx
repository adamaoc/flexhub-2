"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ScdQuoteRequest = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  cleaningType: string;
  status: string;
  createdAt: string;
  scheduledDate?: string;
  quoteAmount?: number;
  confirmationNumber?: string;
};

export default function ScdQuoteRequestsDashboard() {
  const [quoteRequests, setQuoteRequests] = useState<ScdQuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchQuoteRequests();
  }, []);

  const fetchQuoteRequests = async () => {
    try {
      const response = await fetch("/api/admin/scd-quote-requests");
      if (response.ok) {
        const data = await response.json();
        setQuoteRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Failed to fetch quote requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = quoteRequests.filter((request) => {
    const matchesSearch =
      (request.fullName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (request.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONTACTED":
        return "bg-blue-100 text-blue-800";
      case "SCHEDULED":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="p-6">Loading quote requests...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Clean Dallas - Quote Requests</CardTitle>
          <p className="text-sm text-gray-600">
            Read-only view of cleaning service quote requests
          </p>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONTACTED">Contacted</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Canceled</option>
            </select>
            <Button onClick={fetchQuoteRequests} variant="outline">
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {["PENDING", "CONTACTED", "SCHEDULED", "COMPLETED", "CANCELED"].map(
              (status) => {
                const count = quoteRequests.filter(
                  (r) => r.status === status
                ).length;
                return (
                  <Card key={status}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-gray-600">{status}</div>
                    </CardContent>
                  </Card>
                );
              }
            )}
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Quote Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.fullName}</div>
                        {request.confirmationNumber && (
                          <div className="text-sm text-gray-500">
                            #{request.confirmationNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{request.email}</div>
                        {request.phone && (
                          <div className="text-sm text-gray-500">
                            {request.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {request.cleaningType.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {request.quoteAmount ? `$${request.quoteAmount}` : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No quote requests found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
