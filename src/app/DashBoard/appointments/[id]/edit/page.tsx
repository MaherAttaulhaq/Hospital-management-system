import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NextPage } from "next";
import CreateAppointmentForm from "@/components/appointment/create";
type Props = {
  params: { id: string };
};
const Page: NextPage<Props> = async ({ params }) => {
  const {id} = await params;
  console.log(id);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`
  );
  const appointment = await res.json();
  console.log(appointment);
  return (
    <div>
      <Card className="w-full max-w-sm mx-auto mt-10">
        <CardHeader>
          <CardTitle>Update appointment form</CardTitle>
          <CardDescription>Update the appointment form</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateAppointmentForm appointment={appointment} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
