import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { JobListingForm } from "../../_components/JobListingForm";

interface EditJobListingPageProps {
  params: Promise<{ jobListingId: string }>;
}

export default async function EditJobListingPage({
  params,
}: EditJobListingPageProps) {
  const { jobListingId } = await params;

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Edit Job Listing</h1>
          <p className="text-muted-foreground">
            Update job listing information
          </p>
        </div>

        <JobListingForm mode="edit" jobListingId={jobListingId} />
      </div>
    </AuthenticatedLayout>
  );
}
