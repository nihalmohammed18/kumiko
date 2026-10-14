import { Button } from "kumiko-ui";

// Used by verify.mjs: a route that imports only Button must not ship unrelated components.
export default function ButtonOnly() {
  return (
    <main className="p-8">
      <Button variant="primary">Only a button here</Button>
    </main>
  );
}
