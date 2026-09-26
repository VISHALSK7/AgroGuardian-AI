"""
AgroGuardian AI — MongoDB Connection Layer (Improved)
"""

from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from config import get_config
from utils.logger import get_logger

log = get_logger("db")

_client = None
_db = None


# ══════════════════════════════════════════════════════════════════════
# DATABASE CONNECTION
# ══════════════════════════════════════════════════════════════════════

def get_db():
    """Get MongoDB database instance (safe singleton)."""
    global _client, _db

    if _db is not None:
        return _db

    cfg = get_config()

    try:
        _client = MongoClient(
            cfg.MONGO_URI,
            serverSelectionTimeoutMS=5000
        )

        # 🔥 Force connection check (IMPORTANT)
        _client.server_info()

        db_name = cfg.MONGO_URI.rsplit("/", 1)[-1].split("?")[0]
        if not db_name:
            db_name = "agroguardian"

        _db = _client[db_name]

        log.info("✅ MongoDB connected successfully")

    except ServerSelectionTimeoutError:
        log.error("❌ MongoDB connection failed (timeout)")
        raise Exception("Database connection failed")

    except Exception as e:
        log.error(f"❌ MongoDB error: {e}")
        raise

    return _db


# ══════════════════════════════════════════════════════════════════════
# COLLECTIONS
# ══════════════════════════════════════════════════════════════════════

def users_col():
    return get_db()["users"]

def farmer_profiles_col():
    return get_db()["farmer_profiles"]

def disease_predictions_col():
    return get_db()["disease_predictions"]

def pest_predictions_col():
    return get_db()["pest_predictions"]

def yield_predictions_col():
    return get_db()["yield_predictions"]

def weather_data_col():
    return get_db()["weather_data"]

def government_schemes_col():
    return get_db()["government_schemes"]

def support_tickets_col():
    return get_db()["support_tickets"]

def chat_history_col():
    return get_db()["chat_history"]


# ══════════════════════════════════════════════════════════════════════
# INDEXES
# ══════════════════════════════════════════════════════════════════════

def init_indexes():
    """Create indexes safely (no destructive drops)."""

    try:
        # 🔥 DO NOT drop indexes (you were doing this ❌)
        users_col().create_index("email", unique=True, sparse=True)

        disease_predictions_col().create_index("user_id")
        disease_predictions_col().create_index("created_at")

        pest_predictions_col().create_index("user_id")
        yield_predictions_col().create_index("user_id")

        government_schemes_col().create_index("state")

        chat_history_col().create_index("user_id")
        chat_history_col().create_index("session_id")
        chat_history_col().create_index("created_at")

        log.info("✅ Indexes initialized")

    except Exception as e:
        log.warning(f"⚠️ Index creation skipped: {e}")