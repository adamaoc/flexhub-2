import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { WorkForm } from "../_components/WorkForm";

export default function CreateWorkPage() {
  return (
    <AuthenticatedLayout>
      <WorkForm mode="create" />
    </AuthenticatedLayout>
  );
}

