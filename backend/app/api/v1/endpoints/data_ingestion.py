from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.data_extractor import DataExtractorService

router = APIRouter()

@router.post("/sync/sipd")
def sync_sipd(db: Session = Depends(get_db)):
    """
    Trigger automatic sync from SIPD API.
    """
    service = DataExtractorService(db)
    return service.sync_from_sipd_api()

@router.post("/upload/excel")
async def upload_excel(
    file: UploadFile = File(...),
    year: int = Form(...),
    db: Session = Depends(get_db)
):
    """
    Upload an Excel file containing RKPD targets and realizations.
    """
    service = DataExtractorService(db)
    content = await file.read()
    return service.process_excel_upload(content, year)
