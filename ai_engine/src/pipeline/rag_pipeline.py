from src.prompt.rag_prompt_builder import build_prompt
from src.sql.executor import run_select
from src.sql.validator import validate_select_query
from src.LLM import client
from src.pipeline.normalizer import normalize_question
import time



from src.security.rbac import (
    validate_user_question_access,
    validate_sql_table_access,
)

print("PIPELINE FILE LOADED")


def run_text_to_sql(question: str, user_role: str = "stagiaire"):
    print("RUN_TEXT_TO_SQL CALLED")
    print("USER ROLE:", user_role)

    total_start = time.perf_counter()

    normalize_time = 0
    prompt_time = 0
    llm_time = 0
    extraction_time = 0
    validation_time = 0
    sql_execution_time = 0
    rbac_time = 0

    final_sql = None

    try:
        normalize_start = time.perf_counter()
        normalized_question = normalize_question(question)
        normalize_time = time.perf_counter() - normalize_start

        print(normalized_question)

        # =========================
        # RBAC CHECK 1
        # Check the user question before sending it to the LLM
        # =========================
        rbac_start = time.perf_counter()

        if not validate_user_question_access(normalized_question, user_role):
            rbac_time = time.perf_counter() - rbac_start
            total_time = time.perf_counter() - total_start

            print("RBAC: ACCESS DENIED FROM QUESTION")

            print(f"Normalize time: {normalize_time:.4f}s")
            print(f"RBAC time: {rbac_time:.4f}s")
            print(f"Prompt/Retrieval time: {prompt_time:.4f}s")
            print(f"LLM time: {llm_time:.4f}s")
            print(f"Extraction time: {extraction_time:.4f}s")
            print(f"Validation time: {validation_time:.4f}s")
            print(f"SQL execution time: {sql_execution_time:.4f}s")
            print(f"TOTAL time: {total_time:.4f}s")

            return {
                "question": question,
                "sql": "You do not have permission to access this data.",
                "result": None,
                "status": "access_denied",
                "message": "You do not have permission to access this data."
            }

        rbac_time = time.perf_counter() - rbac_start

        # =========================
        # PROMPT BUILDING
        # IMPORTANT:
        # build_prompt should use user_role to retrieve/filter allowed schema
        # =========================
        prompt_start = time.perf_counter()
        prompt = build_prompt(normalized_question)
        prompt_time = time.perf_counter() - prompt_start

        print(prompt)

        llm_start = time.perf_counter()
        llm_response = client.llm(prompt)
        llm_time = time.perf_counter() - llm_start

        print("sql_raw:", llm_response)

        extraction_start = time.perf_counter()
        final_sql = client.extract_and_clean_sql(llm_response)
        extraction_time = time.perf_counter() - extraction_start

        print("sql_clean:", final_sql)

        if final_sql == "INVALID_QUERY" or final_sql == "EXACTEMENT INVALID_QUERY" :
            total_time = time.perf_counter() - total_start

            print(f"Normalize time: {normalize_time:.4f}s")
            print(f"RBAC time: {rbac_time:.4f}s")
            print(f"Prompt/Retrieval time: {prompt_time:.4f}s")
            print(f"LLM time: {llm_time:.4f}s")
            print(f"Extraction time: {extraction_time:.4f}s")
            print(f"Validation time: {validation_time:.4f}s")
            print(f"SQL execution time: {sql_execution_time:.4f}s")
            print(f"TOTAL time: {total_time:.4f}s")

            return {
                "question": question,
                "sql": "INVALID_QUERY",
                "result": None,
                "status": "invalid"
            }

        validation_start = time.perf_counter()

        # Existing SQL security check
        validate_select_query(final_sql)

        # =========================
        # RBAC CHECK 2
        # Check generated SQL before execution
        # =========================
        if not validate_sql_table_access(final_sql, user_role):
            validation_time = time.perf_counter() - validation_start
            total_time = time.perf_counter() - total_start

            print("RBAC: ACCESS DENIED FROM SQL TABLE VALIDATION")

            print(f"Normalize time: {normalize_time:.4f}s")
            print(f"RBAC time: {rbac_time:.4f}s")
            print(f"Prompt/Retrieval time: {prompt_time:.4f}s")
            print(f"LLM time: {llm_time:.4f}s")
            print(f"Extraction time: {extraction_time:.4f}s")
            print(f"Validation time: {validation_time:.4f}s")
            print(f"SQL execution time: {sql_execution_time:.4f}s")
            print(f"TOTAL time: {total_time:.4f}s")

            return {
                "question": question,
                "sql": "Votre rôle ne permet pas d'accéder aux tables utilisées dans cette requête.",
                "result": None,
                "status": "access_denied",
                "message": "Votre rôle ne permet pas d'accéder aux tables utilisées dans cette requête."
            }

        validation_time = time.perf_counter() - validation_start

        sql_execution_start = time.perf_counter()
        result = run_select(final_sql)
        sql_execution_time = time.perf_counter() - sql_execution_start

        total_time = time.perf_counter() - total_start

        print(f"Normalize time: {normalize_time:.4f}s")
        print(f"RBAC time: {rbac_time:.4f}s")
        print(f"Prompt/Retrieval time: {prompt_time:.4f}s")
        print(f"LLM time: {llm_time:.4f}s")
        print(f"Extraction time: {extraction_time:.4f}s")
        print(f"Validation time: {validation_time:.4f}s")
        print(f"SQL execution time: {sql_execution_time:.4f}s")
        print(f"TOTAL time: {total_time:.4f}s")

        return {
            "question": question,
            "sql": final_sql,
            "result": result,
            "status": "success"
        }

    except Exception as e:
        total_time = time.perf_counter() - total_start

        print(f"Normalize time: {normalize_time:.4f}s")
        print(f"RBAC time: {rbac_time:.4f}s")
        print(f"Prompt/Retrieval time: {prompt_time:.4f}s")
        print(f"LLM time: {llm_time:.4f}s")
        print(f"Extraction time: {extraction_time:.4f}s")
        print(f"Validation time: {validation_time:.4f}s")
        print(f"SQL execution time: {sql_execution_time:.4f}s")
        print(f"TOTAL time: {total_time:.4f}s")

        return {
            "question": question,
            "sql": final_sql,
            "result": None,
            "status": "error",
            "message": str(e)
        }
    

