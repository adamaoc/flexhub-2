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
import { format } from "date-fns";

type DevisionBooking = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  eventDate: string;
  eventType: string;
  location?: string;
  description: string;
  howDidYouHear?: string;
  preferredContact: string;
  status: string;
  contacted: boolean;
  completed: boolean;
  confirmationNumber?: string;
  notes?: string;
  quoteAmount?: number;
  quoteSent: boolean;
  quoteSentAt?: string;
  depositPaid: boolean;
  depositAmount?: number;
  finalPaymentPaid: boolean;
  finalPaymentAmount?: number;
  createdAt: string;
  updatedAt: string;
};

export default function DevisionBookingsDashboard() {
  const [bookings, setBookings] = useState<DevisionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/devision-bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.fullName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (booking.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (booking.confirmationNumber?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesStatus =
      statusFilter === "ALL" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONTACTED":
        return "bg-blue-100 text-blue-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "DEPOSIT_PAID":
        return "bg-purple-100 text-purple-800";
      case "SCHEDULED":
        return "bg-indigo-100 text-indigo-800";
      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "NO_SHOW":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return <div className="p-6">Loading bookings...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Devision Media - Bookings</CardTitle>
          <p className="text-sm text-gray-600">
            Read-only view of photography and video production bookings
          </p>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search by name, email, or confirmation number..."
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
              <option value="CONFIRMED">Confirmed</option>
              <option value="DEPOSIT_PAID">Deposit Paid</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
            <Button onClick={fetchBookings} variant="outline">
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[
              "PENDING",
              "CONFIRMED",
              "SCHEDULED",
              "COMPLETED",
              "CANCELLED",
            ].map((status) => {
              const count = bookings.filter((b) => b.status === status).length;
              return (
                <Card key={status}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-600">{status}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Event Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.fullName}</div>
                        {booking.confirmationNumber && (
                          <div className="text-sm text-gray-500">
                            #{booking.confirmationNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {formatEventType(booking.eventType)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(booking.eventDate), "MMM d, yyyy")}
                        </div>
                        {booking.location && (
                          <div className="text-sm text-gray-500">
                            {booking.location}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{booking.email}</div>
                        {booking.phone && (
                          <div className="text-sm text-gray-500">
                            {booking.phone}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Prefers: {booking.preferredContact.toLowerCase()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {booking.quoteAmount && (
                          <div>Quote: ${booking.quoteAmount}</div>
                        )}
                        {booking.depositPaid && (
                          <div className="text-green-600">✓ Deposit Paid</div>
                        )}
                        {booking.finalPaymentPaid && (
                          <div className="text-green-600">✓ Final Paid</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.createdAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No bookings found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
