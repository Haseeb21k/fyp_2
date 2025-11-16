# backend/app/db/models.py
from sqlalchemy import Column, Integer, Float, String, Boolean
from sqlalchemy.types import JSON as SAJSON
from app.db.database import Base


class UnifiedTransaction(Base):
    __tablename__ = "unified_transactions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String)
    amount = Column(Float)
    description = Column(String)
    type = Column(String)  # credit/debit/fee/etc.
    source_file = Column(String)  # Optional: filename or batch id
    data = Column(SAJSON)  # Store extra/dynamic fields

class UserTransaction(Base):
    __tablename__ = "user_transactions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String)
    amount = Column(Float)
    description = Column(String)
    type = Column(String)  # credit/debit/fee/etc.
    source_file = Column(String)  # Optional: filename or batch id
    data = Column(SAJSON)  # Store extra/dynamic fields

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_superuser = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)