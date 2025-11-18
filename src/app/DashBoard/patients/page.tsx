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
import AppModal from "@/components/app-modal";
import { useHasPermission } from "@/hooks/use-has-permission";

export type patients = {
  id: string;
  userId: number;
  dob: number;
  gender: string;
  medicalHistory: string;
};

export const columns: ColumnDef<patients>[] = [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "dob",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          DOB
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("dob")}</div>,
  },
  {
    accessorKey: "gender",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Gender
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("gender")}</div>,
  },
  {
    accessorKey: "medicalHistory",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Medical History
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("medicalHistory")}</div>
    ),
  },
  {
    header: "Actions",
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const patient = row.original;
      const [isModalOpen, setIsModalOpen] = React.useState(false);
      const canUpdatePatient = useHasPermission("Patient", "update");
      const canDeletePatient = useHasPermission("Patient", "delete");
      const canReadPatient = useHasPermission("Patient", "read");
      const canReadOwnPatient = useHasPermission("Patient", "readOwn");
      const handleDelete = async () => {
        try {
          const res = await fetch(`/api/patients/${patient.id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            console.log("Patient deleted successfully");
            setIsModalOpen(false);
            window.location.reload();
          } else {
            console.error("Failed to delete patient");
            setIsModalOpen(false);
          }
        } catch (error) {
          console.error("Error deleting patient:", error);
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
                {/* <span className="sr-only">Open menu</span> */}
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdatePatient && (
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/patients/${patient.id}/edit`}>
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canDeletePatient && (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    setIsModalOpen(true);
                  }}
                >
                  Delete 
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {(canReadPatient || canReadOwnPatient) && (
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/patients/${patient.id}`}>
                    View
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];

export function PatientDashboardPage() {
  const [data, setData] = React.useState<patients[]>([]);
  const canCreatePatient = useHasPermission("Patient", "create");

  React.useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/patients");
      const fetchedData = (await res.json()) as patients[];
      console.log(fetchedData);
      setData(fetchedData);
    };
    fetchData();
  }, []);

  return (
    <>
      <SiteHeader title="Patients">
        {canCreatePatient && (
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link href="/dashboard/patients/create">New Patient</Link>
          </Button>
        )}
      </SiteHeader>
      <div className="w-full px-4 lg:px-6">
        <TanStackTable columns={columns} data={data} />
      </div>
    </>
  );
}
export default PatientDashboardPage;
