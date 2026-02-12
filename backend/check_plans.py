import requests
import sys

# Assume we have a super admin token or we can just check if the endpoint is protected. 
# It IS protected by get_current_super_admin. 
# So I can't easily curl it without login.
# However, I can check the DB directly via python script like init_plans.py did.

from app.database import SessionLocal
from app import models

def check_plans():
    db = SessionLocal()
    plans = db.query(models.Plan).all()
    print(f"Found {len(plans)} plans:")
    for p in plans:
        print(f" - {p.name} (ID: {p.id})")
    db.close()

if __name__ == "__main__":
    check_plans()
