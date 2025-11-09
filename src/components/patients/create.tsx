"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Combobox } from "../ui/comboboxDemo";
import { Input } from "../ui/input";

import { patientSchema } from "@/lib/validation/patientSchema";

interface patientFormProps {
  patient?: z.infer<typeof patientSchema> & { id: number };
}
const CreateForm: React.FC<patientFormProps> = ({ patient }) => {
  const [users, setUsers] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      const formattedUsers = data.map((user: { id: number; name: string }) => ({
        label: user.name,
        value: user.id.toString(),
      }));
      setUsers(formattedUsers);
    };
    fetchUsers();
  }, []);

  const form = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient || {
      userId: undefined,
      dob: "",
      gender: "male",
      medicalHistory: "",
    },
  });
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof patientSchema>) {
    let method = "";
    let url = "";

    if (patient?.id) {
      method = "PUT";
      url = `/api/patients/${patient.id}`;
    } else {
      method = "POST";
      url = "/api/patients";
    }
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    console.log(response);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UserId</FormLabel>
              <FormControl>
                <Combobox
                  options={users}
                  onChange={(value) => {
                    const parsedValue = parseInt(value, 10);
                    if (!isNaN(parsedValue)) {
                      field.onChange(parsedValue);
                    } else {
                      field.onChange(undefined);
                    }
                  }}
                  value={field.value?.toString() || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <select
                  className="border rounded-md p-2 text-black border-gray-300 bg-blue-100"
                  {...field}
                >
                  <option value="Select Gender" disabled>
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DOB</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="medicalHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical History</FormLabel>
              <FormControl>
                <Input placeholder="Medical History" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {patient ? "Update patient" : "Create patient"}
        </Button>
      </form>
    </Form>
  );
};

export default CreateForm;
