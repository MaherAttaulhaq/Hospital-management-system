import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NextPage } from "next";
import CreateForm from "@/components/billings/create";
type Props = {
  params: { id: string };
};
const Page: NextPage<Props> = async ({ params }) => {
  const {id} = await params;
  console.log(id);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/billings/${id}`
  );
  const billing = await res.json();
  console.log(billing);
  return (
    <div>
      <Card className="w-full max-w-sm mx-auto mt-10">
        <CardHeader>
          <CardTitle>Update billing form</CardTitle>
          <CardDescription>
            Update the billing form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateForm billing={billing} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
