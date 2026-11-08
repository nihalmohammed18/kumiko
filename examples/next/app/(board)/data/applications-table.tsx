"use client";

import { Badge, Button, DataTable, type DataTableProps } from "kumiko-ui";
import { useState } from "react";
import type { Job } from "../../jobs";

const columns: DataTableProps<Job>["columns"] = [
  { accessorKey: "role", header: "Role" },
  { accessorKey: "company", header: "Company" },
  { accessorKey: "location", header: "Location" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge>{row.original.status}</Badge> },
];

/** Gives the complete dataset sorting, filtering, selection and a local shortlist action.
 * Use when: exploring application records. Avoid when: supplying just one server-paginated page.
 */
export function ApplicationsTable({ data }: { data: Job[] }) {
  const [shortlist, setShortlist] = useState<Job[]>([]);
  return (
    <div className="grid min-w-0 gap-3">
      <DataTable
        columns={columns}
        data={data}
        caption="All applications"
        filter
        filterLabel="Filter applications"
        selectable
        getRowId={(job) => job.id}
        getRowLabel={(job) => `${job.role} at ${job.company}, ${job.location}`}
        bulkActions={(selected) => (
          <Button size="sm" onClick={() => setShortlist(selected)}>
            Save shortlist
          </Button>
        )}
      />
      <p role="status" className="text-body-sm text-ink-muted">
        {shortlist.length > 0 &&
          `Shortlist saved: ${shortlist.map((job) => `${job.role} at ${job.company}`).join("; ")}.`}
      </p>
    </div>
  );
}
