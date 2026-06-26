from src.RAG.semantic_formatter import formatter_kb
from src.RAG.chroma_solution.chroma_retreiever_northwind import retrieve_schema_context



def build_prompt(user_question):
    
    schema = retrieve_schema_context(user_question)
    semantic_kb = formatter_kb(user_question,3)

    prompt = f"""You are an expert in SQL query generation for Microsoft SQL Server (T-SQL).

Your task is to convert a natural language question into ONE valid SQL SELECT query.

======================
ABSOLUTE RULES (CRITICAL)
======================

- Output ONLY SQL
- No explanation, no markdown, no comments, no semicolon
- Only SELECT queries are allowed
- If the query cannot be generated, return EXACTLY: INVALID_QUERY

======================
SQL SERVER RULES
======================

- Use Microsoft SQL Server syntax ONLY
- NEVER use backticks (`)
- If a table has spaces, ALWAYS use square brackets

CRITICAL TABLE NAME:
- The table "Order Details" MUST ALWAYS be written exactly as: [Order Details]
- NEVER write: `Order Details`
- NEVER write: Order Details without brackets

======================
TOP RULE (VERY IMPORTANT)
======================

- Use TOP only if the user explicitly asks for:
  "top", "highest", "best", "maximum", "first", or a limit

- TOP must be placed IMMEDIATELY after SELECT

Correct:
SELECT TOP 5 column FROM table

Wrong:
SELECT column FROM table TOP 5
SELECT column FROM table ORDER BY column DESC TOP 5

- Do NOT use TOP for:
  "per", "by", "grouped", "ordered from highest to lowest"

======================
QUERY RULES
======================

- Use ONLY tables and columns from the schema
- NEVER invent columns
- Use JOIN only when necessary

SALES FORMULA:
SUM(od.UnitPrice * od.Quantity * (1 - od.Discount))

======================
MULTI-TABLE JOIN RULE (CRITICAL)
======================

- NEVER assume a column belongs to a table
- ALWAYS follow schema relationships

- ProductName belongs to Products
- CategoryName belongs to Categories

- To filter by product category:
  MUST join:

  Customers → Orders → [Order Details] → Products → Categories

Correct joins:
JOIN [Order Details] od ON o.OrderID = od.OrderID
JOIN Products p ON od.ProductID = p.ProductID
JOIN Categories cat ON p.CategoryID = cat.CategoryID

- NEVER use:
  ProductName LIKE '%category%'
- ALWAYS use:
  Categories.CategoryName

======================
EXAMPLES (STRICTLY FOLLOW)
======================

Example 1:
Question: total sales per customer

SELECT
    c.CustomerID,
    c.CompanyName,
    SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) AS TotalSales
FROM Customers c
JOIN Orders o ON c.CustomerID = o.CustomerID
JOIN [Order Details] od ON o.OrderID = od.OrderID
GROUP BY c.CustomerID, c.CompanyName
ORDER BY TotalSales DESC

Example 2:
Question: top 5 customers by revenue

SELECT TOP 5
    c.CustomerID,
    c.CompanyName,
    SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) AS TotalSales
FROM Customers c
JOIN Orders o ON c.CustomerID = o.CustomerID
JOIN [Order Details] od ON o.OrderID = od.OrderID
GROUP BY c.CustomerID, c.CompanyName
ORDER BY TotalSales DESC

Example 3:
Question: customers who ordered Beverages

SELECT DISTINCT
    c.CustomerID,
    c.CompanyName
FROM Customers c
JOIN Orders o ON c.CustomerID = o.CustomerID
JOIN [Order Details] od ON o.OrderID = od.OrderID
JOIN Products p ON od.ProductID = p.ProductID
JOIN Categories cat ON p.CategoryID = cat.CategoryID
WHERE cat.CategoryName = 'Beverages'

======================
SCHEMA
======================

{schema}

======================
RELEVANT BUSINESS KNOWLEDGE
======================

{semantic_kb}

======================
QUESTION
======================

{user_question}

======================
OUTPUT
======================

SQL:
"""

    return prompt