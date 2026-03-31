"""
MRAX Auth API — Telegram Login Widget verification + session management
"""
import json
import hashlib
import hmac
import os
import secrets
import psycopg2
from datetime import datetime, timedelta

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token, X-User-Id",
    }

def json_response(data, status=200):
    return {"statusCode": status, "headers": {**cors_headers(), "Content-Type": "application/json"}, "body": json.dumps(data, default=str)}

def error(msg, status=400):
    return json_response({"error": msg}, status)

def verify_telegram_auth(data: dict, bot_token: str) -> bool:
    """Verify Telegram Login Widget data"""
    check_hash = data.pop("hash", "")
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(data.items()))
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    expected = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    # Also check auth_date is not older than 1 day
    auth_date = int(data.get("auth_date", 0))
    if datetime.now().timestamp() - auth_date > 86400:
        return False
    return hmac.compare_digest(expected, check_hash)

def handler(event: dict, context) -> dict:
    """Telegram OAuth + session auth for MRAX"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    # GET /me — get current user by token
    if method == "GET" and "/me" in path:
        token = event.get("headers", {}).get("X-Auth-Token", "")
        if not token:
            return error("No token", 401)
        db = get_db()
        cur = db.cursor()
        cur.execute(
            f"SELECT u.id, u.tg_id, u.first_name, u.last_name, u.username, u.photo_url, u.bio, u.is_premium, u.premium_until, u.stars_balance "
            f"FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
            f"WHERE s.token = %s AND s.expires_at > NOW()",
            (token,)
        )
        row = cur.fetchone()
        db.close()
        if not row:
            return error("Invalid or expired token", 401)
        return json_response({
            "id": row[0], "tg_id": row[1], "first_name": row[2],
            "last_name": row[3], "username": row[4], "photo_url": row[5],
            "bio": row[6], "is_premium": row[7], "premium_until": str(row[8]) if row[8] else None,
            "stars_balance": row[9]
        })

    # POST /telegram — verify Telegram Login Widget
    if method == "POST" and "/telegram" in path:
        bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
        if not bot_token:
            # Demo mode — accept any telegram data without verification
            body = json.loads(event.get("body") or "{}")
            tg_data = body.get("tg_data", {})
        else:
            body = json.loads(event.get("body") or "{}")
            tg_data = body.get("tg_data", {})
            tg_copy = dict(tg_data)
            if not verify_telegram_auth(tg_copy, bot_token):
                return error("Invalid Telegram auth data", 401)

        tg_id = int(tg_data.get("id", 0))
        first_name = tg_data.get("first_name", "User")
        last_name = tg_data.get("last_name", "")
        username = tg_data.get("username", "")
        photo_url = tg_data.get("photo_url", "")

        db = get_db()
        cur = db.cursor()

        # Upsert user
        cur.execute(
            f"""INSERT INTO {SCHEMA}.users (tg_id, first_name, last_name, username, photo_url)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (tg_id) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                username = EXCLUDED.username,
                photo_url = EXCLUDED.photo_url,
                is_online = TRUE,
                last_seen = NOW()
            RETURNING id, tg_id, first_name, last_name, username, photo_url, bio, is_premium, premium_until, stars_balance""",
            (tg_id, first_name, last_name, username, photo_url)
        )
        user = cur.fetchone()
        user_id = user[0]

        # Create session
        token = secrets.token_urlsafe(48)
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
            (user_id, token)
        )
        db.commit()
        db.close()

        return json_response({
            "token": token,
            "user": {
                "id": user[0], "tg_id": user[1], "first_name": user[2],
                "last_name": user[3], "username": user[4], "photo_url": user[5],
                "bio": user[6], "is_premium": user[7],
                "premium_until": str(user[8]) if user[8] else None,
                "stars_balance": user[9]
            }
        })

    # POST /demo — demo login (no real telegram needed)
    if method == "POST" and "/demo" in path:
        body = json.loads(event.get("body") or "{}")
        first_name = body.get("first_name", "Демо Пользователь")
        username = body.get("username", "demo_user")
        tg_id = body.get("tg_id", 999999999)

        db = get_db()
        cur = db.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.users (tg_id, first_name, username, stars_balance)
            VALUES (%s, %s, %s, 100)
            ON CONFLICT (tg_id) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                username = EXCLUDED.username,
                is_online = TRUE,
                last_seen = NOW()
            RETURNING id, tg_id, first_name, last_name, username, photo_url, bio, is_premium, premium_until, stars_balance""",
            (tg_id, first_name, username)
        )
        user = cur.fetchone()
        user_id = user[0]
        token = secrets.token_urlsafe(48)
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, token))
        db.commit()
        db.close()

        return json_response({
            "token": token,
            "user": {
                "id": user[0], "tg_id": user[1], "first_name": user[2],
                "last_name": user[3], "username": user[4], "photo_url": user[5],
                "bio": user[6], "is_premium": user[7],
                "premium_until": str(user[8]) if user[8] else None,
                "stars_balance": user[9]
            }
        })

    # POST /logout
    if method == "POST" and "/logout" in path:
        token = event.get("headers", {}).get("X-Auth-Token", "")
        if token:
            db = get_db()
            cur = db.cursor()
            cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
            db.commit()
            db.close()
        return json_response({"ok": True})

    return error("Not found", 404)
