# Appointment Booking Web Client - Architecture Guide

## Overview

This project follows an **Android-like MVVM (Model-View-ViewModel)** architecture adapted for React. It emphasizes separation of concerns, type safety, and testability - bringing backend development discipline to frontend.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  (React Components - pages/*.tsx)                           │
│  • Only displays data from state                             │
│  • Calls model methods on user events                        │
│  • Receives { state, model } from hook                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    ModelView Layer                           │
│  (model/*ModelView.ts)                                      │
│  • useXxxModelView hook (state management)                   │
│  • XxxModelView class (business logic)                       │
│  • Handles API calls via react-query                         │
│  • Validates with Zod schemas                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Domain Layer                              │
│  (domain/*.ts)                                              │
│  • State interfaces (extends State<T,R>)                     │
│  • Data models / types                                       │
│  • Zod validation schemas                                    │
│  • Constants                                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Infrastructure Layer                         │
│  • Orval generated API (api/*/generated/)                   │
│  • Axios interceptors (lib/axios/)                          │
│  • Zustand stores (model/*/zustand/)                        │
│  • React Query client (lib/react-query/)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
app/
├── api/                          # Generated API endpoints (Orval)
│   ├── appointment/generated/
│   ├── auth/generated/
│   ├── branch-locator/generated/
│   ├── slot/generated/
│   └── user/generated/
│
├── domain/                       # Domain models, state, validation
│   ├── State.ts                  # Base State<T,R> interface
│   ├── error/Error.ts            # Error types
│   ├── appointment/
│   │   ├── BookAppointment.ts    # State, types, schema
│   │   └── generated/            # Orval generated models/zod
│   ├── auth/
│   │   ├── Login.ts
│   │   └── generated/
│   ├── slot/
│   │   └── generated/
│   └── ...
│
├── model/                        # ModelView layer (hooks + classes)
│   ├── ViewModel.ts              # Base ViewModel class
│   ├── ActionEvent.ts            # Action types for reducer
│   ├── appointment/
│   │   └── BookAppointmentModelView.ts
│   ├── auth/
│   │   ├── LoginViewModel.ts
│   │   ├── RegisterViewModel.ts
│   │   └── zustand/AuthStore.ts
│   ├── slot/
│   │   └── SlotModelView.ts
│   └── ...
│
├── pages/                        # UI Components (React)
│   ├── appointment/
│   ├── auth/
│   ├── branch/
│   └── slots/
│
├── components/ui/                # Reusable UI components
├── layouts/                      # Layout components
├── lib/                          # Infrastructure
│   ├── axios/                    # Axios config & interceptors
│   └── react-query/              # React Query client
│
├── resources/
│   ├── colors/colors.ts          # Design system (colors, typography)
│   ├── contract/                 # OpenAPI specs (yaml)
│   └── label/                    # Labels/translations
│
└── utils/                        # Utilities
    ├── CompanionObjects.ts
    └── env/
```

---

## Core Patterns

### 1. Base State Interface

**File:** `domain/State.ts`

```typescript
export interface State<T, R> {
    userData: T;              // Form/input data
    errors: TypeError<T>;     // Field-level errors
    isLoading: boolean;       // Loading state
    response?: {              // API response
        isSuccess: boolean;
        data?: R;
        message?: string;
        status?: number;
    };
}
```

### 2. Action Events

**File:** `model/ActionEvent.ts`

```typescript
export enum Action {
    SET_FIELD = 'SET_FIELD',
    SET_LOADING = 'SET_LOADING',
    SET_API_RESPONSE_SUCCESS = 'SET_API_RESPONSE_SUCCESS',
    SET_API_ERROR = 'SET_API_ERROR',
    SET_ERROR = 'SET_ERROR',
    CLEAR_ERRORS = 'CLEAR_ERRORS',
    RESET_FORM = 'RESET_FORM',
    TOGGLE_MODAL = 'TOGGLE_MODAL'
}
```

### 3. Base ViewModel Class

**File:** `model/ViewModel.ts`

```typescript
export abstract class ViewModel<T, R, S extends State<T, R>> {
    constructor(
        protected state: S,
        protected dispatch: Dispatch<ActionDispatch<T, R>>,
        protected resolver: (data: T) => Promise<{ errors?: TypeError<T>; values?: T }>,
        private initialState: S
    ) {}

    // Built-in methods:
    // - onChange()        : Handle input changes with debounced validation
    // - validateForm()    : Validate single field with Zod
    // - submit()          : Validate all & call submitToAPI()
    // - submitToAPI()     : Override in subclass for API calls
    // - catchStateChange(): Override for navigation on success
    
    // Static reducer for useReducer
    static reducer = <T, R, S extends State<T, R>>(initialState: S) => {...}
}
```

---

## ModelView Pattern

### Structure

Every feature follows this pattern:

```typescript
// ===========================================
// 1. DOMAIN (domain/feature/Feature.ts)
// ===========================================
export interface FeatureData { ... }
export interface FeatureState extends State<FeatureData, ResponseType> {
    // Additional state fields
}
export const FeatureSchema = z.object({ ... });

// ===========================================
// 2. HOOK (model/feature/FeatureModelView.ts)
// ===========================================
export const useFeatureModelView = () => {
    const initialState = initFeature();
    const reducer = ViewModel.reducer<...>(initialState);
    const [state, dispatch] = useReducer(reducer, initialState);
    
    const stableDispatch = useCallback(
        (action) => dispatch(action),
        []
    );
    
    // Keep state fresh in ref for stable model instance
    const stateRef = useRef(state);
    stateRef.current = state;
    
    const resolver = useMemo(
        () => createZodResolver<...>(FeatureSchema),
        []
    );
    
    const model = useMemo(
        () => new FeatureModelView(stateRef, stableDispatch, resolver, ...),
        [stableDispatch, resolver, ...]
    );
    
    return { state, model };
};

// ===========================================
// 3. CLASS (extends ViewModel)
// ===========================================
export class FeatureModelView extends ViewModel<...> {
    private getCurrentState(): FeatureState {
        return this.stateRef.current;
    }
    
    // Event handlers
    handleSomething = (event: MouseEvent) => {
        this.dispatch({ type: ActionEvent.SET_FIELD, ... });
    };
    
    // Override for API calls
    submitToAPI = (data: FeatureData) => {
        this.mutation.mutate({ data }, {
            onSuccess: (response) => {
                this.dispatch({ type: ActionEvent.SET_API_RESPONSE_SUCCESS, ... });
            },
            onError: (error) => {
                this.dispatch({ type: ActionEvent.SET_API_ERROR, ... });
            }
        });
    };
}

// ===========================================
// 4. UI (pages/feature/feature.tsx)
// ===========================================
const FeaturePage = () => {
    const { state, model } = useFeatureModelView();
    
    return (
        <div>
            <input onChange={model.onChange} />
            <button onClick={model.submit}>Submit</button>
            {state.isLoading && <Spinner />}
            {state.errors.response?.message && <Error />}
        </div>
    );
};
```

---

## Key Patterns

### stateRef Pattern

Used to keep model instance stable while accessing fresh state:

```typescript
const stateRef = useRef(state);
stateRef.current = state;  // Update on every render

const model = useMemo(
    () => new ModelView(stateRef, ...),  // Pass ref, not state
    [/* stable deps only */]
);

