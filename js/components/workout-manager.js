/**
 * WorkoutManager Web Component
 * Encapsulates the workout library management functionality including
 * filtering, sorting, selection, and CRUD operations
 */
export class WorkoutManager extends HTMLElement {
    constructor() {
        super();
        this.library = null;
        this.selectedWorkoutId = null;
        
        // Bind methods to maintain context
        this.handleTagInput = this.handleTagInput.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.handleWorkoutSelection = this.handleWorkoutSelection.bind(this);
        this.handleEditWorkout = this.handleEditWorkout.bind(this);
        this.handleDeleteWorkout = this.handleDeleteWorkout.bind(this);
        this.toggleSortOrder = this.toggleSortOrder.bind(this);
        this.clearAllFilters = this.clearAllFilters.bind(this);
    }
    
    /**
     * Set the workout library instance
     */
    setLibrary(library) {
        this.library = library;
        this.loadWorkouts();
    }
    
    /**
     * Define the component template
     */
    connectedCallback() {
        this.innerHTML = `
            <div class="workout-library md-card md-card--outlined" id="workoutLibrary" style="display: none;">
                <div class="md-card__content">
                    <h3 class="md-typescale-title-large">Saved Workouts</h3>
                    
                    <!-- Filtering and Sorting Controls -->
                    <div class="library-controls" id="libraryControls" style="display: none;">
                        <div class="filter-section">
                            <div class="filter-group">
                                <label class="md-typescale-body-medium">Filter by Tags:</label>
                                <div class="tag-filter-container">
                                    <div class="selected-tags" id="selectedTags"></div>
                                    <div class="tag-input-wrapper">
                                        <input type="text" id="tagFilterInput" class="md-text-field__input" placeholder="Type to filter tags...">
                                        <div class="tag-suggestions" id="tagSuggestions"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="filter-group">
                                <label class="md-typescale-body-medium">Filter by Duration:</label>
                                <div class="duration-filter">
                                    <select id="durationFilter" class="md-select__field">
                                        <option value="">Any Duration</option>
                                        <option value="0-900">Short (≤15 min)</option>
                                        <option value="900-1800">Medium (15-30 min)</option>
                                        <option value="1800-3600">Long (30-60 min)</option>
                                        <option value="3600+">Very Long (60+ min)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="sort-section">
                            <label class="md-typescale-body-medium">Sort by:</label>
                            <div class="sort-controls">
                                <select id="sortBySelect" class="md-select__field">
                                    <option value="name">Name</option>
                                    <option value="dateAdded">Date Added</option>
                                    <option value="lastUsed">Last Used</option>
                                    <option value="timesCompleted">Times Completed</option>
                                    <option value="duration">Duration</option>
                                </select>
                                <button id="sortOrderBtn" class="md-icon-button" title="Toggle sort order">
                                    <span class="material-icons" id="sortOrderIcon">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                        
                        <div class="filter-actions">
                            <button id="clearFiltersBtn" class="md-button md-button--outlined">
                                <span class="material-icons md-button__icon">clear</span>
                                <span class="md-button__label">Clear Filters</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="workout-selector">
                        <div class="md-select">
                            <select id="workoutSelect" class="md-select__field">
                                <option value="">Choose a saved workout...</option>
                            </select>
                            <span class="material-icons md-select__dropdown-icon">▼</span>
                        </div>
                        <div class="workout-info" id="workoutInfo" style="display: none;">
                            <div class="workout-meta">
                                <span class="workout-duration" id="workoutDuration"></span>
                                <span class="workout-exercises" id="workoutExercises"></span>
                                <span class="workout-completion" id="workoutCompletion"></span>
                            </div>
                            <div class="workout-tags" id="workoutTags"></div>
                        </div>
                        <div class="workout-actions">
                            <button id="editWorkoutBtn" class="md-button md-button--outlined" disabled>
                                <span class="material-icons md-button__icon">edit</span>
                                <span class="md-button__label">Edit</span>
                            </button>
                            <button id="deleteWorkoutBtn" class="md-button md-button--outlined" disabled>
                                <span class="material-icons md-button__icon">delete</span>
                                <span class="md-button__label">Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.bindEvents();
    }
    
    /**
     * Bind event handlers to component elements
     */
    bindEvents() {
        // Tag filtering
        const tagFilterInput = this.querySelector('#tagFilterInput');
        if (tagFilterInput) {
            tagFilterInput.addEventListener('input', () => this.updateTagSuggestions());
            tagFilterInput.addEventListener('keydown', this.handleTagInput);
        }
        
        // Filter and sort controls
        const durationFilter = this.querySelector('#durationFilter');
        const sortBySelect = this.querySelector('#sortBySelect');
        const sortOrderBtn = this.querySelector('#sortOrderBtn');
        const clearFiltersBtn = this.querySelector('#clearFiltersBtn');
        
        if (durationFilter) durationFilter.addEventListener('change', this.handleFilterChange);
        if (sortBySelect) sortBySelect.addEventListener('change', this.handleSortChange);
        if (sortOrderBtn) sortOrderBtn.addEventListener('click', this.toggleSortOrder);
        if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', this.clearAllFilters);
        
        // Workout selection and actions
        const workoutSelect = this.querySelector('#workoutSelect');
        const editWorkoutBtn = this.querySelector('#editWorkoutBtn');
        const deleteWorkoutBtn = this.querySelector('#deleteWorkoutBtn');
        
        if (workoutSelect) workoutSelect.addEventListener('change', this.handleWorkoutSelection);
        if (editWorkoutBtn) editWorkoutBtn.addEventListener('click', this.handleEditWorkout);
        if (deleteWorkoutBtn) deleteWorkoutBtn.addEventListener('click', this.handleDeleteWorkout);
    }
    
    /**
     * Load workouts and update display
     */
    loadWorkouts() {
        if (!this.library) return;
        
        const workouts = this.library.getAllWorkouts();
        const workoutLibrary = this.querySelector('#workoutLibrary');
        const workoutSelect = this.querySelector('#workoutSelect');
        
        if (workouts.length > 0) {
            workoutLibrary.style.display = 'block';
            
            // Show library controls for workout management
            const libraryControls = this.querySelector('#libraryControls');
            if (libraryControls) {
                libraryControls.style.display = 'block';
            }
            
            this.updateWorkoutSelector(workouts);
        } else {
            workoutLibrary.style.display = 'none';
        }
        
        this.updateActionButtonStates();
    }
    
    /**
     * Update workout selector with given workouts
     */
    updateWorkoutSelector(workouts) {
        const workoutSelect = this.querySelector('#workoutSelect');
        if (!workoutSelect) return;
        
        const currentSelection = workoutSelect.value;
        workoutSelect.innerHTML = '<option value="">Choose a saved workout...</option>';
        
        workouts.forEach(workout => {
            const option = document.createElement('option');
            option.value = workout.id;
            option.textContent = workout.name;
            workoutSelect.appendChild(option);
        });
        
        // Restore selection if it's still in the filtered results
        if (currentSelection && workouts.some(w => w.id === currentSelection)) {
            workoutSelect.value = currentSelection;
        }
        
        this.updateActionButtonStates();
        this.updateWorkoutInfo();
    }
    
    /**
     * Update workout info display
     */
    updateWorkoutInfo() {
        const workoutInfo = this.querySelector('#workoutInfo');
        const workoutDuration = this.querySelector('#workoutDuration');
        const workoutExercises = this.querySelector('#workoutExercises');
        const workoutCompletion = this.querySelector('#workoutCompletion');
        const workoutTags = this.querySelector('#workoutTags');
        const workoutSelect = this.querySelector('#workoutSelect');
        
        if (!workoutInfo || !workoutSelect) return;
        
        const selectedId = workoutSelect.value;
        if (selectedId && this.library) {
            const workout = this.library.getWorkout(selectedId);
            if (workout) {
                const duration = this.library.calculateWorkoutDuration(workout.data);
                const exercises = workout.data.exercises ? workout.data.exercises.filter(ex => ex.type !== 'rest').length : 0;
                
                workoutDuration.textContent = `Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
                workoutExercises.textContent = `${exercises} exercises`;
                workoutCompletion.textContent = `Completed ${workout.timesCompleted || 0} times`;
                
                // Display tags
                if (workout.tags && workout.tags.length > 0) {
                    workoutTags.innerHTML = workout.tags.map(tag => 
                        `<span class="workout-tag">${tag}</span>`
                    ).join('');
                } else {
                    workoutTags.innerHTML = '<span class="no-tags">No tags</span>';
                }
                
                workoutInfo.style.display = 'block';
            } else {
                workoutInfo.style.display = 'none';
            }
        } else {
            workoutInfo.style.display = 'none';
        }
    }
    
    /**
     * Update action button states
     */
    updateActionButtonStates() {
        const workoutSelect = this.querySelector('#workoutSelect');
        const editWorkoutBtn = this.querySelector('#editWorkoutBtn');
        const deleteWorkoutBtn = this.querySelector('#deleteWorkoutBtn');
        
        if (!workoutSelect || !editWorkoutBtn || !deleteWorkoutBtn) return;
        
        const hasSelection = workoutSelect.value !== '';
        editWorkoutBtn.disabled = !hasSelection;
        deleteWorkoutBtn.disabled = !hasSelection;
    }
    
    /**
     * Apply current filters and sorting
     */
    applyFiltersAndSort() {
        if (!this.library) return;
        
        const selectedTags = this.getSelectedTags();
        const durationFilter = this.querySelector('#durationFilter');
        const sortBySelect = this.querySelector('#sortBySelect');
        const sortOrderIcon = this.querySelector('#sortOrderIcon');
        
        if (!durationFilter || !sortBySelect || !sortOrderIcon) return;
        
        const durationRange = durationFilter.value;
        const sortBy = sortBySelect.value;
        const sortOrder = sortOrderIcon.textContent === 'arrow_upward' ? 'asc' : 'desc';
        
        // Build filter options
        const filterOptions = { sortBy, sortOrder };
        
        if (selectedTags.length > 0) {
            filterOptions.tags = selectedTags;
        }
        
        if (durationRange) {
            if (durationRange === '3600+') {
                filterOptions.minDuration = 3600;
            } else if (durationRange.includes('-')) {
                const [min, max] = durationRange.split('-').map(Number);
                filterOptions.minDuration = min;
                filterOptions.maxDuration = max;
            }
        }
        
        // Get filtered workouts
        const filteredWorkouts = this.library.getFilteredWorkouts(filterOptions);
        this.updateWorkoutSelector(filteredWorkouts);
    }
    
    /**
     * Get currently selected tags
     */
    getSelectedTags() {
        const selectedTags = this.querySelector('#selectedTags');
        if (!selectedTags) return [];
        
        const tagElements = selectedTags.querySelectorAll('.selected-tag');
        return Array.from(tagElements).map(el => el.textContent.replace('×', '').trim());
    }
    
    /**
     * Update tag suggestions based on input
     */
    updateTagSuggestions() {
        if (!this.library) return;
        
        const tagFilterInput = this.querySelector('#tagFilterInput');
        const tagSuggestions = this.querySelector('#tagSuggestions');
        
        if (!tagFilterInput || !tagSuggestions) return;
        
        const inputValue = tagFilterInput.value.toLowerCase().trim();
        if (inputValue.length === 0) {
            tagSuggestions.style.display = 'none';
            return;
        }
        
        const allTags = this.library.getAllTags();
        const selectedTags = this.getSelectedTags().map(tag => tag.toLowerCase());
        
        const matchingTags = allTags.filter(tag => 
            tag.includes(inputValue) && !selectedTags.includes(tag)
        );
        
        if (matchingTags.length > 0) {
            tagSuggestions.innerHTML = matchingTags.map(tag => 
                `<div class="tag-suggestion" data-tag="${tag}">${tag}</div>`
            ).join('');
            tagSuggestions.style.display = 'block';
            
            // Add click handlers to suggestions
            tagSuggestions.querySelectorAll('.tag-suggestion').forEach(suggestion => {
                suggestion.addEventListener('click', () => {
                    this.selectTag(suggestion.dataset.tag);
                });
            });
        } else {
            tagSuggestions.style.display = 'none';
        }
    }
    
    /**
     * Select a tag for filtering
     */
    selectTag(tag) {
        const selectedTags = this.querySelector('#selectedTags');
        const tagSuggestions = this.querySelector('#tagSuggestions');
        const tagFilterInput = this.querySelector('#tagFilterInput');
        
        if (!selectedTags) return;
        
        // Check if tag is already selected
        const existing = selectedTags.querySelector(`[data-tag="${tag}"]`);
        if (existing) return;
        
        // Add tag to selected tags
        const tagElement = document.createElement('span');
        tagElement.className = 'selected-tag';
        tagElement.setAttribute('data-tag', tag);
        tagElement.innerHTML = `${tag} <span class="remove-tag">×</span>`;
        
        // Add click handler for remove
        const removeBtn = tagElement.querySelector('.remove-tag');
        removeBtn.addEventListener('click', () => this.removeTag(tag));
        
        selectedTags.appendChild(tagElement);
        
        // Clear input and hide suggestions
        if (tagFilterInput) tagFilterInput.value = '';
        if (tagSuggestions) tagSuggestions.style.display = 'none';
        
        // Apply filters
        this.applyFiltersAndSort();
    }
    
    /**
     * Remove a selected tag
     */
    removeTag(tag) {
        const selectedTags = this.querySelector('#selectedTags');
        if (!selectedTags) return;
        
        const tagElement = selectedTags.querySelector(`[data-tag="${tag}"]`);
        if (tagElement) {
            tagElement.remove();
            this.applyFiltersAndSort();
        }
    }
    
    /**
     * Toggle sort order between ascending and descending
     */
    toggleSortOrder() {
        const sortOrderIcon = this.querySelector('#sortOrderIcon');
        if (!sortOrderIcon) return;
        
        if (sortOrderIcon.textContent === 'arrow_upward') {
            sortOrderIcon.textContent = 'arrow_downward';
        } else {
            sortOrderIcon.textContent = 'arrow_upward';
        }
        
        this.applyFiltersAndSort();
    }
    
    /**
     * Clear all filters and reset to show all workouts
     */
    clearAllFilters() {
        const tagFilterInput = this.querySelector('#tagFilterInput');
        const selectedTags = this.querySelector('#selectedTags');
        const durationFilter = this.querySelector('#durationFilter');
        const sortBySelect = this.querySelector('#sortBySelect');
        const sortOrderIcon = this.querySelector('#sortOrderIcon');
        
        if (tagFilterInput) tagFilterInput.value = '';
        if (selectedTags) selectedTags.innerHTML = '';
        if (durationFilter) durationFilter.value = '';
        if (sortBySelect) sortBySelect.value = 'name';
        if (sortOrderIcon) sortOrderIcon.textContent = 'arrow_upward';
        
        // Reset to show all workouts
        this.loadWorkouts();
    }
    
    /**
     * Handle tag input (Enter or comma to add tag)
     */
    handleTagInput(event) {
        const tagFilterInput = this.querySelector('#tagFilterInput');
        if (!tagFilterInput) return;
        
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            const tag = tagFilterInput.value.trim();
            if (tag) {
                this.selectTag(tag);
            }
        }
    }
    
    /**
     * Handle filter changes
     */
    handleFilterChange() {
        this.applyFiltersAndSort();
    }
    
    /**
     * Handle sort changes
     */
    handleSortChange() {
        this.applyFiltersAndSort();
    }
    
    /**
     * Handle workout selection
     */
    handleWorkoutSelection() {
        const workoutSelect = this.querySelector('#workoutSelect');
        if (!workoutSelect) return;
        
        this.selectedWorkoutId = workoutSelect.value;
        this.updateActionButtonStates();
        this.updateWorkoutInfo();
        
        // Dispatch custom event for parent component
        this.dispatchEvent(new CustomEvent('workout-selected', {
            detail: { workoutId: this.selectedWorkoutId },
            bubbles: true
        }));
    }
    
    /**
     * Handle edit workout button click
     */
    handleEditWorkout() {
        if (this.selectedWorkoutId) {
            this.dispatchEvent(new CustomEvent('workout-edit', {
                detail: { workoutId: this.selectedWorkoutId },
                bubbles: true
            }));
        }
    }
    
    /**
     * Handle delete workout button click
     */
    handleDeleteWorkout() {
        if (this.selectedWorkoutId) {
            this.dispatchEvent(new CustomEvent('workout-delete', {
                detail: { workoutId: this.selectedWorkoutId },
                bubbles: true
            }));
        }
    }
    
    /**
     * Public method to refresh the component when workouts change
     */
    refresh() {
        this.loadWorkouts();
    }
    
    /**
     * Get the currently selected workout ID
     */
    getSelectedWorkoutId() {
        return this.selectedWorkoutId;
    }
    
    /**
     * Set the selected workout ID
     */
    setSelectedWorkoutId(workoutId) {
        const workoutSelect = this.querySelector('#workoutSelect');
        if (workoutSelect) {
            workoutSelect.value = workoutId || '';
            this.selectedWorkoutId = workoutId;
            this.updateActionButtonStates();
            this.updateWorkoutInfo();
        }
    }
}

// Register the custom element
customElements.define('workout-manager', WorkoutManager);