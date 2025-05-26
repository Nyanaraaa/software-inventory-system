import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

interface DataTableProps<TData> {
  data: TData[]
  columns: {
    key: string
    title: string
    render?: (row: TData) => React.ReactNode
  }[]
}

export function DataTable<TData>({ data, columns }: DataTableProps<TData>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.title}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.render ? column.render(row) : (row as any)[column.key]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}