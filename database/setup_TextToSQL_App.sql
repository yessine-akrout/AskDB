/* ============================================================
   setup_TextToSQL_App.sql
   
   Creates the TextToSQL_App database used by the Backend service.
   
   Tables:
     - users        : registered users (email, hashed password, role)
     - admin_logs   : audit log for admin actions (login, register, delete)
   
   The AI engine also writes to this DB:
     - query_logs   : every SQL query generated + execution result
   
   Prerequisites:
     - SQL Server (Express or full) running on your machine
     - Windows Trusted Authentication enabled
   
   Usage:
     Run this script in SSMS or via sqlcmd:
       sqlcmd -S YOUR_SERVER\SQLEXPRESS -E -i setup_TextToSQL_App.sql
   ============================================================ */

-- ============================================================
-- 1. Create the database (skip if already exists)
-- ============================================================
IF DB_ID('TextToSQL_App') IS NULL
BEGIN
    CREATE DATABASE TextToSQL_App;
    PRINT 'Database TextToSQL_App created.';
END
ELSE
BEGIN
    PRINT 'Database TextToSQL_App already exists. Skipping creation.';
END
GO

USE TextToSQL_App;
GO

-- ============================================================
-- 2. users table
--    Stores registered users with hashed passwords and roles.
--    Roles: 'admin', 'directeur', 'stagiaire'
-- ============================================================
IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.users (
        id            UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        email         NVARCHAR(255)    NOT NULL UNIQUE,
        password_hash NVARCHAR(512)    NOT NULL,
        role          NVARCHAR(50)     NOT NULL DEFAULT 'stagiaire',
        first_name    NVARCHAR(100)    NULL,
        last_name     NVARCHAR(100)    NULL,
        avatar_url    NVARCHAR(512)    NULL,
        created_at    DATETIME2        NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Table users created.';
END
ELSE
BEGIN
    PRINT 'Table users already exists. Skipping.';
END
GO

-- ============================================================
-- 3. admin_logs table
--    Stores audit logs for admin actions (login, register, etc.)
-- ============================================================
IF OBJECT_ID('dbo.admin_logs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.admin_logs (
        id          UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        user_email  NVARCHAR(255)    NULL,
        action      NVARCHAR(100)    NOT NULL,
        status      NVARCHAR(50)     NOT NULL,
        details     NVARCHAR(MAX)    NULL,
        created_at  DATETIME2        NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Table admin_logs created.';
END
ELSE
BEGIN
    PRINT 'Table admin_logs already exists. Skipping.';
END
GO

-- ============================================================
-- 4. query_logs table
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
        -- Possible status values:
        --   'success'          : SQL generated and executed successfully
        --   'invalid'          : LLM returned INVALID_QUERY
        --   'validation_failed': dangerous keywords blocked before execution
        --   'access_denied'    : RBAC check rejected the question or SQL tables
        --   'execution_failed' : SQL ran but threw an exception
        error_message   NVARCHAR(MAX)    NULL,
        row_count       INT              NULL,
        result_json     NVARCHAR(MAX)    NULL,
        created_at      DATETIME2        NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Table query_logs created.';
END
ELSE
BEGIN
    PRINT 'Table query_logs already exists. Skipping.';
END
GO

-- ============================================================
-- 5. Indexes for performance
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_email')
    CREATE INDEX IX_users_email ON dbo.users(email);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_admin_logs_created_at')
    CREATE INDEX IX_admin_logs_created_at ON dbo.admin_logs(created_at);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_query_logs_created_at')
    CREATE INDEX IX_query_logs_created_at ON dbo.query_logs(created_at);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_query_logs_user_email')
    CREATE INDEX IX_query_logs_user_email ON dbo.query_logs(user_email);
GO

-- ============================================================
-- 6. Create a default admin user (optional - remove if not needed)
--    Password: Admin@123  (bcrypt hashed)
--    Change the password immediately after first login!
-- ============================================================
-- Uncomment the block below to seed a default admin account:
/*
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'admin@askdb.local')
BEGIN
    INSERT INTO dbo.users (email, password_hash, role, first_name, last_name)
    VALUES (
        'admin@askdb.local',
        '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',  -- Admin@123
        'admin',
        'Admin',
        'User'
    );
    PRINT 'Default admin user created: admin@askdb.local / Admin@123';
END
*/

PRINT '=== TextToSQL_App setup complete ===';
GO
