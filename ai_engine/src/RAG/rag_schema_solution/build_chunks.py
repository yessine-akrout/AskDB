from src.RAG.schema_loader import load_schema
from src.RAG.chatgpt_table_keywords import get_table_keywords
import json

def build_table_chunks():
    schema = load_schema()
    chunks = []

    for table_name, table_data in schema.items():
        columns = []

        for column in table_data["columns"]:
            if column["primary_key"]:
                if column["nullable"]:
                    columns.append(f"- {column['name']} ({column['type']}, Primary Key, Nullable)")
                else:
                    columns.append(f"- {column['name']} ({column['type']}, Primary Key, Not Nullable)")
            else:
                if column["nullable"]:
                    columns.append(f"- {column['name']} ({column['type']}, Nullable)")
                else:
                    columns.append(f"- {column['name']} ({column['type']}, Not Nullable)")

        columns_text = "\n".join(columns)

        keywords = get_table_keywords(table_name)

        if keywords:
            keywords_text = ", ".join(keywords)
        else:
            keywords_text = "- None"

        relationships = table_data.get("relationships", [])

        if relationships:
            relationships_text = "\n".join(f"- {rel}" for rel in relationships)
        else:
            relationships_text = "- None"

        chunk_text = f"""Table: {table_name}

Keywords:
{keywords_text}

Columns:
{columns_text}

Relationships:
{relationships_text}
"""

        chunks.append(chunk_text)

    return chunks


chunks = build_table_chunks()
with open('chunks.json', 'w', encoding='utf-8') as file:
    json.dump(chunks, file, ensure_ascii=False, indent=2)