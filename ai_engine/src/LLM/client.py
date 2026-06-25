import requests

class PipelineError(Exception):
    pass

def llm(prompt: str):
    try:
        response = requests.post(
            "http://localhost:1234/api/v1/chat",
            headers={
                "Content-Type": "application/json"
            },
            json={
                "model": "qwen2.5-coder-7b-instruct",
                "input": prompt
            }
        )
        response.raise_for_status()
        data = response.json()
        return data

    except requests.RequestException as e:
        raise PipelineError(f"Error while calling LM Studio API: {e}") from e
    except ValueError as e:
        raise PipelineError("Invalid JSON response from LM Studio.") from e


def extract_and_clean_sql(response_json):
    try:
        sql = response_json["output"][0]["content"]
    except (KeyError, IndexError, TypeError) as e:
        raise PipelineError(
            f"Unexpected LM Studio response format: {response_json}"
        ) from e

    if sql is None or sql == "":
        raise PipelineError("La requête générée est vide.")
        

    sql = sql.strip()

    if sql == "":
        raise PipelineError("La requête générée est vide après nettoyage.")
    
    if not sql.startswith("SELECT") and not sql.startswith("INVALID_QUERY"):
        sql=sql[sql.find("SELECT"):]
        sql=sql[:sql.find("```")]
        sql = sql.strip()

    if len(sql) > 0 and  sql[-1] == ";":
        sql = sql[:-1]

    return sql
