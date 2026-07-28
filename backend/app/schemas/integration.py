from pydantic import BaseModel, Field
from typing import Optional


class ExternalReportCreate(BaseModel):
    report_id: str = Field(..., description="Unique identifier from the external system (e.g. Tangsel ONE ticket ID)")
    title: str = Field(..., description="Title or subject of the report")
    description: str = Field(..., description="Full text description of the report")
    source: str = Field(..., description="Source of the report, e.g., 'SP4N-LAPOR!' or 'Tangsel ONE'")
    location_name: Optional[str] = Field(None, description="Reported location name")
    latitude: Optional[float] = Field(None, description="Latitude of the location")
    longitude: Optional[float] = Field(None, description="Longitude of the location")
    reporter_name: Optional[str] = Field(None, description="Name of the person who reported")
