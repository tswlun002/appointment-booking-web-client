# Claude AI Instructions - Appointment Booking Web Client

## ⚠️ IMPORTANT: Read Before Responding

Before writing ANY code or answering architecture questions for this project, you MUST:

1. **Read `ARCHITECTURE.md`** - Understand the MVVM pattern used
2. **Follow existing patterns** - Look at working examples (LoginViewModel, RegisterViewModel, SlotModelView)
3. **Never invent new patterns** - Use existing ActionEvent types, State interface, ViewModel base class

---

## Project Architecture Summary

This project uses **Android-like MVVM** adapted for React:

```
UI Layer (pages/*.tsx)
    ↓ { state, model }
ModelView Layer (model/*ModelView.ts)
    ↓ extends State<T,R>
Domain Layer (domain/*.ts)
    ↓ generated types
Infrastructure Layer (api/, lib/, zustand)
```

---

## ✅ DO's

### When Creating a New Feature:

1. **Domain First** (`domain/feature/Feature.ts`):
   ```typescript
   // 1. Import base State
   import type { State } from "~/domain/State";
   
   // 2. Define data interface
   export interface FeatureData { ... }
   
   // 3. Define state extending State<T,R>
   export interface FeatureState extends State<FeatureData, ResponseType> {
       // Additional fields like isModalOpen
   }
   
   // 4. Define Zod schema
   export const FeatureSchema = z.object({ ... });
   ```

2. **ModelView Second** (`model/feature/FeatureModelView.ts`):
   ```typescript
   // 1. Create hook with useReducer + stableDispatch + stateRef
   export const useFeatureModelView = () => {
       const [state, dispatch] = useReducer(reducer, initialState);
       const stableDispatch = useCallback((action) => dispatch(action), []);
       const stateRef = useRef(state);
       stateRef.current = state;
       // ...
       return { state, model };
   };
   
   // 2. Create class extending ViewModel
   export class FeatureModelView extends ViewModel<...> {
       private getCurrentState() { return this.stateRef.current; }
       // Event handlers...
   }
   ```

3. **UI Last** (`pages/feature/feature.tsx`):
   ```typescript
   const FeaturePage = () => {
       const { state, model } = useFeatureModelView();
       // Render based on state, call model methods on events
   };
   ```

### When Using State:

- Use `ActionEvent.SET_FIELD` for field updates
- Use `ActionEvent.SET_LOADING` for loading state
- Use `ActionEvent.SET_API_RESPONSE_SUCCESS` for success
- Use `ActionEvent.SET_API_ERROR` for errors
- Use `ActionEvent.TOGGLE_MODAL` for modal state

### When Making API Calls:

- Use Orval-generated hooks (`useCreateAppointment`, `useLogin`, etc.)
- Handle in `submitToAPI()` method with mutation options
- Dispatch appropriate actions on response
- **IMPORTANT**: Explicitly type mutations in constructor with error type:

```typescript
// ✅ CORRECT - Explicit error type in UseMutationResult
private createAppointmentMutation: UseMutationResult<
    AppointmentResponse,           // Response type
    CreateAppointmentMutationError, // Error type (NOT unknown)
    { data: CreateAppointmentRequest }, // Variables type
    unknown                        // Context type
>

// Then use mutation options with typed error:
private mutationOptions = () => {
    return {
        onSuccess: (response: AppointmentResponse) => {
            this.dispatch({ type: ActionEvent.SET_API_RESPONSE_SUCCESS, ... });
        },
        onError: (error: CreateAppointmentMutationError) => {
            this.dispatch({ type: ActionEvent.SET_API_ERROR, ... });
        },
    };
};

// Use mutateAsync (NOT mutate)
submitToAPI = (data: DataType): Promise<ResponseType> => {
    return this.mutation.mutateAsync({ data }, this.mutationOptions());
};
```

```typescript
// ❌ WRONG - Using ReturnType which makes error type unknown
private mutation: ReturnType<typeof useCreateAppointment>

// ❌ WRONG - Casting error as unknown
onError: (error: unknown) => {
    const mutationError = error as SomeError; // Don't do this
}

// ❌ WRONG - Using mutate instead of mutateAsync
this.mutation.mutate({ data }, options); // Don't use mutate
```

### When Styling:

