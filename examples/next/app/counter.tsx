"use client";

import { Button, IconButton } from "kumiko-ui";
import { useState } from "react";

/** A client island: event handlers only work inside client components. */
export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex items-center gap-3">
      <Button variant="primary" onClick={() => setCount((c) => c + 1)}>
        Clicked {count} times
      </Button>
      <IconButton aria-label="Reset" variant="outline" onClick={() => setCount(0)}>
        ↺
      </IconButton>
    </div>
  );
}
