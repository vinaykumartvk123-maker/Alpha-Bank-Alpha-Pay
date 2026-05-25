# AlphaBank Development Guide

## Development Workflow & Contributing

---

## 🛠️ Development Setup

### Initial Setup

```bash
# Clone repository
git clone https://github.com/alphabank/alpha-bank-react.git
cd alpha-bank-react

# Install dependencies
npm install

# Start development server
npm run dev

# App will be available at http://localhost:3000
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Global components (Modal, Toast, etc.)
│   └── layout/         # Layout wrappers
├── pages/              # Page components (lazy-loaded)
├── router/             # Route guards
├── store/              # State management (Context API)
├── utils/              # Utility functions
└── index.css           # Global styles & animations
```

---

## 🔄 Git Workflow

### Branch Naming

```
feature/feature-name       # New feature
bugfix/bug-description     # Bug fix
hotfix/issue-critical      # Critical production fix
docs/documentation-topic   # Documentation
refactor/code-area         # Code refactoring
```

### Commit Convention

```bash
# Format: [TYPE] description

git commit -m "[feat] Add UPI PIN verification modal"
git commit -m "[fix] Resolve transfer amount validation"
git commit -m "[docs] Update deployment guide"
git commit -m "[refactor] Optimize AppContext re-renders"
git commit -m "[perf] Reduce bundle size by 15%"

# Types: feat, fix, docs, refactor, perf, test, chore, ci
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes and commit
3. Push branch to GitHub
4. Open PR with description
5. Wait for code review
6. Make requested changes if needed
7. Merge to main (squash commits recommended)
8. Delete feature branch

---

## 📝 Coding Standards

### JavaScript/JSX

```javascript
// ✅ Good
export default function LoginForm() {
  const [email, setEmail] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      showToast("Invalid email", "error");
      return;
    }
    // Process
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* JSX */}
    </form>
  );
}

// ❌ Bad
const LoginForm = () => {
  let email = "";  // Use state, not let
  
  // Missing error handling
  const handleSubmit = () => {
    processEmail(email);  // Not preventing default
  };
};
```

### Components

**Functional components with hooks:**
```javascript
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../store/AppContext';

export default function MyComponent({ prop1, prop2 = defaultValue }) {
  const [state, setState] = useState(initialValue);
  const { currentUser } = useApp();
  
  useEffect(() => {
    // Effect logic
  }, [dep1, dep2]);
  
  const handleEvent = useCallback(() => {
    // Logic
  }, [dep]);
  
  return <div>{/* JSX */}</div>;
}
```

**Context Usage:**
```javascript
// Custom hook pattern
const { currentUser, updateUser, showToast } = useApp();

// Or direct import
import { useApp } from '../store/AppContext';
```

### File Naming

```
components/
  common/
    UserCard.jsx         # ✅ PascalCase for components
    user-helpers.js      # ✅ kebab-case for utilities
  
pages/
  app/
    Dashboard.jsx        # ✅ PascalCase
    index.js            # ✅ Main export file
```

### CSS Classes

```jsx
// ✅ Use Tailwind classes
<div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800">
  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
    Hello World
  </span>
</div>

// ❌ Avoid custom CSS unless necessary
// <div className="custom-card">  // Not recommended
```

---

## 🏗️ Adding New Features

### Example: Add New Banking Feature

#### 1. Create Page Component

```javascript
// src/pages/app/MyNewFeature.jsx
import { useState } from 'react';
import { useApp } from '../../store/AppContext';

export default function MyNewFeature() {
  const [state, setState] = useState(initialValue);
  const { currentUser, showToast } = useApp();
  
  const handleAction = async () => {
    try {
      // Logic here
      showToast('Success!', 'success');
    } catch (error) {
      showToast(`Error: ${error.message}`, 'error');
    }
  };
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My New Feature</h1>
      {/* Feature UI */}
    </div>
  );
}
```

#### 2. Add Route in App.jsx

```javascript
import { lazy } from 'react';

const MyNewFeature = lazy(() => import('./pages/app/MyNewFeature'));

// In router configuration:
{
  path: '/app/my-feature',
  element: (
    <Suspense fallback={<LoadingSpinner />}>
      <ErrorBoundary>
        <MyNewFeature />
      </ErrorBoundary>
    </Suspense>
  ),
}
```

#### 3. Add Navigation Item

```javascript
// In src/utils/constants.js
export const NAV_ITEMS = [
  // ... existing items
  {
    path: '/app/my-feature',
    icon: 'fa-icon-name',
    label: 'My Feature',
    role: 'user'
  }
];
```

#### 4. Add Tests (if applicable)

```javascript
// src/pages/app/__tests__/MyNewFeature.test.jsx
import { render, screen } from '@testing-library/react';
import MyNewFeature from '../MyNewFeature';

