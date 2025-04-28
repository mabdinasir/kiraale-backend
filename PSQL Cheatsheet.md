**PostgreSQL Cheat Sheet**

---

### 🚀 Setup

**Install & Access**

1. Download PostgreSQL App (Mac: [postgresapp.com](https://postgresapp.com))
2. Add PostgreSQL binaries to your shell path (`.zprofile`, `.zshrc`, or `.bashrc`):
    ```sh
    export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
    ```
3. Confirm install:
    ```sh
    psql --help
    ```

---

### 🔍 Listing Info

**List all databases (as superuser):**

```sh
psql -U postgres -l
```

Or inside psql:

```sql
\l
```

**List all tables:**

```sql
\dt       -- all user tables
\d        -- all tables, views, sequences
```

**List all schemas:**

```sql
\dn
```

**List all roles/users:**

```sql
\du
```

**Current DB:**

```sql
SELECT current_database();
```

---

### 🚪 Connect to DB

**From terminal:**

```sh
psql -U your_user -d db_name
psql -h localhost -p 5432 -U your_user db_name
```

**From inside psql:**

```sql
\c db_name
```

---

### ✨ Create & Manage

**Create database:**

```sql
CREATE DATABASE your_db_name;
```

**Create table:**

```sql
CREATE TABLE table_name (
  column1 datatype CONSTRAINTS,
  column2 datatype,
  ...
);
```

**Insert data manually:**

```sql
INSERT INTO table_name (column1, column2) VALUES ('value1', 'value2');
```

**Insert from file:**

```sql
\i /path/to/your/file.sql
```

---

### ⚖️ Altering Tables

**Add NOT NULL constraint:**

```sql
ALTER TABLE users ALTER COLUMN mobile SET NOT NULL;
```

**Drop NOT NULL constraint:**

```sql
ALTER TABLE users ALTER COLUMN mobile DROP NOT NULL;
```

**Add boolean column with default:**

```sql
ALTER TABLE users ADD COLUMN "isDeleted" BOOLEAN DEFAULT FALSE;
```

**Set default value on a column:**

```sql
ALTER TABLE users ALTER COLUMN "userType" SET DEFAULT 'solo';
```

**Add unique constraint:**

```sql
ALTER TABLE users ADD UNIQUE (mobile);
```

**Drop specific constraint (name may vary):**

```sql
ALTER TABLE users DROP CONSTRAINT users_mobile_key;
```

---

### 📊 Inspecting Schema

**Check constraints on a table:**

```sql
\d+ table_name
```

**Describe table columns:**

```sql
\d table_name
```

---

### 📂 Useful Queries

**Show all databases (with owners):**

```sql
SELECT datname, pg_catalog.pg_get_userbyid(datdba) AS owner FROM pg_database;
```

**Show tables in current schema:**

```sql
SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';
```

---

### 🛠️ Useful Prisma Commands

**Initialize Prisma in your project:**

```sh
npx prisma init
```

**Generate Prisma Client:**

```sh
npx prisma generate
```

**Run Prisma Studio (GUI for your database):**

```sh
npx prisma studio
```

**Create a new migration:**

```sh
npx prisma migrate dev --name migration_name
```

**Apply pending migrations in production:**

```sh
npx prisma migrate deploy
```

**Reset the database (use with caution):**

```sh
npx prisma migrate reset
```

**Check database schema for issues:**

```sh
npx prisma validate
```

**Format Prisma schema file:**

```sh
npx prisma format
```

**Seed the database:**

```sh
npx prisma db seed
```

**Pull database schema into Prisma schema:**

```sh
npx prisma db pull
```

**Push Prisma schema to the database:**

```sh
npx prisma db push
```

---

### Local DB connection string

```sh
postgresql://postgres@localhost:5432/kiraale
```

---

### ⚠️ Misc / Admin

**Exit psql:**

```sql
\q
```
