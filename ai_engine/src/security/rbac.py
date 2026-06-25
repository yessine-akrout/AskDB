"""
RBAC configuration for the Text-to-SQL project.

French role version:
- stagiaire: limited access to simple operational/reference tables.
- directeur: full database access.
- admin: full database access.

Use this file before retrieval/prompting and before executing generated SQL.
"""

from __future__ import annotations

import re
from typing import Iterable


# -------------------------------------------------------------------
# 1. Role -> table access configuration
# -------------------------------------------------------------------

ROLE_TABLE_ACCESS: dict[str, dict[str, list[str]]] = {
    "stagiaire": {
        # Real tables selected from the UNILOG schema.
        # Simple operational/reference data only.
        "allowed_tables": [
            "Art",
            "ArtCat",
            "ArtUnit",
            "ArtSite",
            "ArtBarCode",
            "Unite",
            "Stock",
            "StockEmp",
            "Site",
            "Clients",
            "Tiers",
            "TiersC",
            "TiersType",
            "Fournisseurs",
        ],
        # Block sensitive business/finance/payment/payroll questions.
        "blocked_keywords": [
            "salaire",
            "salary",
            "paie",
            "payroll",
            "prime",
            "bonus",
            "cnss",
            "banque",
            "bank",
            "rib",
            "caisse",
            "payment",
            "paiement",
            "règlement",
            "reglement",
            "facture",
            "invoice",
            "chiffre d'affaires",
            "chiffre d affaire",
            "ca",
            "revenu",
            "revenue",
            "profit",
            "bénéfice",
            "benefice",
            "marge",
            "montant",
            "total ventes",
            "vente",
            "ventes",
            "achat",
            "achats",
            "tva",
            "taxe",
            "tax",
            "comptabilité",
            "comptabilite",
            "accounting",
            "gacc",
        ],
    },

    "directeur": {
        # Direction/CEO can access the full database.
        "allowed_tables": ["*"],
        "blocked_keywords": [],
    },

    "admin": {
        # Admin can access the full database.
        "allowed_tables": ["*"],
        "blocked_keywords": [],
    },
}


# -------------------------------------------------------------------
# 2. Sensitive tables/prefixes blocked for non-full-access roles
# -------------------------------------------------------------------

SENSITIVE_TABLE_NAMES: set[str] = {
    "Reglement",
    "ReglementD",
    "ReglementS",
    "Banque",
    "BanqueC",
    "BanqueCrd",
    "BanqueCrdD",
    "BanqueD",
    "BanqueT",
    "Caisse",
    "Document",
    "DocumentD",
    "DocumentA",
    "DocumentBD",
    "DocumentBE",
    "DocumentCalc",
    "DocumentComp",
    "DocumentCompD",
    "DocumentCompE",
    "TVAImpot",
    "GRHDataPaie",
    "GRHDataPaieV",
    "GRHVir",
    "GRHVirD",
    "GRHVirParam",
}

SENSITIVE_TABLE_PREFIXES: tuple[str, ...] = (
    "Gacc",        # accounting tables
    "Reg",         # payment/settlement tables
    "Banque",      # bank tables
    "Caisse",      # cash tables
    "Document",    # sales/purchase documents with amounts
    "GRHDataPaie", # payroll tables
)


# -------------------------------------------------------------------
# 3. Public helpers
# -------------------------------------------------------------------

def normalize_role(role: str | None) -> str:
    """Return a normalized French role name."""
    if not role:
        return "stagiaire"

    role = role.strip().lower()

    aliases = {
        # Limited access
        "intern": "stagiaire",
        "stagiaire": "stagiaire",
        "student": "stagiaire",
        "employee": "stagiaire",
        "employe": "stagiaire",
        "employé": "stagiaire",

        # Full access - director/CEO
        "ceo": "directeur",
        "directeur": "directeur",
        "direction": "directeur",
        "director": "directeur",
        "manager": "directeur",

        # Full access - admin
        "admin": "admin",
        "administrator": "admin",
        "admin": "admin",
    }

    normalized = aliases.get(role, role)

    if normalized not in ROLE_TABLE_ACCESS:
        return "stagiaire"

    return normalized


def get_allowed_tables(role: str | None) -> list[str]:
    """Return the list of tables allowed for a role."""
    role = normalize_role(role)
    return ROLE_TABLE_ACCESS[role]["allowed_tables"]


def has_full_access(role: str | None) -> bool:
    """Return True if the role has full database access."""
    return normalize_role(role) in {"directeur", "admin"}


def clean_sql_identifier(identifier: str) -> str:
    """Clean SQL identifier and keep only the table part."""
    identifier = identifier.strip()
    identifier = identifier.replace("[", "").replace("]", "")

    # If SQL uses dbo.TableName, keep only TableName.
    if "." in identifier:
        identifier = identifier.split(".")[-1]

    return identifier.strip()


def is_sensitive_table(table_name: str) -> bool:
    """Return True if the table is considered sensitive for non-full-access roles."""
    clean_name = clean_sql_identifier(table_name)

    if clean_name in SENSITIVE_TABLE_NAMES:
        return True

    return clean_name.startswith(SENSITIVE_TABLE_PREFIXES)


def is_table_allowed(table_name: str, role: str | None) -> bool:
    """Check if a table can be accessed by a role."""
    role = normalize_role(role)
    clean_name = clean_sql_identifier(table_name)
    allowed_tables = get_allowed_tables(role)

    if "*" in allowed_tables:
        return True

    if is_sensitive_table(clean_name):
        return False

    return clean_name in allowed_tables


def normalize_text(text: str) -> str:
    """Normalize text for keyword checks."""
    text = text.lower().strip()
    text = text.replace("’", "'")
    text = text.replace("`", "'")
    text = text.replace("´", "'")
    text = text.replace("‘", "'")
    return text


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
    return not contains_blocked_keyword(question, role)


def extract_tables_from_sql(sql: str) -> list[str]:
    """
    Extract table names used after FROM/JOIN.

    Supports:
    - FROM TableName
    - JOIN TableName
    - FROM dbo.TableName
    - JOIN [dbo].[TableName]
    - JOIN [TableName]
    """
    pattern = (
        r"\b(?:FROM|JOIN)\s+"
        r"((?:\[[^\]]+\]|[A-Za-z0-9_]+)"
        r"(?:\.(?:\[[^\]]+\]|[A-Za-z0-9_]+))?)"
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
    - True  -> SQL uses only allowed tables
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


