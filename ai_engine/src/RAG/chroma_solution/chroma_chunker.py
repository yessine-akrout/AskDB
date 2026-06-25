from src.RAG.schema_loader import load_schema
from src.RAG.chatgpt_table_keywords import get_table_keywords
def build_table_chunks():
    schema = load_schema()
    chunks = []

    for table_name, table_data in schema.items():
        columns = []
        columns_name=[]

        for column in table_data["columns"]:
            if column["primary_key"]:
                columns.append(f"- {column['name']} ({column['type']}, Primary Key)")
            else:
                columns.append(f"- {column['name']} ({column['type']})")

            columns_name.append(column['name'])
        columns_text = "\n".join(columns)

        
        keywords = get_table_keywords(table_name)
        keywords_text = ", ".join(keywords)

        relationships = table_data.get("relationships", [])
        if relationships:
            relationships_text = "\n".join(f"- {rel}" for rel in relationships)
        else:
            relationships_text = "- None"

        chunk_text = f"""Table: {table_name}

Mots-clés métier non SQL:: {keywords_text}.

colonnes:
{columns_text}

Relations:
{relationships_text}
"""

        chunk_dict={}
        chunk_dict["id"]=f"table_{table_name.lower().strip().replace(' ', '_')}"
        chunk_dict["text"]=chunk_text
        chunk_dict["metadata"]={}
        chunk_dict["metadata"]["table"]=table_name
        chunk_dict["metadata"]["columns"] = ", ".join(columns_name)


        chunks.append(chunk_dict)

    return chunks

