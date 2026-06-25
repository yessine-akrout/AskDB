from src.RAG import semantic_kb

def formatter_kb(question: str, max_items: int):
    kb = semantic_kb.SEMANTIC_KB
    question = question.lower()

    matches = []

    # 1. Exact keyword matching
    for key, value in kb.items():
        if key in question:
            matches.append((key, value))

    # 2. Fallback: partial matching (if nothing found)
    if not matches:
        for key, value in kb.items():
            if any(word in key for word in question.split()):
                matches.append((key, value))

    # 3. Limit size (VERY IMPORTANT)
    matches = matches[:max_items]

    # 4. Format clean output
    if not matches:
        return ""

    result = ["Relevant business knowledge:"]
    for key, value in matches:
        result.append(f"- {key}: {value}")

    return "\n".join(result)