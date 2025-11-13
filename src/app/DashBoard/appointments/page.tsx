"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { TanStackTable } from "@/components/tanstack-table";
import { useEffect, useState } from "react";
import AppModal from "@/components/app-modal";

export type Appointment = {
  id:string;
  patientId: Number;
  doctorId: Number;
  date: Number;
  status: string;
};



export const columns: ColumnDef<Appointment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "patientId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          patientId
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("patientId")}</div>
    ),
  },
  {
    accessorKey: "doctorId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          doctorId
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("doctorId")}</div>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("date")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    header: "Actions",
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const appointment = row.original;
      const [isModalOpen, setIsModalOpen] = React.useState(false);

      const handleDelete = async () => {
        try {
          const res = await fetch(`/api/appointments/${appointment.id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            console.log("appointment deleted successfully");
            setIsModalOpen(false);
            window.location.reload();
          } else {
            console.error("Failed to delete appointment");
            setIsModalOpen(false);
          }
        } catch (error) {
          console.error("Error deleting appointment:", error);
          setIsModalOpen(false);
        }
      };

      return (
        <>
          <AppModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleDelete}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/appointments/${appointment.id}/edit`}>
                  Edit User
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" 
                onClick={() => setIsModalOpen(true)}>
                Delete User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/appointments/${appointment.id}`}>
                  View User details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];

export function AppointmentsDashboardPage() {
  const [data, setData] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/appointments");
      const appointments = await res.json();
      setData(appointments);
    };
    fetchData();
  }, []);
  return (
    <>
      <SiteHeader title="Appointments">
        <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
          <Link href="/dashboard/appointments/create">New appointment</Link>
        </Button>
      </SiteHeader>
      <div className="w-full px-4 lg:px-6">
        <TanStackTable columns={columns} data={data} />
      </div>
    </>
  );
}
export default AppointmentsDashboardPage;
