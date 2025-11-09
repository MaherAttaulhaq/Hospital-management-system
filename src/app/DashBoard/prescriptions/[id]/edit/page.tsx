import Create from "@/components/prescriptions/create";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NextPage } from "next";
type Props = {
  params: { id: string };
};
const Page: NextPage<Props> = async ({ params }) => {
  const { id } = await params;
  console.log(id);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions/${id}`
  );
  const prescription = await res.json();
  console.log(prescription);
  return (
    <div>
      <Card className="w-full max-w-sm mx-auto mt-10">
        <CardHeader>
          <CardTitle>Update prescription Item</CardTitle>
          <CardDescription>
            Update the prescription item details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Create prescription={prescription} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
