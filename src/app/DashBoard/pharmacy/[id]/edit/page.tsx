import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NextPage } from "next";
import CreatePharmacyItemForm from "@/components/pharmacy/create";
type Props = {
  params: { id: string };
};
const Page: NextPage<Props> = async ({ params }) => {
  const { id } = await params;
  console.log(id);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/pharmacy/${id}`
  );
  const pharmacy = await res.json();
  console.log(pharmacy);
  return (
    <div>
      <Card className="w-full max-w-sm mx-auto mt-10">
        <CardHeader>
          <CardTitle>Update Pharmacy Item</CardTitle>
          <CardDescription>Update the pharmacy item details.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePharmacyItemForm pharmacy={pharmacy} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
