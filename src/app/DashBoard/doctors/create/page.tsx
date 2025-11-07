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
import Create from "@/components/doctors/create";
type Props = {};
const Page: NextPage<Props> = ({}) => {
  return (
    <div>
      <Card className="w-full max-w-sm mx-auto mt-10">
        <CardHeader>
          <CardTitle>Create doctor account</CardTitle>
          <CardDescription>
            Fill in the details below to create a new user account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Create />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
