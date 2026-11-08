import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "kumiko-ui";
import { jobs } from "../../jobs";
import { ApplicationsTable } from "./applications-table";

// The plain Table is composed on the server; only the complete interactive dataset needs a client island.
export default function DataPage() {
  return (
    <>
      <h1 className="font-display text-headline font-bold">Your applications</h1>
      <Table id="recent-applications">
        <TableCaption>Recent applications</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.slice(0, 3).map((job) => (
            <TableRow key={job.id}>
              <TableHead scope="row">{job.role}</TableHead>
              <TableCell>{job.company}</TableCell>
              <TableCell>
                <Badge>{job.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableHead scope="row" colSpan={2}>
              Total tracked
            </TableHead>
            <TableCell>{new Intl.NumberFormat("en").format(jobs.length)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <p className="text-ink-muted">
        Sort any column, filter by role or company, and select applications to save a shortlist.
      </p>
      <ApplicationsTable data={jobs} />
    </>
  );
}
