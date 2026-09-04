from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import skills, matching, benchmarks
from app.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Microservice AI cho Đề tài: Nền tảng quản lý thực tập và đối sánh năng lực sinh viên - doanh nghiệp tích hợp AI"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(skills.router)
app.include_router(matching.router)
app.include_router(benchmarks.router)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "gemini_api_configured": bool(settings.GEMINI_API_KEY)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
