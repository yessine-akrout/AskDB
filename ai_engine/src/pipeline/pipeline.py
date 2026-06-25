from src.prompt.prompt_builder import build_prompt
from src.sql.executor import run_select
from src.sql.validator import validate_select_query
from src.LLM import client
from src.pipeline.normalizer import normalize_question

def run_text_to_sql(question: str):

    try:
        normalized_question = normalize_question(question)
        prompt = build_prompt(normalized_question)
        print(prompt)
        llm_response = client.llm(prompt)
        print("sql_raw:",llm_response)
        final_sql = client.extract_and_clean_sql(llm_response)
        print("sql_clean:",final_sql)

        if final_sql == "INVALID_QUERY":
                    return {
                "question": question,
                "sql": "INVALID_QUERY",
                "result": None,
                "status": "invalid"
            }

        validate_select_query(final_sql)
        result=run_select(final_sql)
        return{"question":question,
                           "sql":final_sql,
                           "result":result,
                           "status":"success" 

        }

    except Exception as e:
        return {
            "question": question,
            "sql": final_sql,
            "result": None,
            "status": "error",
            "message": str(e)
        }
