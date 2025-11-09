import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NextPage } from "next";
import DoctorForm from "@/components/doctors/create";
type Props = {
  params: { id: string };
};
const Page: NextPage<Props> = async ({ params }) => {
  const { id } = params;
  console.log(id);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/${id}`
  );
  const doctor = await res.json();
  console.log(doctor);
  return (
    <div>
      <Card className="w-full max-w-sm mx-auto mt-10">
        <CardHeader>
          <CardTitle>Update doctor form</CardTitle>
          <CardDescription>Update the doctor form</CardDescription>
        </CardHeader>
        <CardContent>
          <DoctorForm doctor={doctor} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
