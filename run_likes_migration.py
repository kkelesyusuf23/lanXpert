from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found")
    exit(1)

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Creating article_likes table...")
    with open("c:/Projects/LanXpert/create_article_likes.sql", "r") as f:
        sql = f.read()
        conn.execute(text(sql))
        conn.commit()
    print("Done.")
