from src.RAG.chroma_solution.chroma_chunker import build_table_chunks
from src.RAG.chroma_solution import chroma_config
import chromadb

client = chromadb.PersistentClient(path=chroma_config.CHROMA_DB_PATH)

collection = client.create_collection(chroma_config.COLLECTION_NAME)
chunks = build_table_chunks()
ids=[]
documents=[]
metadatas=[]

for chunk in chunks:
    ids.append(chunk["id"])
    documents.append(chunk["text"])
    metadatas.append(chunk["metadata"])


collection.add(
    documents=documents,
    metadatas=metadatas,
    ids=ids
)

print(f"Indexed {len(chunks)} tables")
print("ChromaDB built successfully")