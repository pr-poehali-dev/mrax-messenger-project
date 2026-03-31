"""Stars, Gifts & Premium API for MRAX"""
import json, os, psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
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
    """Stars, gifts and premium management for MRAX"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    user_id = get_user_id(event)
    if not user_id:
        return err("Unauthorized", 401)

    db = get_db()
    cur = db.cursor()

    try:
        # GET /gifts — catalog
        if method == "GET" and path.endswith("/gifts"):
            cur.execute(f"""
                SELECT id, name, emoji, description, price_stars, rarity, is_limited, total_supply, sold_count
                FROM {SCHEMA}.gifts ORDER BY price_stars ASC
            """)
            rows = cur.fetchall()
            gifts = [{"id": r[0], "name": r[1], "emoji": r[2], "description": r[3],
                      "price_stars": r[4], "rarity": r[5], "is_limited": r[6],
                      "total_supply": r[7], "sold_count": r[8],
                      "available": (r[7] - r[8]) if r[6] and r[7] else None} for r in rows]
            return ok({"gifts": gifts})

        # GET /my-gifts — received gifts
        if method == "GET" and "/my-gifts" in path:
            cur.execute(f"""
                SELECT sg.id, g.name, g.emoji, g.rarity, g.price_stars,
                       u.first_name, u.username, sg.is_opened, sg.serial_number, sg.created_at
                FROM {SCHEMA}.sent_gifts sg
                JOIN {SCHEMA}.gifts g ON g.id = sg.gift_id
                JOIN {SCHEMA}.users u ON u.id = sg.from_user_id
                WHERE sg.to_user_id = %s
                ORDER BY sg.created_at DESC
            """, (user_id,))
            rows = cur.fetchall()
            gifts = [{"id": r[0], "name": r[1], "emoji": r[2], "rarity": r[3], "price_stars": r[4],
                      "from_name": r[5], "from_username": r[6], "is_opened": r[7],
                      "serial_number": r[8], "created_at": r[9]} for r in rows]
            return ok({"gifts": gifts})

        # POST /send-gift
        if method == "POST" and "/send-gift" in path:
            body = json.loads(event.get("body") or "{}")
            gift_id = body.get("gift_id")
            to_user_id = body.get("to_user_id")
            if not gift_id or not to_user_id:
                return err("gift_id and to_user_id required")

            # Get gift price
            cur.execute(f"SELECT price_stars, is_limited, total_supply, sold_count FROM {SCHEMA}.gifts WHERE id = %s", (gift_id,))
            gift = cur.fetchone()
            if not gift:
                return err("Gift not found", 404)
            price, is_limited, total_supply, sold_count = gift

            # Check limited supply
            if is_limited and total_supply and sold_count >= total_supply:
                return err("Gift is sold out", 400)

            # Check balance
            cur.execute(f"SELECT stars_balance FROM {SCHEMA}.users WHERE id = %s", (user_id,))
            balance = cur.fetchone()[0]
            if balance < price:
                return err(f"Insufficient stars. Need {price}, have {balance}", 400)

            # Deduct stars
            cur.execute(f"UPDATE {SCHEMA}.users SET stars_balance = stars_balance - %s WHERE id = %s", (price, user_id))
            # Add stars record
            cur.execute(f"""INSERT INTO {SCHEMA}.stars_transactions (from_user_id, to_user_id, amount, type, description)
                VALUES (%s, %s, %s, 'gift_send', 'Отправка подарка')""", (user_id, to_user_id, price))
            # Create sent gift
            serial = sold_count + 1 if is_limited else None
            cur.execute(f"""
                INSERT INTO {SCHEMA}.sent_gifts (gift_id, from_user_id, to_user_id, serial_number)
                VALUES (%s, %s, %s, %s) RETURNING id
            """, (gift_id, user_id, to_user_id, serial))
            sent_id = cur.fetchone()[0]
            if is_limited:
                cur.execute(f"UPDATE {SCHEMA}.gifts SET sold_count = sold_count + 1 WHERE id = %s", (gift_id,))
            db.commit()
            return ok({"ok": True, "sent_id": sent_id, "stars_spent": price})

        # POST /buy-stars — demo top-up
        if method == "POST" and "/buy-stars" in path:
            body = json.loads(event.get("body") or "{}")
            amount = int(body.get("amount", 100))
            if amount < 1 or amount > 10000:
                return err("Invalid amount")
            cur.execute(f"UPDATE {SCHEMA}.users SET stars_balance = stars_balance + %s WHERE id = %s RETURNING stars_balance", (amount, user_id))
            new_balance = cur.fetchone()[0]
            cur.execute(f"""INSERT INTO {SCHEMA}.stars_transactions (from_user_id, amount, type, description)
                VALUES (%s, %s, 'purchase', %s)""", (user_id, amount, f"Покупка {amount} звёзд"))
            db.commit()
            return ok({"ok": True, "stars_added": amount, "new_balance": new_balance})

        # GET /premium-plans
        if method == "GET" and "/premium-plans" in path:
            cur.execute(f"SELECT id, name, duration_months, price_stars, price_rub, features FROM {SCHEMA}.premium_plans WHERE is_active = TRUE ORDER BY price_stars")
            rows = cur.fetchall()
            plans = [{"id": r[0], "name": r[1], "duration_months": r[2], "price_stars": r[3],
                      "price_rub": r[4], "features": r[5]} for r in rows]
            return ok({"plans": plans})

        # POST /buy-premium
        if method == "POST" and "/buy-premium" in path:
            body = json.loads(event.get("body") or "{}")
            plan_id = body.get("plan_id")
            if not plan_id:
                return err("plan_id required")

            cur.execute(f"SELECT price_stars, duration_months FROM {SCHEMA}.premium_plans WHERE id = %s AND is_active = TRUE", (plan_id,))
            plan = cur.fetchone()
            if not plan:
                return err("Plan not found", 404)
            price, months = plan

            cur.execute(f"SELECT stars_balance, premium_until FROM {SCHEMA}.users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            if user[0] < price:
                return err(f"Insufficient stars. Need {price}, have {user[0]}", 400)

            # Calculate expiry
            from datetime import timedelta
            now = __import__("datetime").datetime.now()
            current_until = user[1] if user[1] and user[1] > now else now
            valid_until = current_until + timedelta(days=months * 30)

            cur.execute(f"""UPDATE {SCHEMA}.users SET
                stars_balance = stars_balance - %s,
                is_premium = TRUE,
                premium_until = %s
                WHERE id = %s""", (price, valid_until, user_id))
            cur.execute(f"""INSERT INTO {SCHEMA}.premium_transactions (user_id, plan_id, stars_spent, valid_until)
                VALUES (%s, %s, %s, %s)""", (user_id, plan_id, price, valid_until))
            cur.execute(f"""INSERT INTO {SCHEMA}.stars_transactions (from_user_id, amount, type, description)
                VALUES (%s, %s, 'premium_payment', 'Покупка MRAX Premium')""", (user_id, price))
            db.commit()
            return ok({"ok": True, "premium_until": str(valid_until)})

        # GET /balance
        if method == "GET" and "/balance" in path:
            cur.execute(f"SELECT stars_balance, is_premium, premium_until FROM {SCHEMA}.users WHERE id = %s", (user_id,))
            row = cur.fetchone()
            cur.execute(f"""SELECT type, amount, description, created_at FROM {SCHEMA}.stars_transactions
                WHERE from_user_id = %s OR to_user_id = %s ORDER BY created_at DESC LIMIT 20""", (user_id, user_id))
            txs = cur.fetchall()
            return ok({
                "stars_balance": row[0], "is_premium": row[1], "premium_until": str(row[2]) if row[2] else None,
                "history": [{"type": t[0], "amount": t[1], "description": t[2], "created_at": t[3]} for t in txs]
            })

    finally:
        db.close()

    return err("Not found", 404)