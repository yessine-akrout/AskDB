import pytest
from src.sql.validator import validate_select_query, UnsafeQueryError


def test_validate_simple_select():
    validate_select_query("SELECT TOP 2 * FROM Students")


def test_validate_count_select():
    validate_select_query("SELECT COUNT(*) AS cnt FROM Instructors")


def test_validate_where_select():
    validate_select_query("SELECT full_name FROM Instructors WHERE hire_year = 2012")


def test_block_empty_query():
    with pytest.raises(UnsafeQueryError):
        validate_select_query("   ")


def test_block_delete_query():
    with pytest.raises(UnsafeQueryError):
        validate_select_query("DELETE FROM Students")


def test_block_select_into():
    with pytest.raises(UnsafeQueryError):
        validate_select_query("SELECT * INTO Backup FROM Students")


def test_block_multistatement():
    with pytest.raises(UnsafeQueryError):
        validate_select_query("SELECT * FROM Students; DROP TABLE Students")


def test_block_comment_query():
    with pytest.raises(UnsafeQueryError):
        validate_select_query("SELECT * FROM Students -- comment")


def test_block_invalid_syntax():
    with pytest.raises(UnsafeQueryError):
        validate_select_query("SELEC * FROM Students")


def test_block_select_without_columns():
    with pytest.raises(UnsafeQueryError):
        validate_select_query("SELECT FROM Students")


def test_block_none_query():
    with pytest.raises(UnsafeQueryError):
        validate_select_query(None)