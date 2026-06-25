from dotenv import load_dotenv
import os

load_dotenv()
DB_DRIVER=os.getenv("DB_DRIVER")
DB_SERVER=os.getenv("DB_SERVER")
DB_DATABASE=os.getenv("DB_DATABASE")
DB_TIMEOUT=int(os.getenv("DB_TIMEOUT","10"))
DB_TRUSTED_CONNECTION=os.getenv("DB_TRUSTED_CONNECTION","yes")

dicta={
    "DB_DRIVER":DB_DRIVER,
    "DB_SERVER":DB_SERVER,
    "DB_DATABASE":DB_DATABASE,
    
}

missing=[key for key,value in dicta.items() if not value ]
if missing:
    raise ValueError(f"verifier les données de {','.join(missing)}")



connection_string=(f"DRIVER={DB_DRIVER};SERVER={DB_SERVER};DATABASE={DB_DATABASE};Trusted_Connection={DB_TRUSTED_CONNECTION};Connection Timeout={DB_TIMEOUT}")