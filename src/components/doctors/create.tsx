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
import { doctorSchema } from "@/lib/validation/doctorSchema";

interface DoctorFormProps {
  doctor?: z.infer<typeof doctorSchema> & { id: number };
}

const DoctorForm: React.FC<DoctorFormProps> = ({ doctor }) => {
  const [doctors, setDoctors] = useState<{ label: string; value: string }[]>(
    []
  );

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      const formattedDoctors = data.map(
        (user: { id: number; name: string }) => ({
          label: user.name,
          value: user.id.toString(),
        })
      );
      setDoctors(formattedDoctors);
    };
    fetchDoctors();
  }, []);

  const form = useForm<z.infer<typeof doctorSchema>>({
    resolver: zodResolver(doctorSchema),
    defaultValues: doctor || {
      userId: 0,
      availability: "",
      specialization: "",
      fees: 0,
    },
  });

  useEffect(() => {
    if (doctor) {
      form.reset(doctor);
    }
  }, [doctor, form]);

  async function onSubmit(values: z.infer<typeof doctorSchema>) {
    const method = "POST";
    const url = "/api/doctors";

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
              <FormLabel>User</FormLabel>
              <FormControl>
                <Combobox
                  options={doctors}
                  onChange={(value) => field.onChange(parseInt(value, 10))}
                  value={field.value.toString()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availabilty</FormLabel>
              <FormControl>
                <Input placeholder="Monday - friday" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fees</FormLabel>
              <FormControl>
                <Input
                  placeholder="5000"
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    field.onChange(isNaN(value) ? "" : value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization</FormLabel>
              <FormControl>
                <select
                  className="border rounded-md p-2 text-black border-gray-300 bg-blue-100"
                  {...field}
                >
                  <option value="anesthesia">anesthesia</option>                  <option value="dermatology">dermatoloy</option>
                  <option value="dentistry">dentistry</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {doctor ? "Update Doctor" : "Create Doctor"}
        </Button>
      </form>
    </Form>
  );
};

export default DoctorForm;
