# backend/app/api/routes.py
from fastapi import APIRouter, UploadFile, File, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.services.upload_service import UploadService
from app.services.transaction_service import TransactionService
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/")
def root():
    return {"message": "FastAPI backend is working!"}


@router.post("/unified_upload")
async def unified_upload(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    """Upload and process CSV and MT940 files for unified transaction storage."""
    upload_service = UploadService(db)
    return await upload_service.process_unified_upload(files)

@router.get("/unified_transactions")
def get_unified_transactions(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Rows per page")
):
    """Get paginated unified transactions."""
    transaction_service = TransactionService(db)
    return transaction_service.get_unified_transactions(page, page_size)

@router.post("/unified_transactions/save")
def save_unified_transactions(items: List[dict], db: Session = Depends(get_db)):
    """Save edited unified transactions (create/update)."""
    transaction_service = TransactionService(db)
    return transaction_service.save_unified_transactions(items)

@router.get("/unified_summary")
def unified_summary(db: Session = Depends(get_db)):
    """Get summary statistics for unified transactions."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_unified_summary()

@router.get("/unified_pie_type")
def unified_pie_type(db: Session = Depends(get_db)):
    """Get transaction type counts for pie chart."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_pie_chart_data()

@router.get("/unified_bar_source")
def unified_bar_source(db: Session = Depends(get_db)):
    """Get total amounts by source file for bar chart."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_bar_chart_data()

@router.post("/org_upload")
async def org_upload(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    """Upload and process CSV files for organization transaction storage."""
    upload_service = UploadService(db)
    return await upload_service.process_org_upload(files)

@router.get("/org_transactions")
def get_org_transactions(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Rows per page")
):
    """Get paginated organization transactions."""
    transaction_service = TransactionService(db)
    return transaction_service.get_org_transactions(page, page_size)

@router.post("/org_transactions/save")
def save_org_transactions(items: List[dict], db: Session = Depends(get_db)):
    """Save edited organization transactions (create/update)."""
    transaction_service = TransactionService(db)
    return transaction_service.save_org_transactions(items)

@router.get("/org_summary")
def org_summary(db: Session = Depends(get_db)):
    """Get summary statistics for organization transactions."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_org_summary()

@router.get("/org_pie_type")
def org_pie_type(db: Session = Depends(get_db)):
    """Get organization transaction type counts for pie chart."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_org_pie_chart_data()

@router.get("/org_bar_source")
def org_bar_source(db: Session = Depends(get_db)):
    """Get total amounts by source file for organization bar chart."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_org_bar_chart_data()