# Testing and Debugging Guide

## Manual Testing Checklist

### Core Functionality Tests

#### Task Addition
- [ ] Add task with valid text
- [ ] Try to add empty task (should show error)
- [ ] Add task with maximum length (100 characters)
- [ ] Try to add task exceeding maximum length (should show error)
- [ ] Add task using Enter key
- [ ] Add task using Add button
- [ ] Add duplicate task (should show error)
- [ ] Add task with special characters and emojis

#### Task Display
- [ ] Verify tasks appear in the list immediately
- [ ] Check task counter updates correctly
- [ ] Verify empty state shows when no tasks
- [ ] Check task order (newest first/last)

#### Task Completion
- [ ] Toggle task completion using checkbox
- [ ] Verify visual changes (strikethrough, opacity)
- [ ] Check task counter updates
- [ ] Toggle back to incomplete

#### Task Editing
- [ ] Double-click task to edit
- [ ] Click Edit button
- [ ] Save edit using Enter key
- [ ] Save edit using Save button
- [ ] Cancel edit using Escape key
- [ ] Cancel edit using Cancel button
- [ ] Try to save empty text (should show error)
- [ ] Try to save duplicate text (should show error)

#### Task Deletion
- [ ] Delete task using Delete button
- [ ] Confirm deletion in modal
- [ ] Cancel deletion in modal
- [ ] Verify task is removed from list
- [ ] Check task counter updates

### Advanced Features

#### Filtering
- [ ] Test "All" filter (default)
- [ ] Test "Active" filter (incomplete tasks only)
- [ ] Test "Completed" filter (completed tasks only)
- [ ] Verify filter buttons highlight correctly
- [ ] Check empty states for each filter

#### Bulk Actions
- [ ] Clear completed tasks
- [ ] Clear all tasks
- [ ] Verify confirmation modals
- [ ] Check button states (enabled/disabled)

#### Data Persistence
- [ ] Add tasks and refresh page
- [ ] Verify tasks persist after browser restart
- [ ] Test with browser private/incognito mode
- [ ] Clear localStorage and verify reset

### User Experience Tests

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Use Enter to submit forms
- [ ] Use Escape to cancel actions
- [ ] Test keyboard shortcuts

#### Responsive Design
- [ ] Test on mobile devices (320px width)
- [ ] Test on tablets (768px width)
- [ ] Test on desktop (1200px+ width)
- [ ] Verify touch targets are adequate (44px minimum)

#### Accessibility
- [ ] Test with screen reader
- [ ] Verify all interactive elements have labels
- [ ] Check color contrast ratios
- [ ] Test keyboard-only navigation
- [ ] Verify ARIA attributes

## Automated Testing Examples

### Unit Tests (Jest)
```javascript
// task-manager.test.js
describe('TaskManager', () => {
    let taskManager;
    
    beforeEach(() => {
        taskManager = new TaskManager();
    });
    
    test('should add a new task', () => {
        const task = taskManager.addTask('Test task');
        expect(task.text).toBe('Test task');
        expect(task.completed).toBe(false);
        expect(taskManager.tasks).toHaveLength(1);
    });
    
    test('should not add empty task', () => {
        expect(() => taskManager.addTask('')).toThrow('Task text cannot be empty');
    });
    
    test('should toggle task completion', () => {
        const task = taskManager.addTask('Test task');
        taskManager.toggleTask(task.id);
        expect(task.completed).toBe(true);
    });
    
    test('should delete task', () => {
        const task = taskManager.addTask('Test task');
        taskManager.deleteTask(task.id);
        expect(taskManager.tasks).toHaveLength(0);
    });
    
    test('should filter tasks correctly', () => {
        taskManager.addTask('Task 1');
        const task2 = taskManager.addTask('Task 2');
        taskManager.toggleTask(task2.id);
        
        const activeTasks = taskManager.getFilteredTasks('active');
        const completedTasks = taskManager.getFilteredTasks('completed');
        
        expect(activeTasks).toHaveLength(1);
        expect(completedTasks).toHaveLength(1);
    });
});
```

