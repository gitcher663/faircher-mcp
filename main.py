from fastapi import FastAPI
from fastapi.responses import PlainTextResponse

app = FastAPI()

@app.get("/.well-known/openai-apps-challenge")
async def openai_apps_challenge():
    return PlainTextResponse(
        content="R8RPkntk796SA6rB3_JYV9QjO7LeEDF2VpGn5BVZ8pU",
        media_type="text/plain"
    )
