import sqlglot
from sqlglot.errors import ParseError
from sqlglot import exp

class UnsafeQueryError(Exception):
    pass

def validate_select_query(query: str) -> None :
    if query is None:
        raise UnsafeQueryError("sql vide")
    query_clean=query.strip()
    if query_clean =="":
        raise UnsafeQueryError("sql est des espaces")
    query_final=query_clean.upper()
    if ";" in query_final:
        raise UnsafeQueryError("interdit d'utiliser ; dans la requete")
    if "--" in query_final or "/*" in query_final or "*/" in query_final:
        raise UnsafeQueryError("interdit de faire des commentaires")
    try:
        ast=sqlglot.parse_one(query_clean, read="tsql")
    except ParseError as e:
        raise UnsafeQueryError("Invalid SQL syntax") from e

    if not isinstance(ast, exp.Select):
        raise UnsafeQueryError("Only SELECT queries are allowed")

    if not ast.expressions :
        raise UnsafeQueryError("SELECT must specify at least one column/expression")
    if ast.args.get("into") is not None:
        raise UnsafeQueryError("SELECT INTO is not allowed (write operation)")
 