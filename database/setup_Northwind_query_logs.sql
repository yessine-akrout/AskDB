/* ============================================================
   setup_Northwind_query_logs.sql
   
   Adds the query_logs table to your NORTHWIND_DB database.
   
   The AI engine connects to NORTHWIND_DB to execute generated SQL queries,
   and it also uses this table to store logs of every question asked.
   
   Prerequisites:
     - You have already restored the Northwind database and named it NORTHWIND_DB.
   
   Usage:
     Run this script in SSMS or via sqlcmd:
       sqlcmd -S YOUR_SERVER\SQLEXPRESS -E -i setup_Northwind_query_logs.sql
   ============================================================ */

USE NORTHWIND_DB;
GO

-- ============================================================
-- query_logs table
--    Written by the AI engine (ai_engine/src/sql/query_logs_repository.py)
--    Stores every natural-language question, the generated SQL,
--    execution status, and query results.
-- ============================================================
IF OBJECT_ID('dbo.query_logs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.query_logs (
        id              UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        user_email      NVARCHAR(255)    NULL,
        question        NVARCHAR(MAX)    NOT NULL,
        generated_sql   NVARCHAR(MAX)    NULL,
        status          NVARCHAR(50)     NOT NULL,
        error_message   NVARCHAR(MAX)    NULL,
        row_count       INT              NULL,
        result_json     NVARCHAR(MAX)    NULL,
        created_at      DATETIME2        NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Table query_logs created in NORTHWIND_DB.';

    CREATE INDEX IX_query_logs_created_at ON dbo.query_logs(created_at);
    CREATE INDEX IX_query_logs_user_email ON dbo.query_logs(user_email);
END
ELSE
BEGIN
    PRINT 'Table query_logs already exists in NORTHWIND_DB. Skipping.';
END
GO
