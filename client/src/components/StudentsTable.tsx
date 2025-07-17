/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChevronDown, MoreHorizontal, Loader2, Delete, LucideDelete, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import axiosInstance from "@/services/axiosInstance"
import endpoints from "@/services/endpoints"

export type Student = {
  _id: string
  full_name: string
  email_address: string
  phone_number: string
  target_country: string
  assigned_counselor: {
    id: string
    name: string
    email: string
    role: string
  }
  application_path: "Direct" | "Agent" | "Referral"
  created_at: string
  updated_at: string
}

const fetchStudents = async (skip: number, limit: number): Promise<Student[]> => {
  try {
    // Debug: Log the token before making the request
    const token = localStorage.getItem('access_token');
    console.log('Token being used:', token ? `${token.substring(0, 20)}...` : 'No token found');

    const response = await axiosInstance.get(
      `${endpoints.getAllStudents}?skip=${skip}&limit=${limit}&populate_counselor=true&populate_creator=false`
    )
    console.log('Students API response:', response.data);
    return response.data
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
}



interface StudentsTableProps {
  refetchTrigger?: number
}

export function StudentsTable({ refetchTrigger }: StudentsTableProps = {}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [studentToDelete, setStudentToDelete] = React.useState<Student | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const skip = pagination.pageIndex * pagination.pageSize
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return

    setIsDeleting(true)
    try {
      await axiosInstance.delete(`${endpoints.student}/${studentToDelete._id}`)

      refetch() // Refetch the table data
      setIsDeleteDialogOpen(false)
      setStudentToDelete(null)
    } catch (error) {
      console.error('Error deleting student:', error)
    } finally {
      setIsDeleting(false)
    }
  }
  const {
    data: students,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['students', skip, pagination.pageSize],
    queryFn: () => fetchStudents(skip, pagination.pageSize),
    staleTime: 5 * 60 * 1000,
  })

  React.useEffect(() => {
    if (refetchTrigger) {
      refetch()
    }
  }, [refetchTrigger, refetch])
  const columns: ColumnDef<Student>[] = [
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
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "full_name",
      header: ({ }) => {
        return (
          <Button
            variant="ghost"
            //   onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent px-0"
          >
            Name
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("full_name")}</div>
      ),
    },
    {
      accessorKey: "email_address",
      header: ({ }) => {
        return (
          <Button
            variant="ghost"
            //   onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent px-0"
          >
            Email
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="lowercase text-muted-foreground">{row.getValue("email_address")}</div>
      ),
    },
    {
      accessorKey: "target_country",
      header: ({ }) => {
        return (
          <Button
            variant="ghost"
            //   onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent px-0 "
          >
            Target Country
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize text-start ml-5">{row.getValue("target_country")}</div>
      ),
    },
    {
      accessorKey: "assigned_counselor",
      header: "Assigned Counselor",
      cell: ({ row }) => {
        const counselor = row.getValue("assigned_counselor") as Student['assigned_counselor']
        return (
          <div className="flex flex-col">
            <span className="font-medium ">{counselor?.name || "N/A"}</span>
            <span className="text-sm text-muted-foreground">{counselor?.email || ""}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "application_path",
      header: "Application Path",
      cell: ({ row }) => {
        const path = row.getValue("application_path") as string
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${path === "Direct"
            ? "bg-blue-100 text-blue-800 ml-5 dark:bg-blue-900/20 dark:text-blue-400"
            : path === "Agent"
              ? "bg-green-100 text-green-800 ml-5 dark:bg-green-900/20 dark:text-green-400"
              : "bg-purple-100 text-purple-800 ml-5 dark:bg-purple-900/20 dark:text-purple-400"
            }`}>
            {path}
          </span>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original

        return (
          <Trash size={15} className="text-red-500 hover:text-red-900 hover:bg-red-100 rounded-sm" onClick={(e) => {
            e.stopPropagation()
            setStudentToDelete(student)
            setIsDeleteDialogOpen(true)
          }} />
          // <DropdownMenu>
          //   <DropdownMenuTrigger asChild>
          //     <Button variant="ghost" className="h-8 w-8 p-0">
          //       <span className="sr-only">Open menu</span>
          //       <MoreHorizontal className="h-4 w-4" />
          //     </Button>
          //   </DropdownMenuTrigger>
          //   <DropdownMenuContent align="end">
          //     <DropdownMenuLabel>Actions</DropdownMenuLabel>
          //     <DropdownMenuItem
          //       onClick={() => navigator.clipboard.writeText(student._id)}
          //     >
          //       Copy student ID
          //     </DropdownMenuItem>
          //     <DropdownMenuSeparator />
          //     {/* <DropdownMenuItem>View details</DropdownMenuItem> */}
          //     {/* <DropdownMenuItem>Edit student</DropdownMenuItem> */}
          //     <DropdownMenuItem
          // onClick={(e) => {
          //   e.stopPropagation()
          //   setStudentToDelete(student)
          //   setIsDeleteDialogOpen(true)
          // }}
          //       className="text-red-600">
          //       Delete student
          //     </DropdownMenuItem>
          //   </DropdownMenuContent>
          // </DropdownMenu>
        )
      },
    },
  ]
  const table = useReactTable({
    data: students || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    pageCount: students ? Math.ceil(students.length / pagination.pageSize) : 0,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    manualPagination: true,
  })
  const handleRowClick = (studentId: string) => {
    // Open in a new tab
    window.open(`/student?id=${studentId}`, '_blank');
  };
  if (error) {
    return (
      <div className="w-full">
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="text-red-800">
            <h3 className="font-semibold">Error loading students</h3>
            <p className="mt-1 text-sm">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("full_name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id.replace("_", " ")}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading students...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 cursor-pointer "
                  onClick={() => handleRowClick(row.original._id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-muted-foreground">No students found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or add a new student
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </p>

        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student
              &quot;{studentToDelete?.full_name}&quot; and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStudentToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}