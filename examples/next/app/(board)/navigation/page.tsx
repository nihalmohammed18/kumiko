import { BreadcrumbItem, Breadcrumbs, Link, Pagination, Tab, Tabs, TabsList, TabsPanel } from "kumiko-ui";
import NextLink from "next/link";
import { jobs } from "../../jobs";
import { JobView } from "./job-view";

export default async function NavigationPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; remote?: string | string[] }>;
}) {
  const params = await searchParams;
  const remote = params.remote === "1";
  const filteredJobs = remote ? jobs.filter((job) => job.location === "Remote") : jobs;
  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / 10));
  const page = Math.min(pageCount, Math.max(1, Math.trunc(Number(params.page)) || 1));
  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem render={<NextLink href="/" />}>Job board</BreadcrumbItem>
        <BreadcrumbItem>Browse jobs</BreadcrumbItem>
      </Breadcrumbs>
      <h1 className="font-display text-headline font-bold">Find a role that fits</h1>
      <Tabs defaultValue="open">
        <TabsList aria-label="Job lists">
          <Tab value="open">Open roles</Tab>
          <Tab value="saved">Saved roles</Tab>
          <Tab value="applications">Applications</Tab>
        </TabsList>
        <TabsPanel value="open">
          <JobView jobs={filteredJobs.slice((page - 1) * 10, page * 10)} remote={remote} />
          <Pagination
            page={page}
            pageCount={pageCount}
            href={(target) => `/navigation?page=${target}${remote ? "&remote=1" : ""}`}
            render={<NextLink href="/navigation" />}
            className="mt-4"
          />
        </TabsPanel>
        <TabsPanel value="saved">
          <p>
            Your saved roles are ready for another look.{" "}
            <Link render={<NextLink href="/overlays" />}>Manage your saved jobs</Link>.
          </p>
        </TabsPanel>
        <TabsPanel value="applications">
          <p>
            Keep every application in one place.{" "}
            <Link render={<NextLink href="/data" />}>Open your application tracker</Link>.
          </p>
        </TabsPanel>
      </Tabs>
    </>
  );
}