// In class:
private getCurrentState() {
    return this.stateRef.current;  // Always fresh
}
```

### stableDispatch Pattern

Prevents model recreation on state changes:

```typescript
const stableDispatch = useCallback(
    (action) => dispatch(action),
    []  // Empty deps = stable reference
);
```

---

## Infrastructure

### Axios Interceptors

**File:** `lib/axios/axios-api.ts`

Features:
- **Trace-ID**: Unique per request, preserved on retry
- **Auth**: Adds Bearer token from Zustand store
- **401 Handling**: Refresh token → Retry (with limit)
- **502/503 Handling**: Exponential backoff retry
- **Error Normalization**: All errors mapped to `BackendError`

```typescript
interface BackendError {
    message: string;
    statusCodeMessage: string;
    status: number;
    path: string;
    timestamp: string;
    traceId?: string;
    retriesExhausted?: boolean;
}
```

### Orval Code Generation

**File:** `orval.config.ts`

Generates from OpenAPI specs:
- React Query hooks (mutations/queries)
- TypeScript models
- Zod schemas

```bash
npm run generate:api
```

### Zustand Store

**File:** `model/auth/zustand/AuthStore.ts`

Global state with session storage persistence:
- User info
- Authentication state
- Roles
- Token management

---

## Design System

**File:** `resources/colors/colors.ts`

```typescript
export const colors = {
    primary: '#2F70EF',      // Capitec Blue
    primaryDark: '#1e313e',
    red: '#C83C37',          // Capitec Red
    success: '#16a34a',
    // ... neutrals, backgrounds, borders
};

