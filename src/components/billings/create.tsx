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
import { billingSchema } from "@/lib/validation/billingSchema";
import { billing } from "@/db/schemas";

interface billingFormProps {
  billing?: z.infer<typeof billingSchema> & { id: number };
}
const CreateForm: React.FC<billingFormProps> = ({ billing }) => {
  console.log(billing);
  
  const [users, setUsers] = useState<{ label: string; value: string }[]>([]);
  const [patients, setPatients] = useState<{ label: string; value: string }[]>(
    []
  );
  const [appointments, setAppointments] = useState<
    { label: string; value: string }[]
  >([]);

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

    const fetchAppointments = async () => {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      const formattedAppointments = data.map(
        (appointment: { id: number; date: string }) => ({
          label: new Date(appointment.date).toLocaleDateString(),
          value: appointment.id.toString(),
        })
      );
      setAppointments(formattedAppointments);
    };

    fetchUsers();
    fetchPatients();
    fetchAppointments();
  }, []);

  const form = useForm<z.infer<typeof billingSchema>>({
    resolver: zodResolver(billingSchema),
    defaultValues: billing ||{
      // userId: undefined,
      patientId: undefined,
      appointmentId: undefined,
      amount: undefined,
      status: undefined,
      paymentMethod: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof billingSchema>) {
    let method = "";
    let url = "";

    if (billing?.id) {
      method = "PUT";
      url = `/api/billings/${billing.id}`;
    } else {
      method = "POST";
      url = "/api/billings";
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
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient Id</FormLabel>
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
          name="appointmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointment Id</FormLabel>
              <FormControl>
                <Combobox
                  options={appointments}
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Amount"
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
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <select
                  className="border rounded-md p-2 text-black border-gray-300 bg-blue-100"
                  {...field}
                >
                  <option value="" disabled>
                    Select Payment Method
                  </option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="insurance">Insurance</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {billing ? "Update billing" : "Create billing"}
        </Button>
      </form>
    </Form>
  );
};

export default CreateForm;
