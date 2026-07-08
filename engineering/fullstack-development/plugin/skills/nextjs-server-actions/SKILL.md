---
name: nextjs-server-actions
description: >
  This skill should be used when the user asks about "Server Actions",
  "use server", "Next.js form submission", "useActionState", "mutate data
  in Next.js", or discusses handling forms and mutations in the App Router.
version: 1.0.0
---

## Next.js Server Actions (Forms & Mutations)

Server Actions replace hand-written POST route handlers for app-internal
mutations — typed function calls from the client that run on the server.

```ts
// app/products/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CreateProduct = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().positive(),
});

export async function createProduct(prevState: unknown, formData: FormData) {
  const session = await auth();                      // ALWAYS authorize inside
  if (!session) return { error: 'Unauthorized' };    // actions are public endpoints

  const parsed = CreateProduct.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const product = await db.product.create({ data: parsed.data });
  revalidatePath('/products');                       // refresh cached list
  redirect(`/products/${product.id}`);
}
```

```tsx
// app/products/new/page.tsx (client form with pending + errors)
'use client';
import { useActionState } from 'react';
import { createProduct } from '../actions';

export default function NewProductForm() {
  const [state, formAction, isPending] = useActionState(createProduct, null);

  return (
    <form action={formAction}>
      <input name="name" />
      {state?.fieldErrors?.name && <p role="alert">{state.fieldErrors.name}</p>}
      <input name="price" type="number" step="0.01" />
      <button disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}
```

### Security rules — actions are HTTP endpoints

- Authenticate + authorize **inside every action**; the UI hiding a button
  protects nothing.
- Validate all inputs with a schema — `FormData` is untrusted client data.
- Never pass secrets or non-public data through action arguments/closures;
  they can be replayed by the client.

### Rules of thumb

- After a mutation: `revalidatePath`/`revalidateTag` (cache) then `redirect`.
- Forms work without JS (progressive enhancement) when using `<form action>`.
- `useOptimistic` for instant UI on slow mutations, reconciled on response.
- Long work doesn't belong in an action — enqueue a job and return.
