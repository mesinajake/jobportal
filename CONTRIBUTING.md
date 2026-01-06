# Contributing to JobPortal

First off, thank you for considering contributing to JobPortal! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)

---

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)

### 💡 Suggesting Features

Feature suggestions are welcome! Please include:

- **Clear description** of the feature
- **Use case** - why is this needed?
- **Possible implementation** approach

### 🔧 Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Write/update tests
5. Submit a pull request

---

## Development Setup

### Prerequisites

- Node.js v16+
- npm v8+
- MongoDB Atlas account
- Git

### Setup Steps

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/jobportal.git
cd jobportal

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Edit .env files with your credentials

# 5. Run development servers
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## Pull Request Process

1. **Update documentation** for any changed functionality
2. **Add tests** for new features
3. **Ensure all tests pass** before submitting
4. **Update README.md** if adding new environment variables
5. **Request review** from maintainers

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests added/updated

---

## Style Guidelines

### JavaScript/React

- Use ES6+ features
- Use functional components with hooks
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for functions

### File Organization

- One component per file
- Group related files in folders
- Use index.js for exports

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `JobCard.jsx` |
| Functions | camelCase | `fetchJobs()` |
| Constants | UPPER_SNAKE | `API_URL` |
| Files | kebab-case | `job-service.js` |

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |

### Examples

```bash
feat(auth): add two-factor authentication
fix(jobs): resolve search filter bug
docs(readme): update installation steps
refactor(api): restructure job controller
test(auth): add login validation tests
```

---

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

Thank you for contributing! 🙌
