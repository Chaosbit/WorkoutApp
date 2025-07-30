# Workout Timer PWA - Refactored Architecture

This application has been successfully refactored from a monolithic 889-line `script.js` file into a modular, maintainable architecture.

## New File Structure

```
js/
├── app.js                 # Main application initialization
├── workout-app.js         # Main coordinator class (700+ lines)
├── workout-parser.js      # Markdown parsing logic (134 lines)
├── workout-library.js     # localStorage persistence (86 lines)
├── audio-manager.js       # Web Audio API management (72 lines)
├── timer-manager.js       # Countdown timer logic (140 lines)
└── sw-registration.js     # Service worker registration (20 lines)
```

## Architecture Improvements

### Separation of Concerns
- **Data Layer**: `WorkoutLibrary` handles all localStorage operations
- **Business Logic**: `WorkoutParser` handles markdown parsing, `TimerManager` handles timing
- **Presentation Layer**: `WorkoutApp` coordinates UI interactions
- **System Layer**: `AudioManager` handles notifications, Service Worker handles PWA features

### Key Benefits
- **Maintability**: Each module has a single, clear responsibility
- **Testability**: Classes can be tested in isolation
- **Reusability**: Modules can be imported independently
- **Debugging**: Easier to locate and fix issues
- **Performance**: Better code splitting and loading

### Backward Compatibility
- All existing functionality preserved
- PWA features maintained (offline support, installability)
- Test suite compatibility maintained
- API compatibility for existing integrations

## Module Responsibilities

### WorkoutApp (Primary Coordinator)
- DOM element management and event binding
- User interaction handling (start, pause, skip, reset)
- Workout editing and creation workflows
- UI state management and updates
- Integration between all other modules

### WorkoutParser (Pure Functions)
- Markdown syntax parsing
- Exercise type detection (timer vs reps vs sets)
- Validation and error handling
- Data structure normalization

### WorkoutLibrary (Data Persistence)
- localStorage CRUD operations
- Workout metadata management
- Data serialization/deserialization
- Storage error handling

### TimerManager (Timer Logic)
- Countdown functionality with callbacks
- Progress calculation
- Timer state management (running, paused, stopped)
- Time formatting utilities

### AudioManager (Notifications)
- Web Audio API initialization
- Sound generation for exercise completion
- Workout completion melodies
- Audio context management

### Service Worker Registration
- PWA capability registration
- Offline caching setup
- Background sync preparation

This refactored architecture provides a solid foundation for future development while maintaining all existing functionality.