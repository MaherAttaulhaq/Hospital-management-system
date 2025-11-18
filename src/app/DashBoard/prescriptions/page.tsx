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
import { prescriptions } from "@/db/schemas";
import { useEffect, useState } from "react";
import { useHasPermission } from "@/hooks/use-has-permission";
export type prescriptions = {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  medicineList: string;
  notes: string;
};

export const columns: ColumnDef<prescriptions>[] = [
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
    accessorKey: "appointmentDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Appointment Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("appointmentDate")}</div>
    ),
  },
  {
    accessorKey: "doctorName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Doctor Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("doctorName")}</div>
    ),
  },
  {
    accessorKey: "patientName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Patient Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("patientName")}</div>,
  },
  {
    accessorKey: "medicineList",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Medicine List
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("medicineList")}</div>
    ),
  },
  {
    accessorKey: "notes",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Notes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("notes")}</div>
    ),
  },
  {
    header: "Actions",
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const prescription = row.original;
      const [isModalOpen, setIsModalOpen] = React.useState(false);
      const canUpdatePrescription = useHasPermission("Prescription", "update");
      const canDeletePrescription = useHasPermission("Prescription", "delete");
      const canReadPrescription = useHasPermission("Prescription", "read");
      const canReadOwnPrescription = useHasPermission(
        "Prescription",
        "readOwn"
      );

      const handleDelete = async () => {
        try {
          const res = await fetch(`/api/prescriptions/${prescription.id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            console.log("prescription deleted successfully");
            setIsModalOpen(false);
            window.location.reload();
          } else {
            console.error("Failed to delete prescription");
            setIsModalOpen(false);
          }
        } catch (error) {
          console.error("Error deleting prescription:", error);
          setIsModalOpen(false);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canUpdatePrescription && (
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/prescriptions/${prescription.id}/edit`}>
                  Edit 
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {canDeletePrescription && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsModalOpen(true)}
              >
                Delete 
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {(canReadPrescription || canReadOwnPrescription) && (
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/prescriptions/${prescription.id}`}>
                  View  
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UserDashboardPage() {
  const [data, setData] = useState<prescriptions[]>([]);
  const canCreatePrescription = useHasPermission("Prescription", "create");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/prescriptions");
      const data = (await res.json()) as prescriptions[];
      console.log(data);
      setData(data);
    };
    fetchData();
  }, []);
  return (
    <>
      <SiteHeader title="Prescriptions">
        {canCreatePrescription && (
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link href="/dashboard/prescriptions/create">
              Create prescription
            </Link>
          </Button>
        )}
      </SiteHeader>
      <div className="w-full px-4 lg:px-6">
        <TanStackTable columns={columns} data={data} />
      </div>
    </>
  );
}
export default UserDashboardPage;
