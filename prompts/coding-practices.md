# Prompt: Coding Practices & Patterns

## Context

Establish consistent coding practices and patterns for a modern React/Next.js TypeScript project. Follow these conventions across all code for maintainability and readability.

## Patterns

### Function Style

- **Arrow functions** for callbacks and inline functions
- **Function declarations** for named exports and components

```tsx
// Components & exports
export function ComponentName() { ... }

// Callbacks & inline
const handleClick = () => { ... }
```

### Component Style

- **Functional components only** (no class components)
- **Hooks** for state and side effects
- **'use client'** directive for client components

### Export Style

- **Named exports** for components, utilities, hooks
- **Default exports** only for Next.js pages/layouts

```tsx
// Components, hooks, utilities
export function Button() { ... }
export function useCustomHook() { ... }

// Pages only
export default function Page() { ... }
```

### Type Definitions

- **Interfaces** for object shapes and props
- **Types** for unions, intersections, and inferred schemas
- **Zod + infer** for form validation schemas
- **`as const`** for readonly constant arrays/objects

```tsx
// Props and data models
interface ButtonProps { ... }

// Unions and inferred
type Status = 'pending' | 'complete';
type FormData = z.infer<typeof schema>;

// Constants
export const CONFIG = { ... } as const;
```

### File Naming

- **kebab-case** for all files: `user-profile.tsx`, `use-auth.ts`
- **`use-` prefix** for hooks: `use-mounted.ts`
- **`-store` suffix** for stores: `plans-store.ts`

### Folder Structure

```
src/
  app/           # Next.js routes (pages, layouts)
  components/
    ui/          # Primitive UI components (shadcn)
    layout/      # Layout components (header, sidebar)
    [feature]/   # Feature-specific components
    providers/   # Context providers
  hooks/         # Custom React hooks
  lib/           # Utilities, validators, constants
  stores/        # Zustand stores
  types/         # TypeScript type definitions
```

### Import Ordering

Group imports with blank lines between:

1. React/Next.js
2. External libraries
3. Internal components (`@/components/`)
4. Internal utilities/stores (`@/lib/`, `@/stores/`)
5. Types (`import type`)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';

import type { User } from '@/types';
```

### Props Handling

- **Interface** for props definition
- **Destructure** in function parameters
- **Consistent dialog pattern**: `open` + `onOpenChange`

```tsx
interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  initialData?: Data | null;
}

export function FormDialog({ open, onOpenChange, onSubmit, initialData }: FormDialogProps) {
  ...
}
```

### State Management (Zustand)

- **Persist middleware** for localStorage
- **Interface** for store state and actions
- **Grouped state and actions**

```tsx
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // State
      items: [],

      // Actions
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
    }),
    { name: 'storage-key' }
  )
);
```

### Form Pattern (React Hook Form + Zod)

```tsx
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});
```

### Styling

- **Tailwind CSS** utilities
- **`cn()` helper** for conditional classes
- **CVA** for component variants

```tsx
import { cn } from '@/lib/utils';

<div className={cn('base-class', condition && 'conditional-class')} />;
```

### Constants

- Centralize in `src/lib/constants.ts`
- Use `as const` for type inference
- Group by category

```tsx
export const APP_CONFIG = {
  name: 'App Name',
  url: 'https://example.com',
} as const;
```

### Error Handling

- **Toast notifications** for user feedback
- **Form validation** with Zod + error display
- **Loading states** with skeletons

### Accessibility

- Semantic HTML elements
- ARIA attributes on interactive elements
- Skip links for keyboard navigation
- Proper form error associations
