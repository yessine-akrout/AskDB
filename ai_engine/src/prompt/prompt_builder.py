from src.RAG.full_schema_solution.schema_formatter import formatter_sche
from src.RAG.semantic_formatter import formatter_kb

def build_prompt(user_question):
    schema = formatter_sche()
    semantic_kb = formatter_kb(user_question,2)

    prompt = f"""You are an expert in SQL query generation for Microsoft SQL Server (T-SQL).

Your task is to translate a natural language question into ONE valid SQL query.

======================
STRICT RULES
======================

- Generate only a SELECT SQL query
- NEVER use: INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, EXEC, MERGE, CREATE, GRANT, REVOKE, DECLARE, SET
- Do NOT use a semicolon (;)
- Do NOT use comments (--, /* */)
- Do NOT add any explanatory text
- Do NOT use markdown or backticks
- Do NOT invent tables or columns
- Use ONLY the provided schema
- If impossible: return EXACTLY INVALID_QUERY

======================
SQL SERVER RULES
======================

- The dialect is Microsoft SQL Server (T-SQL)
- NEVER use LIMIT
- To limit rows, use TOP immediately after SELECT
- Correct example: SELECT TOP 1 full_name FROM Students
- Incorrect example: SELECT full_name FROM Students LIMIT 1
- Do not use ILIKE, RETURNING, AUTO_INCREMENT, SERIAL

======================
QUERY CONSTRUCTION RULES
======================

- Use JOIN only when necessary
- If a column does not exist in the table being used, use an appropriate join
- Use multiple tables in FROM only when the relationship is justified

- For a question involving several independent tables, return a single SELECT with scalar subqueries
- Correct example:
SELECT
    (SELECT COUNT(*) FROM Students) AS number_of_students,
    (SELECT COUNT(*) FROM Instructors) AS number_of_instructors
- Incorrect example:
    SELECT COUNT(student_id), COUNT(instructor_id) FROM Students, Instructors


- For aggregations by entity, for example department, use the correct table according to the schema

Example:
SELECT TOP 1 c.course_id, c.course_name, AVG(e.grade) AS avg_grade
FROM Courses c
JOIN Enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_name
ORDER BY AVG(e.grade) DESC

- If the question asks for "which ... having the maximum", return all ties, not only TOP 1.
Example:
SELECT TOP 1 WITH TIES ...
======================
SCHEMA
======================

{schema}

======================
BUSINESS KNOWLEDGE
======================

{semantic_kb}

======================
QUESTION
======================

{user_question}

======================
OUTPUT
======================

Return ONLY the SQL query or EXACTLY INVALID_QUERY"""


    return prompt