export const typography = {
    h1: { fontSize: '2.25rem', fontWeight: '700', lineHeight: '2.5rem' },
    body: { fontSize: '1rem', fontWeight: '400', lineHeight: '1.5rem' },
    // ... headings, body, labels, buttons
};
```

---

## Validation

Uses Zod with custom resolver:

```typescript
// Define schema
export const LoginSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(1, "Required")
});

// Create resolver
const resolver = createZodResolver<LoginRequest, TypeError<LoginRequest>>(LoginSchema);

// Used in ViewModel for:
// - Real-time field validation (debounced)
// - Form submission validation
```

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Domain State | `Feature.ts` | `Login.ts`, `BookAppointment.ts` |
| ModelView | `FeatureModelView.ts` | `LoginViewModel.ts`, `BookAppointmentModelView.ts` |
| Page | `feature.tsx` | `login.tsx`, `appointment-slots.tsx` |
| Component | `ComponentName.tsx` | `SlotButton.tsx`, `DateButton.tsx` |
| Zustand Store | `FeatureStore.ts` | `AuthStore.ts` |

---

## Example: Complete Feature Flow

### Login Feature

```
1. User types email
   → LoginPage calls model.onChange(event)
   → ViewModel dispatches SET_FIELD
   → After debounce, validates with Zod
   → Dispatches SET_ERROR if invalid

2. User clicks Submit
   → LoginPage calls model.submit(event)
   → ViewModel validates all fields
   → If valid: SET_LOADING → submitToAPI()
   
3. API responds
   → onSuccess: SET_API_RESPONSE_SUCCESS + call login() in Zustand
   → onError: SET_API_ERROR with message

4. State changes
   → useEffect watches state.response?.isSuccess
   → If true: model.catchStateChange() → navigate('/appointments')
```

---

## Quick Reference

### Creating a New Feature

1. **Domain**: Create `domain/feature/Feature.ts`
   - Define `FeatureData` interface
   - Define `FeatureState extends State<T,R>`
   - Define Zod schema

2. **ModelView**: Create `model/feature/FeatureModelView.ts`
   - Create `useFeatureModelView` hook
   - Create `FeatureModelView` class extending `ViewModel`

3. **UI**: Create `pages/feature/feature.tsx`
   - Use the hook: `const { state, model } = useFeatureModelView()`
   - Render based on state, call model methods on events

4. **Route**: Add to `routes.ts`

---

## Key Principles

1. **UI is dumb** - Only renders state, calls model methods
2. **Business logic in ModelView** - Validation, API calls, navigation
3. **State is predictable** - useReducer + defined actions
4. **Type safety everywhere** - TypeScript + Zod + generated types
5. **Generated API** - No manual API code, use Orval
6. **Separation of concerns** - Each layer has one responsibility
