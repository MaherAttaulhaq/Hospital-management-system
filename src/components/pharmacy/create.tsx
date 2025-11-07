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
import { pharmacySchema } from "@/lib/validation/pharmacySchema";

const CreatePharmacyItemForm = () => {
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

  const form = useForm<z.infer<typeof pharmacySchema>>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: {
      userId: undefined,
      name: "",
      quantity: undefined,
      price: undefined,
      expiryDate: "",
    },
  });

  function onSubmit(values: z.infer<typeof pharmacySchema>) {
    const method = "POST";
    const url = "/api/pharmacy";

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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Medicine Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Quantity"
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
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Price"
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
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Create Item
        </Button>
      </form>
    </Form>
  );
};

export default CreatePharmacyItemForm;