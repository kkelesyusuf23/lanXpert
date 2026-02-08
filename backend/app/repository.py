from typing import Generic, Type, TypeVar, List, Optional, Any, Dict
from sqlalchemy.orm import Session, Query
from sqlalchemy import desc, asc
from .database import Base

ModelType = TypeVar("ModelType", bound=Base)

class Repository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get(self, id: Any) -> Optional[ModelType]:
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        setup_query: Optional[Any] = None,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        descending: bool = True
    ) -> List[ModelType]:
        query = self.db.query(self.model)
        
        if setup_query:
            query = setup_query(query)

        if filters:
            for attr, value in filters.items():
                if hasattr(self.model, attr) and value is not None:
                    query = query.filter(getattr(self.model, attr) == value)

        if order_by and hasattr(self.model, order_by):
            column = getattr(self.model, order_by)
            query = query.order_by(desc(column) if descending else asc(column))
        
        return query.offset(skip).limit(limit).all()

    def create(self, obj_in: Dict[str, Any]) -> ModelType:
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: ModelType, obj_in: Dict[str, Any]) -> ModelType:
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: Any) -> ModelType:
        obj = self.db.query(self.model).get(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
        return obj
