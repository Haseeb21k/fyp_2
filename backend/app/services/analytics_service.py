from collections import Counter, defaultdict
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.db.models import UnifiedTransaction, UserTransaction


class AnalyticsService:
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_unified_summary(self) -> Dict[str, Any]:
        """
        Generate summary statistics for unified transactions.
        """
        rows = self.db.query(UnifiedTransaction).all()
        
        payments = [
            row.amount for row in rows 
            if isinstance(row.amount, (int, float)) and row.amount is not None
        ]
        
        total_credit = sum([
            row.amount for row in rows 
            if getattr(row, 'type', None) == 'credit' 
            and isinstance(row.amount, (int, float)) 
            and row.amount is not None
        ])
        
        total_debit = sum([
            row.amount for row in rows 
            if getattr(row, 'type', None) == 'debit' 
            and isinstance(row.amount, (int, float)) 
            and row.amount is not None
        ])
        
        total_fees = sum(payments)
        largest = max(payments) if payments else 0
        avg = total_fees / len(payments) if payments else 0
        latest_balance = payments[-1] if payments else 0
        
        return {
            "total_credit": total_credit or 0,
            "total_debit": total_debit or 0,
            "total_fees_collected": total_fees or 0,
            "transaction_count": len(payments),
            "largest_payment": largest or 0,
            "average_payment": avg or 0,
            "latest_balance": latest_balance or 0
        }
    
    def get_pie_chart_data(self) -> Dict[str, int]:
        """
        Get transaction type counts for pie chart.
        """
        rows = self.db.query(UnifiedTransaction).all()
        type_counts = Counter(row.type for row in rows if row.type)
        return dict(type_counts)
    
    def get_bar_chart_data(self) -> Dict[str, float]:
        """
        Get total amounts by source file for bar chart.
        """
        rows = self.db.query(UnifiedTransaction).all()
        source_totals = defaultdict(float)
        
        for row in rows:
            if isinstance(row.amount, (int, float)):
                source_totals[row.source_file] += row.amount
        
        return dict(source_totals)
    
    def get_org_summary(self) -> Dict[str, Any]:
        """
        Generate summary statistics for organization transactions.
        """
        rows = self.db.query(UserTransaction).all()
        
        payments = [
            row.amount for row in rows 
            if isinstance(row.amount, (int, float)) and row.amount is not None
        ]
        
        total_credit = sum([
            row.amount for row in rows 
            if getattr(row, 'type', None) == 'credit' 
            and isinstance(row.amount, (int, float)) 
            and row.amount is not None
        ])
        
        total_debit = sum([
            row.amount for row in rows 
            if getattr(row, 'type', None) == 'debit' 
            and isinstance(row.amount, (int, float)) 
            and row.amount is not None
        ])
        
        total_fees = sum(payments)
        largest = max(payments) if payments else 0
        avg = total_fees / len(payments) if payments else 0
        latest_balance = payments[-1] if payments else 0
        
        return {
            "total_credit": total_credit or 0,
            "total_debit": total_debit or 0,
            "total_fees_collected": total_fees or 0,
            "transaction_count": len(payments),
            "largest_payment": largest or 0,
            "average_payment": avg or 0,
            "latest_balance": latest_balance or 0
        }
    
    def get_org_pie_chart_data(self) -> Dict[str, int]:
        """
        Get organization transaction type counts for pie chart.
        """
        rows = self.db.query(UserTransaction).all()
        type_counts = Counter(row.type for row in rows if row.type)
        return dict(type_counts)
    
    def get_org_bar_chart_data(self) -> Dict[str, float]:
        """
        Get total amounts by source file for organization bar chart.
        """
        rows = self.db.query(UserTransaction).all()
        source_totals = defaultdict(float)
        
        for row in rows:
            if isinstance(row.amount, (int, float)):
                source_totals[row.source_file] += row.amount
        
        return dict(source_totals)
