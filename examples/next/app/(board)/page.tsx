import { Overview } from "../overview";

// A server component: renders server-safe parts directly and client parts with serialisable props only.
export default function Page() {
  return <Overview />;
}
