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
import { useEffect, useState } from "react";
import { useHasPermission } from "@/hooks/use-has-permission";

export type Doctor = {
  id: number;
  userId: number;
  specialization: string;
  fees: number;
  availability: string;
};

export const columns: ColumnDef<Doctor>[] = [
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
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "specialization",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Specialization
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("specialization")}</div>
    ),
  },
  {
    accessorKey: "fees",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fees
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("fees")}</div>,
  },
  {
    accessorKey: "availability",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Availability
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("availability")}</div>
    ),
  },
  {
    header: "Actions",
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const doctor = row.original;
      const [isModalOpen, setIsModalOpen] = React.useState(false);
      const canUpdateDoctor = useHasPermission("Doctor", "update");
      const canDeleteDoctor = useHasPermission("Doctor", "delete");
      const canReadDoctor = useHasPermission("Doctor", "read");
      const canReadOwnDoctor = useHasPermission("Doctor", "readOwn");

      const handleDelete = async () => {
        try {
          const res = await fetch(`/api/doctors/${doctor.id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            console.log("Doctor deleted successfully");
            setIsModalOpen(false);
            window.location.reload();
          } else {
            console.error("Failed to delete doctor");
            setIsModalOpen(false);
          }
        } catch (error) {
          console.error("Error deleting doctor:", error);
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
              {canUpdateDoctor && (
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/doctors/${doctor.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canDeleteDoctor && (
                <DropdownMenuItem
                  onSelect={() => {
                    setIsModalOpen(true);
                  }}
                  variant="destructive"
                >
                  Delete
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {(canReadDoctor || canReadOwnDoctor) && (
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/doctors/${doctor.id}`}>
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

export function UserDashboardPage() {
  const [data, setData] = useState<Doctor[]>([]);
  const canCreateDoctor = useHasPermission("Doctor", "create");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/doctors");
      const data = (await res.json()) as Doctor[];
      setData(data);
      console.log(data);
    };
    fetchData();
  }, []);
  return (
    <>
      <SiteHeader title="Doctors">
        {canCreateDoctor && (
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link href="/dashboard/doctors/create">New doctor</Link>
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
