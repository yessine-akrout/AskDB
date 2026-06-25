from sentence_transformers import SentenceTransformer, util
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHUNKS_PATH = os.path.join(BASE_DIR, "chunks.json")

with open(CHUNKS_PATH, 'r', encoding='utf-8') as file:
    chunks = json.load(file)
# -------------------------
# Load model once
# -------------------------
model = SentenceTransformer("all-MiniLM-L6-v2")

# -------------------------
# Encode chunks once
# -------------------------
chunk_embeddings = model.encode(chunks)


def retrieve_chunks(question, top_k=3):

    # -------------------------
    # 1. Clean question
    # -------------------------
    question_lower = question.lower()

    cleaned = ""
    for char in question_lower:
        if char.isalnum() or char == " ":
            cleaned += char
        else:
            cleaned += " "

    words = cleaned.split()

    useless_words = [
        "show", "all", "the", "in", "from", "give", "list",
        "me", "of", "number", "by", "to", "with"
    ]

    clean_question = [word for word in words if word not in useless_words]

    synonyms = {
        "client": "customer",
        "clients": "customers",
        "staff": "employees",
        "employee": "employees",
        "sales": "orders",
        "sale": "order",
        "shipping": "ship",
        "shipment": "ship",
        "cost": "freight",
        "price": "unitprice",
        "product": "products",
        "supplier": "suppliers",
        "category": "categories"
    }

    clean_question = [synonyms.get(word, word) for word in clean_question]

    print("Clean question:", clean_question)

    # -------------------------
    # 2. Lexical scoring (INDEX-BASED)
    # -------------------------
    lexical_results = {}

    for index, chunk in enumerate(chunks):
        chunk_lower = chunk.lower()

        chunk_name = chunk_lower.split("\n")[0]

        desc_start = chunk_lower.find("description")
        cols_start = chunk_lower.find("columns")
        rel_start = chunk_lower.find("relationships")

        chunk_description = chunk_lower[desc_start:cols_start]
        chunk_columns = chunk_lower[cols_start:rel_start]
        chunk_relationships = chunk_lower[rel_start:]

        lexical_score = 0
        matched_words = []

        for word in clean_question:

            if word in chunk_name:
                lexical_score += 4
                matched_words.append(word)
                continue

            if word in chunk_columns:
                lexical_score += 3
                matched_words.append(word)
                continue

            if word in chunk_relationships:
                lexical_score += 2
                matched_words.append(word)
                continue

            if word in chunk_description:
                lexical_score += 1
                matched_words.append(word)
                continue

        lexical_results[index] = {
            "lexical_score": lexical_score,
            "matched_words": matched_words
        }

    # -------------------------
    # 3. Normalize lexical scores
    # -------------------------
    max_lexical = max(item["lexical_score"] for item in lexical_results.values())

    if max_lexical == 0:
        max_lexical = 1

    for index in lexical_results:
        lexical_results[index]["normalized_lexical"] = (
            lexical_results[index]["lexical_score"] / max_lexical
        )

    # -------------------------
    # 4. Embedding scores
    # -------------------------
    question_embedding = model.encode(question)
    embedding_scores = util.cos_sim(question_embedding, chunk_embeddings)[0]

    # -------------------------
    # 5. Hybrid scoring
    # -------------------------
    hybrid_results = []

    for index, (chunk, embedding_score) in enumerate(zip(chunks, embedding_scores)):

        lexical_score = lexical_results[index]["lexical_score"]
        normalized_lexical = lexical_results[index]["normalized_lexical"]
        matched_words = lexical_results[index]["matched_words"]

        embedding_score = float(embedding_score)

        final_score = (0.6 * normalized_lexical) + (0.4 * embedding_score)

        hybrid_results.append({
            "chunk_name": chunk.split("\n")[0],
            "chunk_text": chunk,
            "lexical_score": lexical_score,
            "normalized_lexical": normalized_lexical,
            "embedding_score": embedding_score,
            "final_score": final_score,
            "matched_words": matched_words
        })

    # -------------------------
    # 6. Sort results
    # -------------------------
    hybrid_results = sorted(
        hybrid_results,
        key=lambda x: x["final_score"],
        reverse=True
    )

    return hybrid_results[:top_k]


def build_context(top_chunks):
    return "\n\n".join(
        chunk["chunk_text"] for chunk in top_chunks
    )