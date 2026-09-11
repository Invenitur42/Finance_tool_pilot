from app.db.session import engine, SessionLocal, Base
from app.models import User, Account, Category, Transaction, Budget  # noqa: F401
from app.models.finance import Category as CategoryModel

DEFAULT_CATEGORIES = [
    ("Salary", "income"),
    ("Freelance", "income"),
    ("Food & Dining", "expense"),
    ("Transport", "expense"),
    ("Rent", "expense"),
    ("Utilities", "expense"),
    ("Shopping", "expense"),
    ("Entertainment", "expense"),
    ("Health", "expense"),
    ("Other", "expense"),
]


def init_db() -> None:
    Base.metadata.create_all(bind=engine)

    # Seed system categories if empty
    db = SessionLocal()
    try:
        if db.query(CategoryModel).filter(CategoryModel.owner_id.is_(None)).count() == 0:
            for name, kind in DEFAULT_CATEGORIES:
                db.add(CategoryModel(name=name, kind=kind, owner_id=None))
            db.commit()
            print("Seeded default categories.")
    finally:
        db.close()

    print("Database tables created.")


if __name__ == "__main__":
    init_db()
