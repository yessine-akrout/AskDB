import chromadb
from src.RAG.chroma_solution import chroma_config


client = chromadb.PersistentClient(path=chroma_config.CHROMA_DB_PATH)
collection = client.get_collection(chroma_config.COLLECTION_NAME)


def retrieve_chunks(question: str, k: int | None = None) -> list[str]:
    """
    Retrieve the most relevant schema chunks from ChromaDB.
    For Northwind, simple semantic retrieval is enough.
    """
    if k is None:
        k = chroma_config.TOP_K

    results = collection.query(
        query_texts=[question],
        n_results=k,
    )

    return results["documents"][0]


def retrieve_schema_context(question: str) -> str:
    """
    Build the schema context that will be sent to the LLM.
    """
    chunks = retrieve_chunks(question)

    return "\n\n---\n\n".join(chunks)