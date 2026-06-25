import sys
import csv
import io
import re
import time
import json
import argparse
from pathlib import Path
from contextlib import redirect_stdout

# ============================================================
# Make project root importable
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

# ============================================================
# Import your REAL AskDB pipeline
# Change this import if your pipeline file name is different
# ============================================================

from src.pipeline.pipeline import run_text_to_sql

# ============================================================
# Output paths
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CSV_OUTPUT_PATH = OUTPUT_DIR / "manual_evaluation_results.csv"
JSON_OUTPUT_PATH = OUTPUT_DIR / "manual_evaluation_results.json"


# ============================================================
# Manual test cases
# Put your real queries here
# ============================================================

TEST_CASES = [
    # ========================================================
    # Small generated database
    # ========================================================
    # ========================================================
    # Small generated database
    # ========================================================
    # ========================================================
    # Small generated database
    # ========================================================
{
    "database": "Small Generated DB",
    "database_size": "4 main tables",
    "query_id": "SDB-Q1",
    "difficulty": "Easy",
    "question": "Show all students",
    "expected_tables": "Students",
    "expected_behavior": "Return all students"
},
{
    "database": "Small Generated DB",
    "database_size": "4 main tables",
    "query_id": "SDB-Q2",
    "difficulty": "Medium",
    "question": "Show enrollments with student names and course names",
    "expected_tables": "Students, Enrollments, Courses",
    "expected_behavior": "Join students, enrollments, and courses"
},
{
    "database": "Small Generated DB",
    "database_size": "4 main tables",
    "query_id": "SDB-Q3",
    "difficulty": "Medium",
    "question": "Count the number of enrollments per student",
    "expected_tables": "Students, Enrollments",
    "expected_behavior": "Group enrollments by student"
},
{
    "database": "Small Generated DB",
    "database_size": "4 main tables",
    "query_id": "SDB-Q4",
    "difficulty": "Hard",
    "question": "Show the top 5 courses with the highest average grades",
    "expected_tables": "Courses, Enrollments",
    "expected_behavior": "Aggregate average grade by course and rank the top 5 courses"
},
{
    "database": "Small Generated DB",
    "database_size": "4 main tables",
    "query_id": "SDB-Q5",
    "difficulty": "Security",
    "question": "Delete students with a low average grade",
    "expected_tables": "Students",
    "expected_behavior": "Reject because only SELECT queries are allowed"
},
    # ========================================================
    # Northwind database
    # ========================================================
    {
        "database": "Northwind",
        "database_size": "around 12 tables",
        "query_id": "NW-Q1",
        "difficulty": "Easy",
        "question": "Show all customers",
        "expected_tables": "Customers",
        "expected_behavior": "Return all customers"
    },
    {
        "database": "Northwind",
        "database_size": "around 12 tables",
        "query_id": "NW-Q2",
        "difficulty": "Medium",
        "question": "Show orders with customer names",
        "expected_tables": "Orders, Customers",
        "expected_behavior": "Join orders with customers"
    },
    {
        "database": "Northwind",
        "database_size": "around 12 tables",
        "query_id": "NW-Q3",
        "difficulty": "Medium",
        "question": "Show the total number of orders per customer",
        "expected_tables": "Orders, Customers",
        "expected_behavior": "Group orders by customer"
    },
    {
        "database": "Northwind",
        "database_size": "around 12 tables",
        "query_id": "NW-Q4",
        "difficulty": "Hard",
        "question": "Show the top 5 products by total sales amount",
        "expected_tables": "Order Details, Products, Orders",
        "expected_behavior": "Aggregate product sales"
    },
    {
        "database": "Northwind",
        "database_size": "around 12 tables",
        "query_id": "NW-Q5",
        "difficulty": "Security",
        "question": "Drop the orders table",
        "expected_tables": "Orders",
        "expected_behavior": "Reject because only SELECT is allowed"
    },

    # ========================================================
    # UNILOG database
    # ========================================================
    {
        "database": "UNILOG",
        "database_size": "580+ tables",
        "query_id": "UNI-Q1",
        "difficulty": "Easy",
        "question": "Afficher la liste des clients",
        "expected_tables": "Clients, Tiers",
        "expected_behavior": "Return client list"
    },
    {
        "database": "UNILOG",
        "database_size": "580+ tables",
        "query_id": "UNI-Q2",
        "difficulty": "Medium",
        "question": "Afficher le chiffre d'affaires total",
        "expected_tables": "Document",
        "expected_behavior": "Use total amount column such as Doc_THT or Doc_TTTC"
    },
    {
        "database": "UNILOG",
        "database_size": "580+ tables",
        "query_id": "UNI-Q3",
        "difficulty": "Medium",
        "question": "Afficher les 10 meilleurs clients par chiffre d'affaires",
        "expected_tables": "Document, Clients",
        "expected_behavior": "Group revenue by client and rank"
    },
    {
        "database": "UNILOG",
        "database_size": "580+ tables",
        "query_id": "UNI-Q4",
        "difficulty": "Hard",
        "question": "Afficher les articles les plus vendus",
        "expected_tables": "DocumentD, Art, Document",
        "expected_behavior": "Use detail lines and article table"
    },
    {
        "database": "UNILOG",
        "database_size": "580+ tables",
        "query_id": "UNI-Q5",
        "difficulty": "Security",
        "question": "Supprimer les clients inactifs",
        "expected_tables": "Clients",
        "expected_behavior": "Reject because only SELECT is allowed"
    },
]


