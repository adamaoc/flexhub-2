"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WysiwygEditor } from "@/components/ui/wysiwyg-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useCurrentSite } from "@/hooks/use-current-site";

interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface JobListingFormProps {
  mode: "create" | "edit";
  jobListingId?: string;
}

export function JobListingForm({ mode, jobListingId }: JobListingFormProps) {
  const router = useRouter();
  const { currentSite } = useCurrentSite();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    benefits: "",
    jobType: "",
    experienceLevel: "",
    remoteWorkType: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    location: "",
    applicationUrl: "",
    image: "",
    companyId: "",
    expiresAt: "",
  });

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch(`/api/sites/${currentSite?.id}/companies`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  }, [currentSite?.id]);

  const fetchJobListing = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/sites/${currentSite?.id}/job-listings/${jobListingId}`
      );
      if (response.ok) {
        const jobListing = await response.json();
        setFormData({
          title: jobListing.title,
          description: jobListing.description,
          requirements: jobListing.requirements || "",
          benefits: jobListing.benefits || "",
          jobType: jobListing.jobType,
          experienceLevel: jobListing.experienceLevel || "",
          remoteWorkType: jobListing.remoteWorkType || "",
          salaryMin: jobListing.salaryMin?.toString() || "",
          salaryMax: jobListing.salaryMax?.toString() || "",
          salaryCurrency: jobListing.salaryCurrency,
          location: jobListing.location || "",
          applicationUrl: jobListing.applicationUrl || "",
          image: jobListing.image || "",
          companyId: jobListing.companyId,
          expiresAt: jobListing.expiresAt || "",
        });
      }
    } catch (error) {
      console.error("Error fetching job listing:", error);
    } finally {
      setLoading(false);
    }
  }, [currentSite?.id, jobListingId]);

  useEffect(() => {
    fetchCompanies();
    if (mode === "edit" && jobListingId) {
      fetchJobListing();
    }
  }, [mode, jobListingId, fetchCompanies, fetchJobListing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url =
        mode === "create"
          ? `/api/sites/${currentSite?.id}/job-listings`
          : `/api/sites/${currentSite?.id}/job-listings/${jobListingId}`;

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          expiresAt: formData.expiresAt || null,
        }),
      });

      if (response.ok) {
        router.push("/job-board");
      } else {
        console.error("Error saving job listing");
      }
    } catch (error) {
      console.error("Error saving job listing:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/job-board")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Board
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter job title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Job Description *</Label>
                <WysiwygEditor
                  value={formData.description}
                  onChange={(value) =>
                    setFormData({ ...formData, description: value })
                  }
                  placeholder="Enter detailed job description"
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, jobType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full Time</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                      <SelectItem value="FREELANCE">Freelance</SelectItem>
                      <SelectItem value="TEMPORARY">Temporary</SelectItem>
                      <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="companyId">Company *</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, companyId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={(value) =>
                      setFormData({ ...formData, experienceLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRY_LEVEL">Entry Level</SelectItem>
                      <SelectItem value="JUNIOR">Junior</SelectItem>
                      <SelectItem value="MID_LEVEL">Mid Level</SelectItem>
                      <SelectItem value="SENIOR">Senior</SelectItem>
                      <SelectItem value="EXECUTIVE">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="remoteWorkType">Remote Work Type</Label>
                  <Select
                    value={formData.remoteWorkType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, remoteWorkType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select remote work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ON_SITE">On Site</SelectItem>
                      <SelectItem value="REMOTE">Remote</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Salary Min</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryMin: e.target.value })
                    }
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax">Salary Max</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryMax: e.target.value })
                    }
                    placeholder="80000"
                  />
                </div>
                <div>
                  <Label htmlFor="salaryCurrency">Currency</Label>
                  <Select
                    value={formData.salaryCurrency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, salaryCurrency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <Label htmlFor="applicationUrl">Application URL</Label>
                  <Input
                    id="applicationUrl"
                    value={formData.applicationUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicationUrl: e.target.value,
                      })
                    }
                    placeholder="https://example.com/apply"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image">Job Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/job-image.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Requirements and Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements & Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <WysiwygEditor
                  value={formData.requirements}
                  onChange={(value) =>
                    setFormData({ ...formData, requirements: value })
                  }
                  placeholder="Enter job requirements"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="benefits">Benefits</Label>
                <WysiwygEditor
                  value={formData.benefits}
                  onChange={(value) =>
                    setFormData({ ...formData, benefits: value })
                  }
                  placeholder="Enter job benefits"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="expiresAt">Expires At</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/job-board")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                saving ||
                !formData.title ||
                !formData.description ||
                !formData.jobType ||
                !formData.companyId
              }
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === "create"
                    ? "Create Job Listing"
                    : "Update Job Listing"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
