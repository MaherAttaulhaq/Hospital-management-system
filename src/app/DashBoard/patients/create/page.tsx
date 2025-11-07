import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NextPage } from "next";
import { Label } from "@/components/ui/label";
import Create from "@/components/patients/create";

interface Props {}

const Page: NextPage<Props> = ({}) => {
  return (
    <div>
      <Card className="w-full max-w-sm mx-auto mt-10">
        <CardHeader>
          <CardTitle>Create Patient Account</CardTitle>
          <CardDescription>
            Fill in the details below to create a new patient.
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
