from src import config
import pyodbc

def get_connection():
    try:
        cnxn=pyodbc.connect(config.connection_string)
        return cnxn
    except pyodbc.Error as e:
        raise Exception("Database connection failed") from e

