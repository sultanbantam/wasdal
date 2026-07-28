from fastapi import APIRouter

from app.api.v1.endpoints import ai, auth, cases, dashboard, health, integration, knowledge, meetings, reports

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(meetings.router, prefix="/meetings", tags=["meetings"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(integration.router, prefix="/integrations", tags=["integrations"])