describe('MyNewFeature', () => {
  it('should render feature title', () => {
    render(<MyNewFeature />);
    expect(screen.getByText('My New Feature')).toBeInTheDocument();
  });
});
```

---

## 🎨 Styling Guidelines

### Tailwind Classes

```jsx
// ✅ Good: Organized, readable, reusable
const Card = ({ children, variant = 'default' }) => {
  const baseStyles = 'rounded-lg p-6 shadow-md';
  const variants = {
    default: 'bg-white dark:bg-slate-800',
    elevated: 'bg-white shadow-xl dark:bg-slate-700',
    outline: 'bg-transparent border border-slate-200 dark:border-slate-700'
  };
  
  return (
    <div className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </div>
  );
};

// ❌ Bad: Repetitive, hard to maintain
<div className="rounded-lg p-6 shadow-md bg-white dark:bg-slate-800">
  <div className="rounded-lg p-6 shadow-md bg-white dark:bg-slate-800">
    {/* Duplicated styles */}
  </div>
</div>
```

### Dark Mode Support

```jsx
// Always include dark mode classes
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  {/* Content */}
</div>

// Use Tailwind dark: prefix
className="text-gray-700 dark:text-gray-300"
```

### Responsive Design

```jsx
// Mobile-first approach
<div className="
  text-sm md:text-base lg:text-lg                  // Font size
  px-4 md:px-6 lg:px-8                             // Padding
  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4        // Layout
  flex-col md:flex-row                             // Direction
">
  {/* Content */}
</div>
```

### Custom Animations

```jsx
// Use predefined animations from index.css
<div className="animate-slide-in">
  {/* Slides in from right */}
</div>

<div className="animate-ticker">
  {/* Continuous scrolling */}
</div>

// Add custom keyframe to index.css if needed
@keyframes customAnimation {
  from { /* start state */ }
  to { /* end state */ }
}
.animate-custom { animation: customAnimation 1s ease-in-out; }
```

---

## 💾 State Management

### Using AppContext

```javascript
import { useApp } from '../store/AppContext';

export default function MyComponent() {
  const {
    currentUser,          // Current logged-in user
    updateUser,           // Update user data
    addTransaction,       // Add transaction
    addNotification,      // Queue notification
    showToast,           // Show toast message
    openModal,           // Open modal with content
    toggleDarkMode,      // Toggle dark mode
  } = useApp();
  
  // Usage
  const handleTransfer = async () => {
    try {
      // Simulate transfer
      addTransaction({
        type: 'transfer',
        desc: `Transfer to ${recipientName}`,
        amount: amount,
        category: 'Transfer'
      });
      
      showToast('Transfer successful!', 'success');
    } catch (error) {
      showToast(`Error: ${error}`, 'error');
    }
  };
}
```

### Using RatesContext

```javascript
import { useRates } from '../store/RatesContext';

export default function PriceDisplay() {
  const rates = useRates(); // { USD, EUR, GBP }
  
  return (
    <div>
      USD/INR: ₹{rates.USD.toFixed(2)}
      EUR/INR: ₹{rates.EUR.toFixed(2)}
      GBP/INR: ₹{rates.GBP.toFixed(2)}
    </div>
  );
}
```

### Creating New Context (if needed)

```javascript
// src/store/MyContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const MyContext = createContext();

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};

export const MyProvider = ({ children }) => {
  const [state, setState] = useState({});
  
  useEffect(() => {
    // Side effects
  }, []);
  
  const value = {
    state,
    setState,
    // Add methods here
  };
  
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
};
```

---

## 🧪 Testing

### Unit Tests

```javascript
// src/utils/__tests__/helpers.test.js
import { fmt, calculateEMI, getUserTier } from '../helpers';

describe('helpers', () => {
  describe('fmt', () => {
    it('should format number with rupee symbol', () => {
      expect(fmt(1000)).toBe('₹1,000');
      expect(fmt(1000000)).toBe('₹10,00,000');
    });
  });
  
  describe('calculateEMI', () => {
    it('should calculate correct EMI', () => {
      // P = 100000, R = 10%, T = 12 months
      const emi = calculateEMI(100000, 10, 12);
      expect(emi).toBeCloseTo(8763, 0);
    });
  });
  
  describe('getUserTier', () => {
    it('should return correct tier based on transactions', () => {
      expect(getUserTier(0)).toBe('Bronze');
      expect(getUserTier(100)).toBe('Silver');
      expect(getUserTier(300)).toBe('Gold');
      expect(getUserTier(600)).toBe('Platinum');
    });
  });
});
```

### Component Tests

```javascript
// src/components/__tests__/ToastContainer.test.jsx
import { render, screen } from '@testing-library/react';
import ToastContainer from '../common/ToastContainer';
import { AppProvider } from '../../store/AppContext';

