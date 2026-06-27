"""
RBAC configuration for the AskDB Text-to-SQL project.

Northwind database version:
- intern: limited access to safe reference/operational tables.
- director: full database access.
- admin: full database access.

Use this file before retrieval/prompting and before executing generated SQL.
"""

from __future__ import annotations

import re


# -------------------------------------------------------------------
# 1. Role -> table access configuration
# -------------------------------------------------------------------

ROLE_TABLE_ACCESS: dict[str, dict[str, list[str]]] = {
    "intern": {
        # Safe Northwind tables for limited demo access.
        # Orders, Order Details, invoices, and sales views are blocked.
        "allowed_tables": [
            "Categories",
            "Products",
            "Suppliers",
            "Customers",
            "Employees",
            "Shippers",
            "Region",
            "Territories",
            "EmployeeTerritories",
            "CustomerDemographics",
            "CustomerCustomerDemo",
        ],

        # Business/sales/financial keywords blocked for interns.
        "blocked_keywords": [
            "revenue",
            "sales",
            "sale",
            "profit",
            "margin",
            "amount",
            "price",
            "unit price",
            "discount",
            "freight",
            "invoice",
            "invoices",
            "payment",
            "subtotal",
            "total sales",
            "turnover",
            "cost",
            "order details",
            "most expensive",
            "top customers",
            "best customers",
            "customer revenue",
        ],
    },

    "director": {
        # Director can access the full Northwind database.
        "allowed_tables": ["*"],
        "blocked_keywords": [],
    },

    "admin": {
        # Admin can access the full Northwind database.
        "allowed_tables": ["*"],
        "blocked_keywords": [],
    },
}


# -------------------------------------------------------------------
# 2. Sensitive Northwind tables/views blocked for limited roles
# -------------------------------------------------------------------

SENSITIVE_TABLE_NAMES: set[str] = {
    # Sales/order financial data
    "Orders",
    "Order Details",

    # Common Northwind views containing sales, prices, invoices, or totals
    "Invoices",
    "Order Details Extended",
    "Order Subtotals",
    "Sales by Category",
    "Sales Totals by Amount",
    "Summary of Sales by Quarter",
    "Summary of Sales by Year",
    "Category Sales for 1997",
    "Product Sales for 1997",
    "Products Above Average Price",
    "Ten Most Expensive Products",

    # Internal AskDB tables if stored in the same SQL Server database
    "query_logs",
    "admin_logs",
    "users",
}

SENSITIVE_TABLE_PREFIXES: tuple[str, ...] = (
    "Sales",
    "Invoice",
    "Payment",
    "Revenue",
    "Profit",
    "Summary of Sales",
)


# -------------------------------------------------------------------
# 3. Public helpers
# -------------------------------------------------------------------

def normalize_role(role: str | None) -> str:
    """Return a normalized role name."""
    if not role:
        return "intern"

    role = role.strip().lower()

    aliases = {
        # Limited access
        "intern": "intern",
        "student": "intern",
        "employee": "intern",

        # Keep these aliases only in case old demo users still use them
        "stagiaire": "intern",

        # Full access - director
        "director": "director",
        "manager": "director",
        "ceo": "director",

        # Keep this alias only in case old demo users still use it
        "directeur": "director",

        # Full access - admin
        "admin": "admin",
        "administrator": "admin",
    }

    normalized = aliases.get(role, role)

    if normalized not in ROLE_TABLE_ACCESS:
        return "intern"

    return normalized


def get_allowed_tables(role: str | None) -> list[str]:
    """Return the list of tables allowed for a role."""
    role = normalize_role(role)
    return ROLE_TABLE_ACCESS[role]["allowed_tables"]


def has_full_access(role: str | None) -> bool:
    """Return True if the role has full database access."""
    return normalize_role(role) in {"director", "admin"}