# ============================================================
# Timing extraction from your pipeline print logs
# ============================================================

TIMING_PATTERNS = {
    "normalize_time": r"Normalize time:\s*([0-9.]+)s",
    "rbac_time": r"RBAC time:\s*([0-9.]+)s",
    "prompt_retrieval_time": r"Prompt/Retrieval time:\s*([0-9.]+)s",
    "llm_time": r"LLM time:\s*([0-9.]+)s",
    "extraction_time": r"Extraction time:\s*([0-9.]+)s",
    "validation_time": r"Validation time:\s*([0-9.]+)s",
    "sql_execution_time": r"SQL execution time:\s*([0-9.]+)s",
    "total_time_printed": r"TOTAL time:\s*([0-9.]+)s",
}


def extract_timings_from_logs(log_text: str) -> dict:
    timings = {}

    for key, pattern in TIMING_PATTERNS.items():
        match = re.search(pattern, log_text)
        if match:
            timings[key] = float(match.group(1))
        else:
            timings[key] = None

    return timings


def extract_generated_sql(result: dict) -> str:
    if not isinstance(result, dict):
        return ""

    sql = result.get("sql")

    if sql is None:
        return ""

    return str(sql).replace("\n", " ").strip()


def get_result_preview(result: dict, max_chars: int = 300) -> str:
    if not isinstance(result, dict):
        return ""

    data = result.get("result")

    if data is None:
        return ""

    text = str(data).replace("\n", " ").strip()

    if len(text) > max_chars:
        return text[:max_chars] + "..."

    return text


def infer_basic_result_score(status: str, sql: str) -> int:
    """
    Automatic helper score:
    2 = success
    1 = invalid/access_denied, because this may be correct for security queries
    0 = error

    You can manually adjust this later in Excel after checking correctness.
    """
    status = (status or "").lower()
    sql_upper = (sql or "").upper()

    if status == "success":
        return 2

    if status in {"invalid", "access_denied"}:
        return 1

    if "INVALID_QUERY" in sql_upper:
        return 1

    return 0


# ============================================================
# Run one test case
# ============================================================

def run_single_test(test_case: dict, solution_name: str, user_role: str) -> dict:
    question = test_case["question"]

    captured_output = io.StringIO()

    wall_start = time.perf_counter()

    with redirect_stdout(captured_output):
        try:
            # Works for rag_pipeline.py version
            result = run_text_to_sql(question=question, user_role=user_role)
        except TypeError:
            # Works for pipeline.py full-schema version
            result = run_text_to_sql(question)
            
    wall_total_time = time.perf_counter() - wall_start

    logs = captured_output.getvalue()
    timings = extract_timings_from_logs(logs)

    status = result.get("status") if isinstance(result, dict) else "error"
    sql = extract_generated_sql(result)
    result_preview = get_result_preview(result)
    message = result.get("message") if isinstance(result, dict) else ""

    auto_score = infer_basic_result_score(status, sql)

    row = {
        "solution": solution_name,
        "database": test_case["database"],
        "database_size": test_case["database_size"],
        "query_id": test_case["query_id"],
        "difficulty": test_case["difficulty"],
        "question": question,
        "expected_tables": test_case["expected_tables"],
        "expected_behavior": test_case["expected_behavior"],

        "status": status,
        "auto_score": auto_score,
        "manual_correctness": "",
        "manual_comment": "",

        "generated_sql": sql,
        "result_preview": result_preview,
        "message": message,

        "wall_total_time": round(wall_total_time, 4),
        "normalize_time": timings["normalize_time"],
        "rbac_time": timings["rbac_time"],
        "prompt_retrieval_time": timings["prompt_retrieval_time"],
        "llm_time": timings["llm_time"],
        "extraction_time": timings["extraction_time"],
        "validation_time": timings["validation_time"],
        "sql_execution_time": timings["sql_execution_time"],
        "total_time_printed": timings["total_time_printed"],

        "logs": logs,
    }

    return row


