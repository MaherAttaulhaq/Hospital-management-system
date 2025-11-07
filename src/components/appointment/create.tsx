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
import { appointmentSchema } from "@/lib/validation/appointmentSchema";

const CreateAppointmentForm = () => {
  const [users, setUsers] = useState<{ label: string; value: string }[]>([]);
  const [patients, setPatients] = useState<{ label: string; value: string }[]>(
    []
  );
  const [doctors, setDoctors] = useState<{ label: string; value: string }[]>(
    []
  );

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

    const fetchPatients = async () => {
      const res = await fetch("/api/patients");
      const data = await res.json();
      const formattedPatients = data.map(
        (patient: { id: number; name: string }) => ({
          label: patient.id,
          value: patient.id.toString(),
        })
      );
      setPatients(formattedPatients);
    };

    const fetchDoctors = async () => {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      const formattedDoctors = data.map(
        (doctor: { id: number; name: string }) => ({
          label: doctor.name,
          value: doctor.id.toString(),
        })
      );
      setDoctors(formattedDoctors);
    };

    fetchUsers();
    fetchPatients();
    fetchDoctors();
  }, []);

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      userId: undefined,
      patientId: undefined,
      doctorId: undefined,
      date: "",
      status: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof appointmentSchema>) {
    const method = "POST";
    const url = "/api/appointments";

    const response = fetch(url, {
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
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient</FormLabel>
              <FormControl>
                <Combobox
                  options={patients}
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
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor</FormLabel>
              <FormControl>
                <Combobox
                  options={doctors}
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
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  className="border rounded-md p-2 text-black border-gray-300 bg-blue-100"
                  {...field}
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Create Appointment
        </Button>
      </form>
    </Form>
  );
};

export default CreateAppointmentForm;
