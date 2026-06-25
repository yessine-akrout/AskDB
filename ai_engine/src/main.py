from src.pipeline.pipeline import run_text_to_sql
import json
def main():
    question = "le nombre de banque "
    result = run_text_to_sql(question)
    print(json.dumps(result, indent=2,ensure_ascii=False))
if __name__ == "__main__":
    main()