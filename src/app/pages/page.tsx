import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { PagesDataProvider } from "./_components/PagesDataProvider";

export default async function PagesPage() {
  return (
    <AuthenticatedLayout>
      <PagesDataProvider />
    </AuthenticatedLayout>
  );
}
