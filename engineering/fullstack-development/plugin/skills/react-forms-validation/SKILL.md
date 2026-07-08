---
name: react-forms-validation
description: >
  This skill should be used when the user asks about "React forms",
  "react-hook-form", "form validation", "zod resolver", "controlled vs
  uncontrolled inputs", or discusses building and validating forms in React.
version: 1.0.0
---

## React Forms & Validation (react-hook-form + zod)

react-hook-form keeps inputs uncontrolled (no re-render per keystroke); zod
provides one schema for client validation and shared server-side reuse.

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ProductSchema = z.object({
  name:  z.string().min(1, 'Name is required'),
  price: z.coerce.number().positive('Price must be positive'),
  email: z.string().email(),
});

function ProductForm({ onSave }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: zodResolver(ProductSchema) });

  const onSubmit = async (data) => {   // data is validated + typed
    await onSave(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input {...register('name')} aria-invalid={!!errors.name} />
      {errors.name && <p role="alert">{errors.name.message}</p>}

      <input type="number" step="0.01" {...register('price')} />
      {errors.price && <p role="alert">{errors.price.message}</p>}

      <input type="email" {...register('email')} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <button disabled={isSubmitting}>Save</button>
    </form>
  );
}
```

### Rules of thumb

- Share the zod schema with the API route — client validation is UX, server
  validation is security; never rely on the client alone.
- `z.coerce.number()` for numeric inputs — HTML inputs always yield strings.
- Custom/3rd-party inputs (date pickers, selects) integrate via `<Controller>`.
- Map server-side errors back with `setError('field', { message })`.
- Multi-step forms: one schema per step, merge on final submit.
