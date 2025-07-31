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
        //this.handleWorkoutSelection = this.handleWorkoutSelection.bind(this);
        //this.handleEditWorkout = this.handleEditWorkout.bind(this);
        //this.handleDeleteWorkout = this.handleDeleteWorkout.bind(this);
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
                    
                <div class="md-top-app-bar__actions">
                    <button id="newWorkoutHeaderBtn" class="md-button md-button--filled">
                        <span class="material-icons md-button__icon">add</span>
                        <span class="md-button__label">Add new workout</span>
                    </button>
                </div>
                    <!-- Workout Table -->
                    <div class="workout-table-container">
                        <table class="workout-table" id="workoutTable">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Duration</th>
                                    <th>Exercises</th>
                                    <th>Completed</th>
                                    <th>Tags</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="workoutTableBody">
                                <!-- Workout rows will be populated here -->
                            </tbody>
                        </table>
                        <div class="no-workouts" id="noWorkoutsMessage" style="display: none;">
                            <p class="md-typescale-body-large">No workouts found. Create your first workout!</p>
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
    }
    
    /**
     * Load workouts and update display
     */
    loadWorkouts() {
        if (!this.library) return;
        
        const workouts = this.library.getAllWorkouts();
        const workoutLibrary = this.querySelector('#workoutLibrary');
        
        if (workouts.length > 0) {
            workoutLibrary.style.display = 'block';
            
            // Show library controls for workout management
            const libraryControls = this.querySelector('#libraryControls');
            if (libraryControls) {
                libraryControls.style.display = 'block';
            }
            
            this.updateWorkoutTable(workouts);
        } else {
            workoutLibrary.style.display = 'none';
        }
    }
    
    /**
     * Update workout table with given workouts
     */
    updateWorkoutTable(workouts) {
        const workoutTableBody = this.querySelector('#workoutTableBody');
        const noWorkoutsMessage = this.querySelector('#noWorkoutsMessage');
        
        if (!workoutTableBody) return;
        
        if (workouts.length === 0) {
            workoutTableBody.innerHTML = '';
            noWorkoutsMessage.style.display = 'block';
            return;
        }
        
        noWorkoutsMessage.style.display = 'none';
        
        workoutTableBody.innerHTML = workouts.map(workout => {
            const duration = this.library.calculateWorkoutDuration(workout.data);
            const exercises = workout.data.exercises ? workout.data.exercises.filter(ex => ex.type !== 'rest').length : 0;
            const durationFormatted = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
            const tags = workout.tags && workout.tags.length > 0 
                ? workout.tags.map(tag => `<span class="workout-tag">${tag}</span>`).join('')
                : '<span class="no-tags">No tags</span>';
            
            return `
                <tr class="workout-row" data-workout-id="${workout.id}">
                    <td class="workout-name">
                        <div class="workout-name-text">${workout.name}</div>
                        <div class="workout-name-meta">${workout.data.title || ''}</div>
                    </td>
                    <td class="workout-duration">${durationFormatted}</td>
                    <td class="workout-exercises">${exercises}</td>
                    <td class="workout-completed">${workout.timesCompleted || 0}</td>
                    <td class="workout-tags">${tags}</td>
                    <td class="workout-actions">
                        <button class="md-icon-button share-workout-btn" data-workout-id="${workout.id}" title="Share Workout">
                            <span class="material-icons">share</span>
                        </button>
                        <button class="md-icon-button edit-workout-btn" data-workout-id="${workout.id}" title="Edit Workout">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="md-icon-button start-workout-btn" data-workout-id="${workout.id}" title="Start Training">
                            <span class="material-icons">play_arrow</span>
                        </button>
                        <button class="md-icon-button delete-workout-btn" data-workout-id="${workout.id}" title="Delete Workout">
                            <span class="material-icons">delete</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Bind action button events
        this.bindRowActionEvents();
    }
    
    /**
     * Bind events to row action buttons
     */
    bindRowActionEvents() {
        // Share buttons
        this.querySelectorAll('.share-workout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const workoutId = btn.dataset.workoutId;
                this.handleShareWorkout(workoutId);
            });
        });
        
        // Edit buttons
        this.querySelectorAll('.edit-workout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const workoutId = btn.dataset.workoutId;
                this.handleEditWorkout(workoutId);
            });
        });
        
        // Start training buttons
        this.querySelectorAll('.start-workout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const workoutId = btn.dataset.workoutId;
                this.handleStartTraining(workoutId);
            });
        });
        
        // Delete buttons
        this.querySelectorAll('.delete-workout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const workoutId = btn.dataset.workoutId;
                this.handleDeleteWorkout(workoutId);
            });
        });
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
        this.updateWorkoutTable(filteredWorkouts);
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
     * Public method to refresh the component when workouts change
     */
    refresh() {
        this.loadWorkouts();
    }
}

// Register the custom element
customElements.define('workout-manager', WorkoutManager);