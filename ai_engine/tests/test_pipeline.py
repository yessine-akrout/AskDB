from src.pipeline.pipeline import run_query
import pytest
from src.sql.validator import UnsafeQueryError


def test_pipeline_valid_query():
    result = run_query("SELECT TOP 2 * FROM Students")
    assert result["row_count"] <= 2


def test_pipeline_blocks_delete():
    with pytest.raises(UnsafeQueryError):
        run_query("DELETE FROM Students")