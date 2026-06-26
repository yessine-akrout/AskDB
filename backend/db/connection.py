import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()

DB_DRIVER = os.getenv("DB_DRIVER", "SQL Server")
DB_SERVER = os.getenv("DB_SERVER")
DB_DATABASE = os.getenv("DB_DATABASE")
DB_TRUSTED_CONNECTION = os.getenv("DB_TRUSTED_CONNECTION", "yes")
DB_TIMEOUT = os.getenv("DB_TIMEOUT", "10")


def get_connection():
    driver = DB_DRIVER
    if not driver.startswith("{"):
        driver = f"{{{driver}}}"
        
    conn_str = (
        f"DRIVER={driver};"
        f"SERVER={DB_SERVER};"
        f"DATABASE={DB_DATABASE};"
        f"Trusted_Connection={DB_TRUSTED_CONNECTION};"
        f"Connection Timeout={DB_TIMEOUT};"
    )
    return pyodbc.connect(conn_str)