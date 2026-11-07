import { Button, Link, LinkButton, Spinner } from "kumiko-ui";
import NextLink from "next/link";
import { Counter } from "./counter";

// A server component: renders server-safe parts directly and client parts with serialisable props only.
export default function Page() {
  return (
    <main className="mx-auto grid max-w-2xl gap-6 p-8">
      <h1 className="font-display text-headline">Kumiko in Next.js</h1>
      <p className="text-ink-muted">
        Server-rendered text <Spinner label="Loading jobs" /> next to client components.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button tone="secondary">Rendered from a server component</Button>
        <LinkButton href="/button-only" tone="primary">
          Button-only page
        </LinkButton>
      </div>
      <p>
        <Link render={<NextLink href="/button-only" />}>View the button-only page</Link>
      </p>
      <Counter />
    </main>
  );
}
