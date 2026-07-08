---
name: react-testing
description: >
  This skill should be used when the user asks about "testing React components",
  "React Testing Library", "userEvent", "screen.getByRole", "mock API in
  component tests", or discusses component test strategy or MSW.
version: 1.0.0
---

## React Testing (Testing Library + Vitest)

Test what the user sees and does — not implementation details (state, props,
internal calls). If a refactor breaks a test without changing behaviour, the
test was wrong.

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ProductForm } from './ProductForm';

describe('ProductForm', () => {
  it('submits valid data', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<ProductForm onSave={onSave} />);

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Widget');
    await user.type(screen.getByRole('spinbutton', { name: /price/i }), '9.99');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Widget', price: 9.99 }),
    );
  });

  it('shows a validation error for empty name', async () => {
    const user = userEvent.setup();
    render(<ProductForm onSave={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/name is required/i);
  });
});
```

### Query priority (accessibility-first)

`getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` >
`getByTestId` (last resort). If you can't find it by role, your markup likely
has an accessibility problem too.

### Rules of thumb

- `userEvent` over `fireEvent` — it simulates real interaction (focus, keystrokes).
- `findBy*` awaits async UI; wrap nothing in manual `act()` — Testing Library does it.
- Mock the network with **MSW** (request-level), not fetch/axios internals —
  components stay testable regardless of the HTTP client.
- Components using TanStack Query need a fresh `QueryClientProvider` per test
  (`retry: false`) — build a `renderWithProviders` helper once.
