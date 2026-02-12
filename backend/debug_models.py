
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.database import engine
    from app import models
    from sqlalchemy.orm import configure_mappers
    
    print("Attempting to configure mappers...")
    configure_mappers()
    print("Mappers configured successfully!")
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
