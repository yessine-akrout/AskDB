from . import db
from decimal import Decimal
from datetime import datetime, date
import base64

def clean_value(value):
    if isinstance(value, Decimal):
        return float(value)

    if isinstance(value, (datetime, date)):
        return value.isoformat()

    if isinstance(value, bytes):
        return base64.b64encode(value).decode("utf-8")

    return value


def run_select(query: str):
    cnx = None
    cursor = None

    try:
        cnx = db.get_connection()
        cursor = cnx.cursor()
        cursor.execute(query)

        columns = [col[0] for col in cursor.description]
        raw_rows = cursor.fetchall()

        rows = []
        for row in raw_rows:
            clean_row = []
            for value in row:
                clean_row.append(clean_value(value))
            rows.append(clean_row)

        return {
            "columns": columns,
            "rows": rows,
            "row_count": len(rows)
        }

    finally:
        if cursor is not None:
            cursor.close()
        if cnx is not None:
            cnx.close()