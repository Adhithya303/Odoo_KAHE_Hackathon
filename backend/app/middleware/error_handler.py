"""Error handler middleware."""
from fastapi import Request
from fastapi.responses import JSONResponse
import traceback


async def error_handler(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "code": "INTERNAL_ERROR", "detail": str(e)}
        )
