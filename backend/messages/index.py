"""
MRAX Messages API — chats, messages, real-time polling
"""
import json
import os
import psycopg2
from datetime import datetime

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token, X-User-Id",
    }

def ok(data):
    return {"statusCode": 200, "headers": {**cors(), "Content-Type": "application/json"}, "body": json.dumps(data, default=str)}

def err(msg, status=400):
    return {"statusCode": status, "headers": cors(), "body": json.dumps({"error": msg})}

def get_user_id(event):
    token = event.get("headers", {}).get("X-Auth-Token", "")
    if not token:
        return None
    db = get_db()
    cur = db.cursor()
    cur.execute(f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s AND expires_at > NOW()", (token,))
    row = cur.fetchone()
    db.close()
    return row[0] if row else None

def handler(event: dict, context) -> dict:
    """Messages and chats API for MRAX messenger"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    params = event.get("queryStringParameters") or {}

    user_id = get_user_id(event)
    if not user_id:
        return err("Unauthorized", 401)

    db = get_db()
    cur = db.cursor()

    try:
        # GET /chats — list user chats with last message
        if method == "GET" and path.endswith("/chats"):
            cur.execute(f"""
                SELECT c.id, c.type, c.name, c.avatar_url, c.members_count, c.is_verified,
                       u.first_name || COALESCE(' ' || u.last_name, '') AS contact_name,
                       u.username AS contact_username, u.photo_url AS contact_photo,
                       u.is_online, u.is_premium,
                       m.text AS last_msg, m.created_at AS last_time,
                       (SELECT COUNT(*) FROM {SCHEMA}.messages msg
                        WHERE msg.chat_id = c.id
                        AND msg.user_id != %s
                        AND msg.id NOT IN (SELECT message_id FROM {SCHEMA}.message_reads WHERE user_id = %s)) AS unread
                FROM {SCHEMA}.chat_members cm
                JOIN {SCHEMA}.chats c ON c.id = cm.chat_id
                LEFT JOIN {SCHEMA}.chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id != %s AND c.type = 'personal'
                LEFT JOIN {SCHEMA}.users u ON u.id = cm2.user_id
                LEFT JOIN LATERAL (
                    SELECT text, created_at FROM {SCHEMA}.messages
                    WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1
                ) m ON TRUE
                WHERE cm.user_id = %s
                ORDER BY COALESCE(m.created_at, c.created_at) DESC
            """, (user_id, user_id, user_id, user_id))
            rows = cur.fetchall()
            chats = []
            for r in rows:
                chats.append({
                    "id": r[0], "type": r[1], "name": r[5] or r[2] or "Групповой чат",
                    "avatar_url": r[7] or r[3], "members_count": r[4], "is_verified": r[5],
                    "username": r[7], "photo_url": r[8], "is_online": r[9], "is_premium": r[10],
                    "last_msg": r[11] or "", "last_time": r[12], "unread": int(r[13] or 0)
                })
            return ok({"chats": chats})

        # GET /messages?chat_id=X&after_id=Y
        if method == "GET" and path.endswith("/messages"):
            chat_id = params.get("chat_id")
            after_id = params.get("after_id", "0")
            if not chat_id:
                return err("chat_id required")

            # Check membership
            cur.execute(f"SELECT 1 FROM {SCHEMA}.chat_members WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
            if not cur.fetchone():
                return err("Not a member", 403)

            cur.execute(f"""
                SELECT m.id, m.chat_id, m.user_id, m.text, m.type,
                       m.reply_to_id, m.is_pinned, m.is_edited, m.is_forwarded,
                       m.metadata, m.created_at,
                       u.first_name, u.username, u.photo_url, u.is_premium,
                       EXISTS(SELECT 1 FROM {SCHEMA}.message_reads WHERE message_id = m.id AND user_id = %s) AS is_read
                FROM {SCHEMA}.messages m
                JOIN {SCHEMA}.users u ON u.id = m.user_id
                WHERE m.chat_id = %s AND m.id > %s
                ORDER BY m.created_at ASC
                LIMIT 100
            """, (user_id, chat_id, after_id))
            rows = cur.fetchall()

            # Mark as read
            for r in rows:
                if r[2] != user_id and not r[15]:
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.message_reads (message_id, user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                        (r[0], user_id)
                    )
            db.commit()

            messages = []
            for r in rows:
                messages.append({
                    "id": r[0], "chat_id": r[1], "user_id": r[2], "text": r[3],
                    "type": r[4], "reply_to_id": r[5], "is_pinned": r[6],
                    "is_edited": r[7], "is_forwarded": r[8], "metadata": r[9],
                    "created_at": r[10], "from_name": r[11], "from_username": r[12],
                    "from_photo": r[13], "from_premium": r[14], "is_read": r[15],
                    "from": "me" if r[2] == user_id else "them"
                })
            return ok({"messages": messages})

        # POST /messages — send message
        if method == "POST" and path.endswith("/messages"):
            body = json.loads(event.get("body") or "{}")
            chat_id = body.get("chat_id")
            text = body.get("text", "").strip()
            msg_type = body.get("type", "text")
            reply_to_id = body.get("reply_to_id")
            metadata = body.get("metadata", {})

            if not chat_id or not text:
                return err("chat_id and text required")

            cur.execute(f"SELECT 1 FROM {SCHEMA}.chat_members WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
            if not cur.fetchone():
                return err("Not a member", 403)

            cur.execute(f"""
                INSERT INTO {SCHEMA}.messages (chat_id, user_id, text, type, reply_to_id, metadata)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, chat_id, user_id, text, type, created_at
            """, (chat_id, user_id, text, msg_type, reply_to_id, json.dumps(metadata)))
            msg = cur.fetchone()
            db.commit()

            return ok({
                "id": msg[0], "chat_id": msg[1], "user_id": msg[2],
                "text": msg[3], "type": msg[4], "created_at": msg[5],
                "from": "me"
            })

        # POST /chats — create or get personal chat
        if method == "POST" and path.endswith("/chats"):
            body = json.loads(event.get("body") or "{}")
            other_user_id = body.get("user_id")
            chat_type = body.get("type", "personal")
            name = body.get("name", "")

            if chat_type == "personal" and other_user_id:
                # Check existing chat
                cur.execute(f"""
                    SELECT c.id FROM {SCHEMA}.chats c
                    JOIN {SCHEMA}.chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = %s
                    JOIN {SCHEMA}.chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = %s
                    WHERE c.type = 'personal'
                    LIMIT 1
                """, (user_id, other_user_id))
                existing = cur.fetchone()
                if existing:
                    return ok({"chat_id": existing[0], "created": False})

            cur.execute(f"""
                INSERT INTO {SCHEMA}.chats (type, name, owner_id, members_count)
                VALUES (%s, %s, %s, %s) RETURNING id
            """, (chat_type, name, user_id, 2 if chat_type == "personal" else 1))
            chat_id = cur.fetchone()[0]

            cur.execute(f"INSERT INTO {SCHEMA}.chat_members (chat_id, user_id, role) VALUES (%s, %s, 'owner')", (chat_id, user_id))
            if other_user_id:
                cur.execute(f"INSERT INTO {SCHEMA}.chat_members (chat_id, user_id) VALUES (%s, %s)", (chat_id, other_user_id))
            db.commit()
            return ok({"chat_id": chat_id, "created": True})

        # GET /users/search?q=query
        if method == "GET" and "/users/search" in path:
            q = params.get("q", "").strip()
            if len(q) < 2:
                return ok({"users": []})
            cur.execute(f"""
                SELECT id, first_name, last_name, username, photo_url, is_premium, is_online
                FROM {SCHEMA}.users
                WHERE (username ILIKE %s OR first_name ILIKE %s OR last_name ILIKE %s)
                AND id != %s
                LIMIT 20
            """, (f"%{q}%", f"%{q}%", f"%{q}%", user_id))
            rows = cur.fetchall()
            users = [{"id": r[0], "first_name": r[1], "last_name": r[2], "username": r[3],
                      "photo_url": r[4], "is_premium": r[5], "is_online": r[6]} for r in rows]
            return ok({"users": users})

    finally:
        db.close()

    return err("Not found", 404)
