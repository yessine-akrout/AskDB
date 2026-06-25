from src.RAG import schema_loader
from src.RAG.chatgpt_table_keywords import get_table_keywords

def formatter_sche():
    kb = schema_loader.load_schema()
    result = []

    for key, value in kb.items():
        result.append(f"Table {key}")

        keywords = get_table_keywords(key)
        if keywords:
            result.append(f"Keywords: {', '.join(keywords)}")
        else:
            result.append("Keywords: - None")

        for x in value["columns"]:
            if x['nullable']: 
                test = "nullable"
            else:
                test = "not nullable"

            if x['primary_key']:
                p = "primary key"
                result.append(f"- {x['name']} ({x['type']}, {test}, {p})")
            else:
                result.append(f"- {x['name']} ({x['type']}, {test})")

        relationships = value.get("relationships", [])

        result.append("Relationships:")
        if relationships:
            for rel in relationships:
                result.append(f"- {rel}")
        else:
            result.append("- None")

        result.append("")

    return "\n".join(result)