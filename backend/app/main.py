from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, features, stats, admin, chat

app = FastAPI(title="LanXpert API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_v1_prefix = "/api/v1"

app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(users.router, prefix=api_v1_prefix)
app.include_router(features.router_words, prefix=api_v1_prefix)
app.include_router(features.router_questions, prefix=api_v1_prefix)
app.include_router(features.router_answers, prefix=api_v1_prefix)
app.include_router(features.router_articles, prefix=api_v1_prefix)
app.include_router(features.router_notifications, prefix=api_v1_prefix)
app.include_router(features.router_features, prefix=api_v1_prefix)
app.include_router(stats.router_stats, prefix=api_v1_prefix)
app.include_router(chat.router, prefix=api_v1_prefix) # Added Chat
app.include_router(admin.router, prefix=api_v1_prefix)

@app.get("/")
def read_root():
    return {"message": "Welcome to LanXpert API"}