### Integration Tests (Cypress)
```javascript
// cypress/integration/todo-app.spec.js
describe('Todo App', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.clearLocalStorage();
    });
    
    it('should add a new task', () => {
        cy.get('#taskInput').type('New task');
        cy.get('#addBtn').click();
        
        cy.get('.task-item').should('have.length', 1);
        cy.get('.task-text').should('contain', 'New task');
        cy.get('#taskCount').should('contain', '1 task remaining');
    });
    
    it('should complete a task', () => {
        cy.get('#taskInput').type('Test task');
        cy.get('#addBtn').click();
        
        cy.get('.task-checkbox').click();
        cy.get('.task-text').should('have.class', 'completed');
        cy.get('#taskCount').should('contain', 'All tasks completed');
    });
    
    it('should edit a task', () => {
        cy.get('#taskInput').type('Original task');
        cy.get('#addBtn').click();
        
        cy.get('.task-text').dblclick();
        cy.get('.task-edit-input').clear().type('Edited task');
        cy.get('.save-btn').click();
        
        cy.get('.task-text').should('contain', 'Edited task');
    });
    
    it('should persist tasks after reload', () => {
        cy.get('#taskInput').type('Persistent task');
        cy.get('#addBtn').click();
        
        cy.reload();
        cy.get('.task-item').should('have.length', 1);
        cy.get('.task-text').should('contain', 'Persistent task');
    });
    
    it('should filter tasks correctly', () => {
        cy.get('#taskInput').type('Active task');
        cy.get('#addBtn').click();
        cy.get('#taskInput').type('Completed task');
        cy.get('#addBtn').click();
        
        cy.get('.task-checkbox').last().click();
        
        cy.get('[data-filter="active"]').click();
        cy.get('.task-item').should('have.length', 1);
        cy.get('.task-text').should('contain', 'Active task');
        
        cy.get('[data-filter="completed"]').click();
        cy.get('.task-item').should('have.length', 1);
        cy.get('.task-text').should('contain', 'Completed task');
    });
});
```

## Debugging Strategies

### Browser Developer Tools

#### Console Debugging
```javascript
// Add debug methods to your TodoApp class
debug() {
    console.group('Todo App Debug Info');
    console.log('Tasks:', this.tasks);
    console.log('Current Filter:', this.currentFilter);
    console.log('Editing Task ID:', this.editingTaskId);
    console.log('Task Counter:', this.taskIdCounter);
    console.log('Stats:', this.getStats());
    console.groupEnd();
}

// Usage in console
todoApp.debug();
```

#### Elements Tab
- Inspect DOM structure
- Modify CSS in real-time
- Check computed styles
- Verify accessibility attributes

#### Application Tab
- Inspect localStorage data
- Clear storage for testing
- Monitor storage changes

### Common Issues and Solutions

#### Tasks Not Persisting
```javascript
// Check if localStorage is available
if (typeof Storage !== 'undefined') {
    // localStorage is supported
} else {
    console.warn('localStorage not supported');
    // Implement fallback or show warning
}

// Check for storage quota errors
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
} catch (e) {
    if (e.code === 22) {
        console.error('Storage quota exceeded');
    }
}
```

#### Event Listeners Not Working
```javascript
// Verify elements exist before binding
if (this.elements.addBtn) {
    this.elements.addBtn.addEventListener('click', this.addTask.bind(this));
} else {
    console.error('Add button not found');
}

// Use event delegation for dynamic content
document.addEventListener('click', (e) => {
    if (e.target.matches('.delete-btn')) {
        // Handle delete
    }
});
```

#### Memory Leaks
```javascript
// Clean up event listeners
destroy() {
    this.elements.addBtn.removeEventListener('click', this.addTask);
    // Remove other listeners
}

// Use AbortController for modern cleanup
const controller = new AbortController();
element.addEventListener('click', handler, {
    signal: controller.signal
});

// Later: controller.abort(); // Removes all listeners
```

### Performance Monitoring

#### Measure Render Performance
```javascript
performance.mark('render-start');
this.renderTasks();
performance.mark('render-end');
performance.measure('render-time', 'render-start', 'render-end');

const measures = performance.getEntriesByType('measure');
console.log('Render time:', measures[0].duration, 'ms');
```

#### Monitor Memory Usage
```javascript
// Check memory usage (Chrome only)
if (performance.memory) {
    console.log('Used:', performance.memory.usedJSHeapSize);
    console.log('Total:', performance.memory.totalJSHeapSize);
    console.log('Limit:', performance.memory.jsHeapSizeLimit);
}
```

### Error Handling

#### Global Error Handler
```javascript
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // Log to error reporting service
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // Log to error reporting service
});
```

#### Try-Catch Blocks
```javascript
async saveTask(task) {
    try {
        await this.api.saveTask(task);
    } catch (error) {
        console.error('Failed to save task:', error);
        this.showError('Failed to save task. Please try again.');
        // Revert optimistic update
        this.revertTask(task);
    }
}
```

## Testing Tools Setup

### Jest Configuration
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"]
  }
}
```

### Cypress Configuration
```json
// cypress.json
{
  "baseUrl": "http://localhost:3000",
  "viewportWidth": 1280,
  "viewportHeight": 720,
  "video": false,
  "screenshotOnRunFailure": true
}
```

### ESLint for Code Quality
```json
// .eslintrc.json
{
  "extends": ["eslint:recommended"],
  "env": {
    "browser": true,
    "es2021": true,
    "jest": true
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

## Accessibility Testing

### Screen Reader Testing
- Test with NVDA (Windows)
- Test with JAWS (Windows)
- Test with VoiceOver (macOS)

### Automated Accessibility Testing
```javascript
// Using axe-core
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
});
```

### Manual Accessibility Checks
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Images have alt text
- [ ] Form inputs have labels
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced

This comprehensive testing guide ensures your To-Do List application is robust, accessible, and performs well across different devices and browsers.
