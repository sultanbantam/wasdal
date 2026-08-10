from io import BytesIO
from typing import Any
import pandas as pd
from sqlalchemy.orm import Session
from app.models.performance import RPJMD, IndicatorTarget, PerformanceIndicator, RKPD, Program

class DataExtractorService:
    """
    Handles extraction of data from SIPD documents (Excel/PDF) or direct API synchronization.
    """
    def __init__(self, db: Session):
        self.db = db

    def sync_from_sipd_api(self) -> dict[str, Any]:
        """
        Mock implementation for syncing data automatically from SIPD API.
        """
        # In a real scenario, this would make an HTTP request to the SIPD API
        # e.g., requests.get("https://sipd.kemendagri.go.id/api/...")
        
        # We will mock syncing a Program
        try:
            rkpd = self.db.query(RKPD).first()
            if not rkpd:
                rkpd = RKPD(year=2026, theme="Mock SIPD Theme")
                self.db.add(rkpd)
                self.db.commit()
            
            program = self.db.query(Program).filter_by(name="Program Penyelenggaraan Jalan").first()
            if not program:
                program = Program(rkpd_id=rkpd.id, name="Program Penyelenggaraan Jalan", opd_id="Dinas PUPR", total_budget=5000000000, realized_budget=2000000000)
                self.db.add(program)
            else:
                # Update existing program
                program.realized_budget = 2500000000
            
            self.db.commit()
            return {"status": "success", "message": "Successfully synced 1 program from SIPD API"}
        except Exception as e:
            self.db.rollback()
            return {"status": "error", "message": str(e)}

    def process_excel_upload(self, file_bytes: bytes, year: int) -> dict[str, Any]:
        """
        Processes an uploaded Excel file containing RKPD targets and realizations.
        """
        try:
            # For MVP we just read it into a pandas dataframe to simulate parsing
            df = pd.read_excel(BytesIO(file_bytes))
            
            rkpd = self.db.query(RKPD).filter_by(year=year).first()
            if not rkpd:
                rkpd = RKPD(year=year, theme=f"RKPD {year}")
                self.db.add(rkpd)
                self.db.commit()

            count = 0
            # Assuming columns: ['Program', 'OPD', 'Target Anggaran', 'Realisasi Anggaran']
            for _, row in df.iterrows():
                if pd.isna(row.get('Program')):
                    continue
                    
                prog_name = str(row['Program'])
                opd = str(row.get('OPD', 'Tidak Diketahui'))
                budget = float(row.get('Target Anggaran', 0))
                realized = float(row.get('Realisasi Anggaran', 0))

                program = self.db.query(Program).filter_by(name=prog_name, rkpd_id=rkpd.id).first()
                if not program:
                    program = Program(rkpd_id=rkpd.id, name=prog_name, opd_id=opd, total_budget=budget, realized_budget=realized)
                    self.db.add(program)
                else:
                    program.total_budget = budget
                    program.realized_budget = realized
                count += 1
                
            self.db.commit()
            return {"status": "success", "message": f"Successfully imported {count} programs from Excel."}
            
        except Exception as e:
            self.db.rollback()
            return {"status": "error", "message": f"Failed to process Excel: {str(e)}"}
