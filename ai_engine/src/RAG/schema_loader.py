from src.sql import db


def get_schema_rows():
    cnx = None
    cursor = None
    try:
        cnx = db.get_connection()
        cursor = cnx.cursor()

        cursor.execute("""
SELECT 
    c.TABLE_NAME,
    c.COLUMN_NAME,
    c.IS_NULLABLE,
    c.DATA_TYPE,
    CASE 
        WHEN kcu.COLUMN_NAME IS NOT NULL THEN 1
        ELSE 0
    END AS IS_PRIMARY_KEY
FROM INFORMATION_SCHEMA.COLUMNS AS c
JOIN INFORMATION_SCHEMA.TABLES AS t
    ON c.TABLE_NAME = t.TABLE_NAME
   AND c.TABLE_SCHEMA = t.TABLE_SCHEMA
LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
    ON c.TABLE_NAME = tc.TABLE_NAME
   AND c.TABLE_SCHEMA = tc.TABLE_SCHEMA
   AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu
    ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
   AND c.TABLE_NAME = kcu.TABLE_NAME
   AND c.TABLE_SCHEMA = kcu.TABLE_SCHEMA
   AND c.COLUMN_NAME = kcu.COLUMN_NAME
WHERE t.TABLE_TYPE = 'BASE TABLE'
  AND c.TABLE_NAME NOT LIKE 'sys%'
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;        """)

        rows = cursor.fetchall()
        return rows

    finally:
        if cursor is not None:
            cursor.close()
        if cnx is not None:
            cnx.close()



def get_relatshionships_rows():
    cnx = None
    cursor = None
    try:
        cnx = db.get_connection()
        cursor = cnx.cursor()

        cursor.execute("""SELECT
    parent_table.name AS source_table,
    parent_column.name AS source_column,
    referenced_table.name AS target_table,
    referenced_column.name AS target_column
FROM sys.foreign_key_columns AS fkc
JOIN sys.tables AS parent_table
    ON fkc.parent_object_id = parent_table.object_id
JOIN sys.columns AS parent_column
    ON fkc.parent_object_id = parent_column.object_id
   AND fkc.parent_column_id = parent_column.column_id
JOIN sys.tables AS referenced_table
    ON fkc.referenced_object_id = referenced_table.object_id
JOIN sys.columns AS referenced_column
    ON fkc.referenced_object_id = referenced_column.object_id
   AND fkc.referenced_column_id = referenced_column.column_id
ORDER BY parent_table.name;""")

        rows = cursor.fetchall()
        return rows

    finally:
        if cursor is not None:
            cursor.close()
        if cnx is not None:
            cnx.close()

def build_relationships(rows):
    relationships_dict = {}

    for row in rows:
        relationship = f"{row.source_table}.{row.source_column} → {row.target_table}.{row.target_column}"

        if row.source_table not in relationships_dict:
            relationships_dict[row.source_table] = []

        relationships_dict[row.source_table].append(relationship)

    return relationships_dict

def build_schema_dict(rows):
    schema_dict = {}

    for row in rows:
        table_name = row.TABLE_NAME
        column_name = row.COLUMN_NAME
        data_type = row.DATA_TYPE
        is_nullable = row.IS_NULLABLE == "YES"
        is_primary_key = row.IS_PRIMARY_KEY == 1

        if table_name not in schema_dict:
            schema_dict[table_name] = {
                "columns": []
            }

        schema_dict[table_name]["columns"].append({
            "name": column_name,
            "type": data_type,
            "nullable": is_nullable,
            "primary_key": is_primary_key
        })

    return schema_dict


def load_schema():
    rows = get_schema_rows()
    schema = build_schema_dict(rows)

    relationship_rows = get_relatshionships_rows()
    relationships = build_relationships(relationship_rows)

    for table_name in schema:
        schema[table_name]["relationships"] = relationships.get(table_name, [])

    return schema