def clean_sql_identifier(identifier: str) -> str:
    """
    Clean SQL identifier and keep only the table/view name.

    Examples:
    - dbo.Customers              -> Customers
    - [dbo].[Order Details]      -> Order Details
    - NORTHWIND_DB.dbo.Products  -> Products
    """
    identifier = identifier.strip()

    identifier = identifier.replace("[", "").replace("]", "")
    identifier = identifier.replace('"', "")
    identifier = identifier.replace("`", "")

    # If SQL uses database.schema.table or schema.table, keep only table.
    if "." in identifier:
        identifier = identifier.split(".")[-1]

    return identifier.strip()


def normalize_identifier(identifier: str) -> str:
    """Normalize SQL identifier for comparison."""
    return clean_sql_identifier(identifier).lower()


def is_sensitive_table(table_name: str) -> bool:
    """Return True if the table/view is sensitive for limited roles."""
    clean_name = clean_sql_identifier(table_name)
    normalized_name = normalize_identifier(clean_name)

    sensitive_names = {
        normalize_identifier(name)
        for name in SENSITIVE_TABLE_NAMES
    }

    if normalized_name in sensitive_names:
        return True

    return any(
        normalized_name.startswith(prefix.lower())
        for prefix in SENSITIVE_TABLE_PREFIXES
    )


def is_table_allowed(table_name: str, role: str | None) -> bool:
    """Check if a table/view can be accessed by a role."""
    role = normalize_role(role)
    clean_name = clean_sql_identifier(table_name)
    allowed_tables = get_allowed_tables(role)

    if "*" in allowed_tables:
        return True

    if is_sensitive_table(clean_name):
        return False

    allowed_tables_normalized = {
        normalize_identifier(table)
        for table in allowed_tables
    }

    return normalize_identifier(clean_name) in allowed_tables_normalized


def normalize_text(text: str) -> str:
    """Normalize text for keyword checks."""
    return (
        text.lower()
        .strip()
        .replace("’", "'")
        .replace("`", "'")
        .replace("´", "'")
        .replace("‘", "'")
    )


def contains_blocked_keyword(text: str, role: str | None) -> bool:
    """Check whether the natural-language question contains blocked terms."""
    role = normalize_role(role)

    if has_full_access(role):
        return False

    blocked_keywords = ROLE_TABLE_ACCESS[role]["blocked_keywords"]
    text_normalized = normalize_text(text)

    return any(
        normalize_text(keyword) in text_normalized
        for keyword in blocked_keywords
    )


def validate_user_question_access(question: str, role: str | None) -> bool:
    """
    Validate natural-language question before retrieval/prompting.

    Return:
    - True  -> question is allowed
    - False -> reject with ACCESS_DENIED
    """
    return not contains_blocked_keyword(question, role)


def extract_tables_from_sql(sql: str) -> list[str]:
    """
    Extract table/view names used after FROM/JOIN.

    Supports:
    - FROM Customers
    - JOIN Products
    - FROM dbo.Customers
    - JOIN [Order Details]
    - JOIN [dbo].[Order Details]
    - FROM NORTHWIND_DB.dbo.Customers
    """
    identifier_part = r'(?:\[[^\]]+\]|"[^"]+"|[A-Za-z_][A-Za-z0-9_]*)'

    pattern = (
        r"\b(?:FROM|JOIN)\s+"
        rf"({identifier_part}(?:\s*\.\s*{identifier_part}){{0,2}})"
    )

    matches = re.findall(pattern, sql, flags=re.IGNORECASE)

    tables: list[str] = []

    for raw_name in matches:
        clean_name = clean_sql_identifier(raw_name)
        tables.append(clean_name)

    return tables


def validate_sql_table_access(sql: str, role: str | None) -> bool:
    """
    Validate generated SQL after LLM generation and before execution.

    Return:
    - True  -> SQL uses only allowed tables/views
    - False -> reject with ACCESS_DENIED
    """
    if has_full_access(role):
        return True

    used_tables = extract_tables_from_sql(sql)

    if not used_tables:
        return False

    return all(
        is_table_allowed(table, role)
        for table in used_tables
    )