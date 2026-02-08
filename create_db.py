
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to default 'postgres' database to create new db
conn = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="postgress",
    host="localhost",
    port="5432"
)

conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

cur = conn.cursor()

db_name = "lanxpert"

# Check if database exists
cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
exists = cur.fetchone()

if not exists:
    print(f"Creating database '{db_name}'...")
    cur.execute(f"CREATE DATABASE {db_name}")
    print(f"Database '{db_name}' created successfully!")
else:
    print(f"Database '{db_name}' already exists.")

cur.close()
conn.close()
