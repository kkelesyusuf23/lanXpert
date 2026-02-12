from app.database import SessionLocal
from app.models import Language

db = SessionLocal()
langs = db.query(Language).all()
print("--- LANGUAGES IN DB ---")
for l in langs:
    print(f"{l.name}: {l.id} ({l.code})")
db.close()
