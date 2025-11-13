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
import { prescriptionSchema } from "@/lib/validation/prescriptionSchema";
import { prescriptions } from "@/db/schemas";
interface prescriptionFormProps {
  prescription?: z.infer<typeof prescriptionSchema> & { id: number };
}
const Create = ({ prescription }: prescriptionFormProps) => {
  const [users, setUsers] = useState<{ label: string; value: string }[]>([]);
  const [patients, setPatients] = useState<{ label: string; value: string }[]>(
    []
  );
  const [doctors, setDoctors] = useState<{ label: string; value: string }[]>(
    []
  );
  const [appointments, setAppointments] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
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
          label: doctor.id,
          value: doctor.id.toString(),
        })
      );
      setDoctors(formattedDoctors);
    };

    const fetchAppointments = async () => {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      const formattedAppointments = data.map(
        (appointment: { id: number; date: string }) => ({
          label: appointment.id,
          value: appointment.id.toString(),
        })
      );
      setAppointments(formattedAppointments);
    };

    fetchPatients();
    fetchDoctors();
    fetchAppointments();
  }, []);

  const form = useForm<z.infer<typeof prescriptionSchema>>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: prescription || {
      // userId: undefined,
      patientId: undefined,
      doctorId: undefined,
      appointmentId: undefined,
      medicineList: "",
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof prescriptionSchema>) {
    let method = "";
    let url = "";
   console.log("submit btn");
   
    if (prescription?.id) {
      method = "PUT";
      url = `/api/prescriptions/${prescription.id}`;
    } else {
      method = "POST";
      url = "/api/prescriptions";
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
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor Id</FormLabel>
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
          name="medicineList"
          render={({ field }) => (
            <FormItem>
              <FormLabel>MedicineList</FormLabel>
              <FormControl>
                <Input placeholder="Medication" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input placeholder="Notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {prescription ? "Update Prescription" : "Create Prescription"}
        </Button>
      </form>
    </Form>
  );
};

export default Create;