describe('ToastContainer', () => {
  it('should render toasts from context', () => {
    render(
      <AppProvider>
        <ToastContainer />
      </AppProvider>
    );
    
    // Add assertions based on context toasts
  });
});
```

### Running Tests

```bash
# Run all tests (if jest is configured)
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## 🔍 Debugging

### Using React DevTools

1. Install [React DevTools Browser Extension](https://react-devtools-tutorial.vercel.app/)
2. Open DevTools (F12)
3. Go to Components tab
4. Inspect component state and props
5. Trace component renders

### Using Browser DevTools

```javascript
// Log to console
console.log('Value:', value);
console.table(arrayData);
console.warn('Warning message');
console.error('Error message');

// Conditional breakpoint
debugger;  // Add breakpoint in code

// Network tab: Check API calls
// Storage tab: Check localStorage
// Performance tab: Check render performance
```

### Common Debugging Scenarios

**Problem: State not updating**
```javascript
// ❌ Wrong: Direct mutation
user.balance = 5000;

// ✅ Correct: Create new object
updateUser({ ...currentUser, balance: 5000 });
```

**Problem: Infinite re-render**
```javascript
// ❌ Wrong: Missing dependencies
useEffect(() => {
  handleAction();
}, []); // 'handleAction' is missing!

// ✅ Correct: Include all dependencies
useEffect(() => {
  handleAction();
}, [handleAction]);
```

**Problem: Memory leak**
```javascript
// ✅ Correct: Cleanup on unmount
useEffect(() => {
  const interval = setInterval(() => {
    // Logic
  }, 1000);
  
  return () => clearInterval(interval);  // Cleanup
}, []);
```

---

## 📦 Adding Dependencies

### Before Adding

1. Check if Tailwind can solve it (styling)
2. Check if vanilla JS can solve it (no library needed)
3. Check if existing dependency provides it
4. Ensure it's well-maintained (GitHub stars, recent updates)
5. Check bundle size impact: `npm install --save-dev esbuild-bundle-analyzer`

### Adding New Dependency

```bash
# Install and save to package.json
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Update existing
npm update package-name

# Remove dependency
npm uninstall package-name
```

### Popular Additions (Optional)

```bash
# For charts/graphs
npm install recharts

# For forms with validation
npm install react-hook-form

# For API calls (if moving to backend)
npm install axios

# For date handling
npm install date-fns

# For clipboard copy
npm install react-hot-toast
```

---

## 🚀 Performance Tips

### Code Splitting

```javascript
// Lazy load heavy pages
const HeavyPage = lazy(() => import('./pages/HeavyPage'));

// Use Suspense for loading fallback
<Suspense fallback={<LoadingSpinner />}>
  <HeavyPage />
</Suspense>
```

### Memoization

```javascript
import { memo, useMemo, useCallback } from 'react';

// Prevent re-render if props don't change
const Card = memo(({ title, value }) => {
  return <div>{title}: {value}</div>;
});

// Memoize expensive computation
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);

// Memoize callback function
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### Bundle Size

```bash
# Analyze bundle
npm run build

# Check what's included
npm install --save-dev webpack-bundle-analyzer

# Tree-shake unused code by ensuring exports are used
# Remove console logs in production build
```

---

## 📋 Pre-commit Checklist

Before committing code:

- [ ] Code follows project standards
- [ ] No console.log or debugger statements
- [ ] No hardcoded API keys or secrets
- [ ] Tests pass (if applicable)
- [ ] Build succeeds: npm run build
- [ ] No TypeErrors or warnings
- [ ] Commit message is clear and follows convention
- [ ] Commit is logically grouped (not too many unrelated changes)

---

## 🐛 Reporting Bugs

When reporting issues, include:

```markdown
**Description**
Brief description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- OS: Windows 11
- Browser: Chrome 120
- Node version: 18.x
```

---

## 📚 Resources & References

### Documentation
- [React Documentation](https://react.dev)
- [React Router v6](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)

### Tools
- [VS Code](https://code.visualstudio.com) (Recommended Editor)
- [React DevTools Extension](https://chrome.google.com/webstore)
- [ESLint VSCode Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier VSCode Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Learning
- [React Hooks Deep Dive](https://youtube.com/results?search_query=react+hooks+tutorial)
- [Tailwind CSS Complete Course](https://tailwindcss.com/docs)
- [Web Performance Optimization](https://web.dev/performance/)

---

## 🤝 Getting Help

- **Questions:** Open a GitHub Discussion
- **Bugs:** Submit a GitHub Issue
- **Security:** Email security@alphabank.in
- **Suggestions:** Start a Discussion for features

---

**Version 2.0.0 — Last Updated: May 2026**

*Happy coding! 🚀*
