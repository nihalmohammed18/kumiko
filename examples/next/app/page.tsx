import { Button, buttonStyles, Spinner } from "kumiko-ui";
import { Counter } from "./counter";

// A server component: renders server-safe parts directly and client parts with serialisable props only.
export default function Page() {
  return (
    <main className="mx-auto grid max-w-2xl gap-6 p-8">
      <h1 className="font-display text-headline">Kumiko in Next.js</h1>
      <p className="text-fg-muted">
        Server-rendered text <Spinner label="Loading jobs" /> next to client components.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary">Rendered from a server component</Button>
        <a href="/button-only" className={buttonStyles({ variant: "link" })}>
          Button-only page
        </a>
      </div>
      <Counter />
    </main>
  );
}
