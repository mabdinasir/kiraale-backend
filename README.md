# Kiraale

Kiraale is a modern real estate application that leverages TypeScript, Prisma, and Bun for a fast and scalable development experience.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Scripts](#scripts)
- [Development Workflow](#development-workflow)
- [Linting and Formatting](#linting-and-formatting)

---

## Features

- **TypeScript Support**: Strongly-typed codebase for safer and more maintainable development.
- **Bun Runtime**: Fast JavaScript runtime for efficient execution.
- **Prisma ORM**: Simplified database management with Prisma.
- **Code Quality**: Integrated ESLint and Prettier for linting and formatting.

---

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/mabdinasir/kiraale-be.git
    cd kiraale-be
    ```

2. Install dependencies:

    ```bash
    bun install
    ```

3. Set up the database:

    ```bash
    npx prisma db push
    ```

4. Generate the Prisma client:
    ```bash
    npx prisma generate
    ```

---

## Scripts

The following scripts are defined in the `package.json`:

- `build`: Compile the TypeScript code to JavaScript.
- `start`: Run the compiled code using Node.js.
- `dev`: Start the application in development mode with `nodemon`.
- `type-check`: Watch for TypeScript type errors without emitting output.
- `lint`: Check for code style and errors using ESLint.
- `lint:fix`: Automatically fix linting errors with ESLint.
- `fmt`: Format the codebase with Prettier.
- `fmt:check`: Check if the codebase adheres to Prettier formatting rules.

---

## Development Workflow

1. Start the development server:

    ```bash
    "bun run dev" or just "bun dev"
    ```

2. Make changes to the code in the `src` directory.

3. Automatically watch and restart the server using `nodemon`.

---

## Linting and Formatting

- Run the linter:

    ```bash
    bun run lint
    ```

- Fix linting errors automatically:

    ```bash
    bun run lint:fix
    ```

- Format the codebase:

    ```bash
    bun run fmt
    ```

- Check formatting:
    ```bash
    bun run fmt:check
    ```

---
