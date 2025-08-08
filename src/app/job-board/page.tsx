import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { JobBoardDataProvider } from "./_components/JobBoardDataProvider";

export default async function JobBoardPage() {
  return (
    <AuthenticatedLayout>
      <JobBoardDataProvider />
    </AuthenticatedLayout>
  );
}
