# Northwind Database Setup

The AI engine queries the **Northwind** sample database — a classic Microsoft sample database
representing a small trading company (orders, products, customers, employees, etc.).

## Option 1: Download official Microsoft Northwind (Recommended)

Microsoft provides the Northwind scripts for SQL Server:

1. Download from the official GitHub:
   ```
   https://github.com/microsoft/sql-server-samples/tree/master/samples/databases/northwind-pubs
   ```

2. Download `instnwnd.sql` (the script that creates tables + inserts all data)

3. Open **SQL Server Management Studio (SSMS)**

4. Run the script — it will create a `Northwind` database automatically

5. After running, **rename the database** to `NORTHWIND_DB` to match the `.env` config:
   ```sql
   ALTER DATABASE Northwind MODIFY NAME = NORTHWIND_DB;
   GO
   ```
   
   Or alternatively, update your `.env` file in `ai_engine/`:
   ```
   DB_DATABASE=Northwind
   ```

## Option 2: Use sqlcmd

```bash
# Download the script first, then:
sqlcmd -S YOUR_SERVER\SQLEXPRESS -E -i instnwnd.sql

# Rename:
sqlcmd -S YOUR_SERVER\SQLEXPRESS -E -Q "ALTER DATABASE Northwind MODIFY NAME = NORTHWIND_DB"
```

## Verify the Setup

After setup, confirm the tables exist:
```sql
USE NORTHWIND_DB;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
```

You should see tables like:
- `Customers`
- `Orders`
- `Order Details`
- `Products`
- `Categories`
- `Employees`
- `Suppliers`
- `Shippers`

## ChromaDB Vector Store

The `ai_engine/vector_store/chroma_schema_db/` folder is already pre-built and committed.
It contains the **Northwind schema embeddings** used for schema retrieval (RAG).

You do **not** need to rebuild it unless you modify the database schema.

To rebuild it (if needed), run from `ai_engine/`:
```bash
python embeddings.py
```
or
```bash
python src/RAG/chroma_solution/build_chroma_db.py
```
