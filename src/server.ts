import asyncio
from aiohttp import web

# -----------------------------
# MCP MANIFEST
# -----------------------------
MCP_MANIFEST = {
    "name": "FairCher MCP",
    "description": "MCP server for the FairCher ChatGPT app",
    "version": "1.0.0",
    "protocolVersion": "2024-11-05",
    "transport": {
        "type": "sse",
        "endpoint": "/sse"
    },
    "tools": []
}

# -----------------------------
# ROUTES
# -----------------------------

async def mcp_manifest(request: web.Request):
    return web.json_response(MCP_MANIFEST)

async def health(request: web.Request):
    return web.json_response({"status": "ok"})

async def sse(request: web.Request):
    response = web.StreamResponse(
        status=200,
        headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )

    await response.prepare(request)

    # MCP-ready event
    await response.write(
        b"event: ready\n"
        b"data: {\"status\":\"connected\"}\n\n"
    )

    try:
        while True:
            await asyncio.sleep(15)
            await response.write(
                b"event: ping\n"
                b"data: {}\n\n"
            )
    except asyncio.CancelledError:
        pass

    return response

# -----------------------------
# APP SETUP
# -----------------------------

app = web.Application()

# MCP discovery (MANDATORY)
app.router.add_get("/.well-known/mcp.json", mcp_manifest)

# Transport + ops
app.router.add_get("/sse", sse)
app.router.add_get("/health", health)

# -----------------------------
# BOOT
# -----------------------------
if __name__ == "__main__":
    web.run_app(
        app,
        host="0.0.0.0",  # REQUIRED for Railway public + private networking
        port=8080
    )
