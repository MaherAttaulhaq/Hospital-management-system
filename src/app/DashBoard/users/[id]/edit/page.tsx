import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Create from "@/components/users/create";
import { NextPage } from "next";

type Props = {
  params: { id: string };
};
const Page: NextPage<Props> = async ({ params }) => {
  const {id} = params;
  console.log(id);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`
  );
  const user = await res.json();
  console.log(user);
  return (
    <div>
      <Card className="w-full max-w-sm mx-auto mt-10">
        <CardHeader>
          <CardTitle>Update Users</CardTitle>
          <CardDescription>
            Update the user details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Create user={user} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
