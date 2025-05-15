
# Guidelines for State Management in the Copy Trade App

## State Management Overview

The application uses two distinct state stores that serve different purposes:

### AppStore
- **Purpose**: Persistent storage that maintains data across application restarts
- **Implementation**: Uses `electron-store` to save data to disk
- **Content**: Contains data that should be preserved between sessions, such as:
  - Bot configurations
  - User preferences
  - Application settings
  - Trading history

### AppSession
- **Purpose**: Temporary storage that resets when the application restarts
- **Implementation**: In-memory JavaScript object
- **Content**: Contains ephemeral data such as:
  - Current runtime state
  - Active connections
  - Temporary UI state
  - Session-specific counters

## Guidelines for Using State Stores

### When to Use AppStore
- Use for any data that needs to persist between application restarts
- Examples:
  - User configurations
  - Bot definitions and settings
  - Trading account credentials
  - Historical data that needs to be preserved

### When to Use AppSession
- Use for temporary data that only needs to exist during the current session
- Examples:
  - Currently running bot IDs
  - Active connection statuses
  - Temporary UI states
  - Runtime performance metrics

### Accessing State from Main Process
```typescript
// Import the necessary functions
import { getAppState, setAppState, getSessionState, setSessionState } from '../store'

// Get current state
const appState = getAppState()
const sessionState = getSessionState()

// Update state
setAppState({
  ...appState,
  // your updates here
})

setSessionState({
  ...sessionState,
  // your updates here
})
```

### Accessing State from Renderer Process
```typescript
// Get current state
const appState = window.store.getAppState()
const sessionState = window.store.getSessionState()

// Update state
window.store.setAppState({
  ...appState,
  // your updates here
})

window.store.setSessionState({
  ...sessionState,
  // your updates here
})

// Listen for state updates
window.store.onAppStateUpdate((state) => {
  // Handle updated app state
})

window.store.onSessionStateUpdate((state) => {
  // Handle updated session state
})
```

### Best Practices
1. **Single Source of Truth**: The main process is the source of truth for all state
2. **Minimize State Updates**: Batch state updates when possible to reduce IPC communication
3. **Use Typed Interfaces**: Always use the defined TypeScript interfaces for state objects
4. **Separate Concerns**: Keep persistent and session data separate
5. **Broadcast Changes**: After updating state in the main process, use `broadcastState()` to notify all renderer processes

## State Structure

### AppState Interface
```typescript
export interface AppState {
  appCounter: number
  bots: Bot[]
  // Add new persistent properties here
}
```

### SessionState Interface
```typescript
export interface SessionState {
  sessionCounter: number
  runningBot: RunningBot | null
  // Add new session-specific properties here
}
```

By following these guidelines, you'll maintain a clean separation between persistent and temporary state, making your application more predictable and easier to maintain.

Junie is allowed to edit this file to do changes (for example if the interface changes)
