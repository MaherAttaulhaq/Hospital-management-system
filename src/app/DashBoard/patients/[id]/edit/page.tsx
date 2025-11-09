import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NextPage } from "next";
import CreateForm from "@/components/patients/create";
type Props = {
  params: { id: string };
};
const Page: NextPage<Props> = async ({ params }) => {
  const { id } = params; 
  console.log(id);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${id}`
  );
  const patient = await res.json();
  console.log(patient);
  return (
    <div>
      <Card className="w-full max-w-sm mx-auto mt-10">
        <CardHeader>
          <CardTitle>Update patient form</CardTitle>
          <CardDescription>Update the patient form</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateForm patient={patient} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
