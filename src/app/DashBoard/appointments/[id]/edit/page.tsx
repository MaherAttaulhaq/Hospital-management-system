"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CreateAppointmentForm from "@/components/appointment/create";
import { useEffect, useState } from "react";
import { z } from "zod";
import { NextPage } from "next";

// Copied from src/lib/validation/appointmentSchema.ts
type Props = {
   params: Promise<{ id: string }>;
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