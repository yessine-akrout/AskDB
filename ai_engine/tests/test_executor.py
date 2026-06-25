from src.sql.executor import run_select


def test_run_select_top_returns_rows():
    result = run_select("SELECT TOP 2 * FROM Students")
    assert result["row_count"] <= 2 
    assert len(result["columns"])!=0 
    assert isinstance(result["rows"], list)
    assert result["row_count"] == len(result["rows"])

def test_run_select_count_returns_single_value():
    result= run_select("SELECT COUNT(*) AS cnt FROM Instructors")
    assert result["row_count"] == 1 
    assert result["columns"][0]=="cnt" 
    assert isinstance(result["rows"][0][0], int)


def test_run_select_where_filters():
    result= run_select("SELECT full_name FROM Instructors where hire_year=2012")
    assert result["row_count"] == 1 
    assert isinstance(result["rows"][0][0], str)