- Use global `colors` from `~/resources/colors/colors`
- Use global `typography` from `~/resources/colors/colors`
- Extract sub-components for reusability

---

## ❌ DON'Ts

| Don't | Do Instead |
|-------|------------|
| Create new action types as strings | Use existing `ActionEvent.XXX` |
| Create custom reducers | Use `ViewModel.reducer<T,R,S>(initialState)` |
| Put business logic in UI components | Put it in ModelView class |
| Make API calls directly in components | Use ModelView's `submitToAPI()` |
| Create inline styles with hardcoded colors | Use `colors.primary`, `typography.h4`, etc. |
| Skip the domain layer | Always define State interface + Zod schema |
| Pass `state` directly to useMemo deps | Use `stateRef` pattern for stable model |
| Use `ReturnType<typeof useMutation>` for mutation type | Explicitly type with `UseMutationResult<Response, Error, Variables, Context>` |
| Cast error as `unknown` in mutation callbacks | Type mutation properly so error type is known |
| Select entire objects from zustand when you only need one field | Select only the specific field: `useAuthStore(s => s.user?.username)` |
| Use hooks (useState, useEffect, useCallback) directly in UI/tsx files | Create a ModelView hook that manages all state and logic, UI only calls `useModelView()` |
| Put event handlers or logic functions in UI components | All handlers must be in ModelView class (e.g., `model.handleLogout()`) |
| Call useModelView hooks inside UI sub-components | Only top-level page calls useModelView, pass state/model via props to child components |
| Compose ModelView hooks in UI components | Compose in parent ModelView hook (e.g., useCancelModelView inside useUserAppointmentsModelView) |

---

## Reference Files

When unsure, look at these working examples:

| Feature | Domain | ModelView | UI |
|---------|--------|-----------|-----|
| Login | `domain/auth/Login.ts` | `model/auth/LoginViewModel.ts` | `pages/auth/login.tsx` |
| Register | `domain/user/Register.ts` | `model/auth/RegisterViewModel.ts` | `pages/auth/register.tsx` |
| Slots | `domain/slot/generated/Slot.ts` | `model/slot/SlotModelView.ts` | `pages/slots/appointment-slots.tsx` |
| Book Appointment | `domain/appointment/BookAppointment.ts` | `model/appointment/BookAppointmentModelView.ts` | `pages/appointment/` |

---

## Key Patterns to Follow

### 1. stateRef Pattern (Stable Model Instance)
```typescript
const stateRef = useRef(state);
stateRef.current = state;  // Update every render

const model = useMemo(
    () => new ModelView(stateRef, ...),
    [stableDispatch, resolver]  // NOT state
);
```

### 2. stableDispatch Pattern
```typescript
const stableDispatch = useCallback(
    (action) => dispatch(action),
    []  // Empty deps
);
```

### 3. getCurrentState Pattern (In Class)
```typescript
private getCurrentState(): FeatureState {
    return this.stateRef.current;
}
```

---

## Checklist Before Writing Code

- [ ] Have I read ARCHITECTURE.md?
- [ ] Am I following the Domain → ModelView → UI order?
- [ ] Am I using existing ActionEvent types?
- [ ] Am I extending the base ViewModel class?
- [ ] Am I using the stateRef pattern?
- [ ] Am I using global colors/typography?
- [ ] Have I looked at a similar working feature?

---

## Quick Commands

```bash
# Generate API from OpenAPI specs
npm run generate:api

# Run development server
npm run dev

# Build for production
npm run build
```

---

## File Naming

| Type | Pattern | Location |
|------|---------|----------|
| Domain | `Feature.ts` | `domain/feature/` |
| ModelView | `FeatureModelView.ts` | `model/feature/` |
| Page | `feature.tsx` | `pages/feature/` |
| Component | `ComponentName.tsx` | `pages/feature/` or `components/ui/` |
| Store | `FeatureStore.ts` | `model/feature/zustand/` |

---

## When Asked to Create Something New

1. **Ask yourself**: Does a similar pattern already exist?
2. **Look at imports**: Follow the dependency chain to understand structure
3. **Match the style**: Use same formatting, naming, and patterns
4. **Don't reinvent**: Use existing base classes, types, and utilities

---

## Summary

> **This project values consistency over creativity in architecture.**
> 
> Always follow the established MVVM pattern. When in doubt, look at `LoginViewModel.ts` as the reference implementation.
