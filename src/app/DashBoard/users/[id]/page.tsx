"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { CreditCard, SquarePen } from "lucide-react";
import { NextPage } from "next";
import { use, useState, useEffect} from "react";

interface Props {
  params: Promise<{ id: string }>;
}

const Page: NextPage<Props> =  ({ params }) => {
  // Mock data to populate the card
  const { id } = use(params);

  const [data, setData] = useState({
    id:0,
    notes:"",
    name:"",
    email:"",
    role:"",
  });
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `/api/users/${id}`
      );
      const data = await res.json();
      setData(data);
      console.log(data);
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-lg mx-auto mt-10">
      <Card>
        {/* Card Header */}
        <CardHeader>
          <CardTitle>Order {data.id}</CardTitle>
          <CardDescription>Name is {data.name}</CardDescription>
        </CardHeader>

        {/* Card Content */}
        <CardContent>
          <Separator className="mb-4" />

          {/* Customer Info Section */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">
                Customer Information
              </h3>
              <p className="text-gray-500 text-sm">{data.name}</p>
              <p className="text-gray-500 text-sm">{data.email}</p>
              <p className="text-gray-500 text-sm">{data.role}</p>
            </div>
          </div>

          {/* Payment Method Card/Box */}
          <div className="bg-gray-50 flex items-center justify-between rounded-md border p-4 shadow-sm">
            <div className="space-y-1">
              <h4 className="font-medium text-gray-900">Payment Method</h4>
              <div className="text-gray-500 flex items-center gap-2 text-sm">
                <CreditCard
                  className="size-4 text-gray-400"
                  aria-hidden="true"
                />
                {data.role}
              </div>
            </div>
            <Button variant="outline" className="shrink-0">
              <SquarePen className="size-4" aria-hidden="true" />
              <span className="sr-only">Edit</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
