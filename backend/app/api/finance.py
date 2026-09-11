from datetime import date, datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.finance import Account, Category, Transaction, Budget

router = APIRouter(tags=["finance"])


# ---------- Schemas ----------
class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    account_type: str = "checking"
    currency: str = "USD"
    balance: Decimal = Decimal("0.00")


class AccountOut(BaseModel):
    id: int
    name: str
    account_type: str
    currency: str
    balance: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    account_id: int
    amount: Decimal = Field(gt=0)
    kind: str  # income | expense
    category_id: int | None = None
    description: str | None = None
    occurred_on: date


class TransactionOut(BaseModel):
    id: int
    account_id: int
    category_id: int | None
    amount: Decimal
    kind: str
    description: str | None
    occurred_on: date
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryOut(BaseModel):
    id: int
    name: str
    kind: str

    class Config:
        from_attributes = True


class BudgetCreate(BaseModel):
    category_id: int
    year: int
    month: int = Field(ge=1, le=12)
    amount: Decimal = Field(gt=0)


class BudgetOut(BaseModel):
    id: int
    category_id: int
    year: int
    month: int
    amount: Decimal

    class Config:
        from_attributes = True


# ---------- Accounts ----------
@router.get("/accounts/", response_model=list[AccountOut])
def list_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Account).filter(Account.owner_id == current_user.id).all()


@router.post("/accounts/", response_model=AccountOut, status_code=status.HTTP_201_CREATED)
def create_account(
    body: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    acc = Account(
        owner_id=current_user.id,
        name=body.name,
        account_type=body.account_type,
        currency=body.currency,
        balance=body.balance,
    )
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc


# ---------- Categories ----------
@router.get("/categories/", response_model=list[CategoryOut])
def list_categories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # System (owner_id null) + user categories
    return (
        db.query(Category)
        .filter((Category.owner_id == None) | (Category.owner_id == current_user.id))
        .order_by(Category.kind, Category.name)
        .all()
    )


# ---------- Transactions ----------
@router.get("/transactions/", response_model=list[TransactionOut])
def list_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, le=200),
):
    return (
        db.query(Transaction)
        .join(Account)
        .filter(Account.owner_id == current_user.id)
        .order_by(Transaction.occurred_on.desc(), Transaction.id.desc())
        .limit(limit)
        .all()
    )


@router.post("/transactions/", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    body: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.kind not in ("income", "expense"):
        raise HTTPException(status_code=400, detail="kind must be income or expense")

    account = db.get(Account, body.account_id)
    if not account or account.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Account not found")

    tx = Transaction(
        account_id=body.account_id,
        category_id=body.category_id,
        amount=body.amount,
        kind=body.kind,
        description=body.description,
        occurred_on=body.occurred_on,
    )
    db.add(tx)

    # Update account balance
    if body.kind == "income":
        account.balance = account.balance + body.amount
    else:
        account.balance = account.balance - body.amount

    db.commit()
    db.refresh(tx)
    return tx


# ---------- Budgets ----------
@router.get("/budgets/", response_model=list[BudgetOut])
def list_budgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    year: int | None = None,
    month: int | None = None,
):
    q = db.query(Budget).filter(Budget.owner_id == current_user.id)
    if year:
        q = q.filter(Budget.year == year)
    if month:
        q = q.filter(Budget.month == month)
    return q.all()


@router.post("/budgets/", response_model=BudgetOut, status_code=status.HTTP_201_CREATED)
def create_budget(
    body: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = Budget(
        owner_id=current_user.id,
        category_id=body.category_id,
        year=body.year,
        month=body.month,
        amount=body.amount,
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


# ---------- Summary ----------
@router.get("/reports/summary")
def summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = db.query(Account).filter(Account.owner_id == current_user.id).all()
    total_balance = sum((a.balance for a in accounts), Decimal("0.00"))

    # This month income / expense
    today = date.today()
    month_start = today.replace(day=1)

    income = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .join(Account)
        .filter(
            Account.owner_id == current_user.id,
            Transaction.kind == "income",
            Transaction.occurred_on >= month_start,
        )
        .scalar()
    )
    expense = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .join(Account)
        .filter(
            Account.owner_id == current_user.id,
            Transaction.kind == "expense",
            Transaction.occurred_on >= month_start,
        )
        .scalar()
    )

    return {
        "total_balance": float(total_balance),
        "month_income": float(income or 0),
        "month_expense": float(expense or 0),
        "accounts_count": len(accounts),
    }
