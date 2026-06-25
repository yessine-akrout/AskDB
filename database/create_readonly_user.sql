
USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = 'text2sql_ro')
BEGIN
    CREATE LOGIN text2sql_ro WITH PASSWORD = 'AdelAk1$';
END
GO

USE Text2SQL_Test;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'text2sql_ro')
BEGIN
    CREATE USER text2sql_ro FOR LOGIN text2sql_ro;
END
GO

ALTER ROLE db_datareader ADD MEMBER text2sql_ro;
GO