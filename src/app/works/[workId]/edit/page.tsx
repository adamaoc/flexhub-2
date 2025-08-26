import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { WorkForm } from "../../_components/WorkForm";

interface EditWorkPageProps {
  params: Promise<{ workId: string }>;
}

export default async function EditWorkPage({ params }: EditWorkPageProps) {
  const { workId } = await params;

  return (
    <AuthenticatedLayout>
      <WorkForm mode="edit" workId={workId} />
    </AuthenticatedLayout>
  );
}

