from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.db.models import UnifiedTransaction, UserTransaction


class TransactionService:
    """Service for handling transaction data operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_unified_transactions(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """
        Get paginated unified transactions with merged data fields.
        """
        query = self.db.query(UnifiedTransaction)
        total = query.count()
        rows = query.offset((page - 1) * page_size).limit(page_size).all()
        
        result = []
        for row in rows:
            base = {
                k: v for k, v in row.__dict__.items() 
                if not k.startswith('_') and k != 'metadata' and k != 'data' 
                and v not in [None, '', []]
            }
            
            data = row.data if row.data else {}
            merged = {**base, **data}
            result.append(merged)
        
        return {"total": total, "items": result}
    
    def get_org_transactions(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """
        Get paginated organization transactions with merged data fields.
        """
        query = self.db.query(UserTransaction)
        total = query.count()
        rows = query.offset((page - 1) * page_size).limit(page_size).all()
        
        result = []
        for row in rows:
            base = {
                k: v for k, v in row.__dict__.items() 
                if not k.startswith('_') and k != 'metadata' and k != 'data' 
                and v not in [None, '', []]
            }
            
            data = row.data if row.data else {}
            merged = {**base, **data}
            result.append(merged)
        
        return {"total": total, "items": result}

    def save_unified_transactions(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Persist edited unified transactions.

        - Expects a list of flat dicts as returned by get_unified_transactions.
        - Known base columns are mapped back to model columns.
        - Any additional fields are stored under the JSON `data` column.
        """
        if not isinstance(items, list):
            return {"success": False, "message": "Payload must be a list"}

        base_fields = {"id", "date", "amount", "description", "type", "source_file"}

        updated = 0
        created = 0

        for item in items:
            if not isinstance(item, dict):
                continue

            txn_id = item.get("id")

            base = {k: item.get(k) for k in base_fields if k in item}
            extras = {k: v for k, v in item.items() if k not in base_fields}

            if txn_id:
                txn = self.db.query(UnifiedTransaction).filter(UnifiedTransaction.id == txn_id).first()
                if not txn:
                    continue
                if "date" in base:
                    txn.date = base.get("date")
                if "amount" in base:
                    try:
                        txn.amount = float(base.get("amount")) if base.get("amount") is not None else None
                    except Exception:
                        pass
                if "description" in base:
                    txn.description = base.get("description")
                if "type" in base:
                    txn.type = base.get("type")
                if "source_file" in base:
                    txn.source_file = base.get("source_file")

                current_data = txn.data or {}
                current_data.update(extras)
                txn.data = current_data if current_data else None
                updated += 1
            else:
                try:
                    amount_val = float(base.get("amount")) if base.get("amount") is not None else None
                except Exception:
                    amount_val = None
                txn = UnifiedTransaction(
                    date=base.get("date"),
                    amount=amount_val,
                    description=base.get("description"),
                    type=base.get("type"),
                    source_file=base.get("source_file"),
                    data=extras or None,
                )
                self.db.add(txn)
                created += 1

        self.db.commit()
        return {"success": True, "updated": updated, "created": created}
    
    def save_org_transactions(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Persist edited organization transactions.
        """
        if not isinstance(items, list):
            return {"success": False, "message": "Payload must be a list"}

        base_fields = {"id", "date", "amount", "description", "type", "source_file"}

        updated = 0
        created = 0

        for item in items:
            if not isinstance(item, dict):
                continue

            txn_id = item.get("id")

            base = {k: item.get(k) for k in base_fields if k in item}
            extras = {k: v for k, v in item.items() if k not in base_fields}

            if txn_id:
                txn = self.db.query(UserTransaction).filter(UserTransaction.id == txn_id).first()
                if not txn:
                    continue
                if "date" in base:
                    txn.date = base.get("date")
                if "amount" in base:
                    try:
                        txn.amount = float(base.get("amount")) if base.get("amount") is not None else None
                    except Exception:
                        pass
                if "description" in base:
                    txn.description = base.get("description")
                if "type" in base:
                    txn.type = base.get("type")
                if "source_file" in base:
                    txn.source_file = base.get("source_file")

                current_data = txn.data or {}
                current_data.update(extras)
                txn.data = current_data if current_data else None
                updated += 1
            else:
                try:
                    amount_val = float(base.get("amount")) if base.get("amount") is not None else None
                except Exception:
                    amount_val = None
                txn = UserTransaction(
                    date=base.get("date"),
                    amount=amount_val,
                    description=base.get("description"),
                    type=base.get("type"),
                    source_file=base.get("source_file"),
                    data=extras or None,
                )
                self.db.add(txn)
                created += 1

        self.db.commit()
        return {"success": True, "updated": updated, "created": created}
