import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { JobListingForm } from "../_components/JobListingForm";

export default function CreateJobListingPage() {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create Job Listing</h1>
          <p className="text-muted-foreground">
            Add a new job listing to your site
          </p>
        </div>

        <JobListingForm mode="create" />
      </div>
    </AuthenticatedLayout>
  );
}
