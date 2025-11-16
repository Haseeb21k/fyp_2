import csv
import os
from typing import List, Dict, Any
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.db.models import UnifiedTransaction, UserTransaction
from app.parsers.csv_normalizer import normalize_csv_row
from app.parsers.mt940_parser import parse_mt940


class UploadService:
    
    def __init__(self, db: Session):
        self.db = db
        self.fixed_keys = {'date', 'amount', 'description', 'type', 'source_file'}
    
    def normalize_mt940_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'date': row.get('value_date', ''),
            'amount': row.get('amount', 0.0),
            'description': row.get('description', ''),
            'type': row.get('type', ''),
        }
    
    async def process_unified_upload(self, files: List[UploadFile]) -> Dict[str, List[Dict]]:
        # Clear existing data
        self.db.query(UnifiedTransaction).delete()
        self.db.commit()
        
        all_rows = []
        
        for file in files:
            filename = file.filename
            content = await file.read()
            ext = os.path.splitext(filename)[1].lower()
            
            if ext in ['.csv']:
                rows = await self._process_csv_file(content, filename)
                all_rows.extend(rows)
            elif ext in ['.txt', '.mt940']:
                rows = await self._process_mt940_file(content, filename)
                all_rows.extend(rows)
        
        self.db.commit()
        return {"rows": all_rows}
    
    async def process_org_upload(self, files: List[UploadFile]) -> Dict[str, List[Dict]]:
        # Clear existing data
        self.db.query(UserTransaction).delete()
        self.db.commit()
        
        all_rows = []
        
        for file in files:
            filename = file.filename
            content = await file.read()
            ext = os.path.splitext(filename)[1].lower()
            
            if ext in ['.csv']:
                rows = await self._process_csv_file(content, filename, use_user_transaction=True)
                all_rows.extend(rows)
        
        self.db.commit()
        return {"rows": all_rows}
    
    async def _process_csv_file(self, content: bytes, filename: str, use_user_transaction: bool = False) -> List[Dict]:
        decoded = content.decode()
        reader = csv.DictReader(decoded.splitlines())
        rows = []
        
        for row in reader:
            norm = normalize_csv_row(row)
            norm['source_file'] = filename
            
            # Separate extra fields
            data = {k: v for k, v in row.items() 
                   if k not in self.fixed_keys and v not in [None, '', []]}
            
            # Create transaction record
            if use_user_transaction:
                transaction = UserTransaction(
                    date=norm.get('date'),
                    amount=norm.get('amount'),
                    description=norm.get('description'),
                    type=norm.get('type'),
                    source_file=norm.get('source_file'),
                    data=data if data else None
                )
            else:
                transaction = UnifiedTransaction(
                    date=norm.get('date'),
                    amount=norm.get('amount'),
                    description=norm.get('description'),
                    type=norm.get('type'),
                    source_file=norm.get('source_file'),
                    data=data if data else None
                )
            
            self.db.add(transaction)
            
            # Merge normalized data with extra fields for response
            merged = {**norm, **data}
            rows.append(merged)
        
        return rows
    
    async def _process_mt940_file(self, content: bytes, filename: str) -> List[Dict]:
        try:
            parsed = parse_mt940(content.decode())
        except Exception:
            return []
        
        rows = []
        for row in parsed:
            norm = self.normalize_mt940_row(row)
            norm['source_file'] = filename
            
            # Create transaction record
            transaction = UnifiedTransaction(
                date=norm.get('date'),
                amount=norm.get('amount'),
                description=norm.get('description'),
                type=norm.get('type'),
                source_file=norm.get('source_file'),
                data=None
            )
            
            self.db.add(transaction)
            rows.append(norm)
        
        return rows