# ============================================================
# Main
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="Run AskDB manual evaluation tests.")
    parser.add_argument(
        "--solution",
        required=True,
        choices=["full_schema", "json_schema", "vector_db"],
        help="Name of the solution currently activated in your AskDB code."
    )
    parser.add_argument(
        "--database",
        required=False,
        choices=["Small Generated DB", "Northwind", "UNILOG", "all"],
        default="all",
        help="Run tests for one database or all databases."
    )
    parser.add_argument(
        "--role",
        default="admin",
        help="User role passed to the pipeline. Use admin to avoid RBAC blocking unless testing RBAC."
    )

    args = parser.parse_args()

    selected_tests = TEST_CASES

    if args.database != "all":
        selected_tests = [
            test for test in TEST_CASES
            if test["database"] == args.database
        ]

    print("=" * 100)
    print("ASKDB MANUAL EVALUATION RUNNER")
    print(f"Solution: {args.solution}")
    print(f"Database filter: {args.database}")
    print(f"User role: {args.role}")
    print(f"Number of test cases: {len(selected_tests)}")
    print("=" * 100)

    rows = []

    for index, test_case in enumerate(selected_tests, start=1):
        print("=" * 100)
        print(f"[{index}/{len(selected_tests)}] {test_case['database']} - {test_case['query_id']}")
        print(f"Question: {test_case['question']}")

        try:
            row = run_single_test(
                test_case=test_case,
                solution_name=args.solution,
                user_role=args.role,
            )
        except Exception as e:
            row = {
                "solution": args.solution,
                "database": test_case["database"],
                "database_size": test_case["database_size"],
                "query_id": test_case["query_id"],
                "difficulty": test_case["difficulty"],
                "question": test_case["question"],
                "expected_tables": test_case["expected_tables"],
                "expected_behavior": test_case["expected_behavior"],
                "status": "runner_error",
                "auto_score": 0,
                "manual_correctness": "",
                "manual_comment": "",
                "generated_sql": "",
                "result_preview": "",
                "message": str(e),
                "wall_total_time": None,
                "normalize_time": None,
                "rbac_time": None,
                "prompt_retrieval_time": None,
                "llm_time": None,
                "extraction_time": None,
                "validation_time": None,
                "sql_execution_time": None,
                "total_time_printed": None,
                "logs": "",
            }

        print(f"Status: {row['status']}")
        print(f"Auto score: {row['auto_score']}")
        print(f"Total time: {row['wall_total_time']}")
        print(f"SQL: {row['generated_sql']}")

        rows.append(row)

    fieldnames = [
        "solution",
        "database",
        "database_size",
        "query_id",
        "difficulty",
        "question",
        "expected_tables",
        "expected_behavior",
        "status",
        "auto_score",
        "manual_correctness",
        "manual_comment",
        "generated_sql",
        "result_preview",
        "message",
        "wall_total_time",
        "normalize_time",
        "rbac_time",
        "prompt_retrieval_time",
        "llm_time",
        "extraction_time",
        "validation_time",
        "sql_execution_time",
        "total_time_printed",
        "logs",
    ]

    file_exists = CSV_OUTPUT_PATH.exists()

    with open(CSV_OUTPUT_PATH, "a", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)

        if not file_exists:
            writer.writeheader()

        writer.writerows(rows)

    existing_json = []

    if JSON_OUTPUT_PATH.exists():
        try:
            with open(JSON_OUTPUT_PATH, "r", encoding="utf-8") as f:
                existing_json = json.load(f)
        except Exception:
            existing_json = []

    existing_json.extend(rows)

    with open(JSON_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(existing_json, f, indent=2, ensure_ascii=False)

    print("=" * 100)
    print("EVALUATION FINISHED")
    print(f"CSV saved to: {CSV_OUTPUT_PATH}")
    print(f"JSON saved to: {JSON_OUTPUT_PATH}")
    print("=" * 100)


if __name__ == "__main__":
    main()