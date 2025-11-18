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
import { useHasPermission } from "@/hooks/use-has-permission";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export const columns: ColumnDef<User>[] = [
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
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("role")}</div>,
  },
  {
    header: "Actions",
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const User = row.original;
      const canUpdateUser = useHasPermission("User", "update");
      const canDeleteUser = useHasPermission("User", "delete");
      const canReadUser = useHasPermission("User", "read");
      const canReadOwnUser = useHasPermission("User", "readOwn");

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {canUpdateUser && (
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/users/${User.id}/edit`}>Edit User</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {canDeleteUser && (
              <DropdownMenuItem variant="destructive">
                Delete User
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {(canReadUser || canReadOwnUser) && (
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/users/${User.id}`}>
                  View User details
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
  const [data, setData] = React.useState<User[]>([]);
  const canCreateUser = useHasPermission("User", "create");

  React.useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/users");
      const fetchedData = (await res.json()) as User[];
      setData(fetchedData);
    };
    fetchData();
  }, []);

  return (
    <>
      <SiteHeader title="Users">
        {canCreateUser && (
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link href="/dashboard/users/create">New user</Link>
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
