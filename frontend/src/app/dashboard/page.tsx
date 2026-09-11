"use client";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getMe,
  getSummary,
  listAccounts,
  listTransactions,
  listCategories,
  createAccount,
  createTransaction,
  clearToken,
  type Account,
  type Transaction,
  type Category,
  type Summary,
} from "@/lib/api";

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New account form
  const [accName, setAccName] = useState("");
  // New tx form
  const [txAccount, setTxAccount] = useState<number | "">("");
  const [txAmount, setTxAmount] = useState("");
  const [txKind, setTxKind] = useState("expense");
  const [txCategory, setTxCategory] = useState<number | "">("");
  const [txDesc, setTxDesc] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));

  async function refresh() {
    const [s, a, t, c] = await Promise.all([
      getSummary(),
      listAccounts(),
      listTransactions(),
      listCategories(),
    ]);
    setSummary(s);
    setAccounts(a);
    setTxs(t);
    setCategories(c);
    if (a.length && txAccount === "") setTxAccount(a[0].id);
  }

  useEffect(() => {
    getMe()
      .then(refresh)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function onCreateAccount(e: FormEvent) {
    e.preventDefault();
    if (!accName.trim()) return;
    setError("");
    try {
      await createAccount({ name: accName.trim() });
      setAccName("");
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function onCreateTx(e: FormEvent) {
    e.preventDefault();
    if (!txAccount || !txAmount) return;
    setError("");
    try {
      await createTransaction({
        account_id: Number(txAccount),
        amount: Number(txAmount),
        kind: txKind,
        category_id: txCategory ? Number(txCategory) : undefined,
        description: txDesc || undefined,
        occurred_on: txDate,
      });
      setTxAmount("");
      setTxDesc("");
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  function logout() {
    clearToken();
    router.push("/login");
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading...</div>;
  }

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">Finance Manager</h1>
          <button onClick={logout} className="text-sm text-slate-600 hover:text-slate-900">Log out</button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        {/* Summary cards */}
        {summary && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-400">Total balance</p>
              <p className="mt-1 text-2xl font-bold">{money(summary.total_balance)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-400">This month income</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{money(summary.month_income)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-400">This month expenses</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{money(summary.month_expense)}</p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Accounts */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Accounts</h2>
            <ul className="mb-4 space-y-2">
              {accounts.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span>
                    {a.name}{" "}
                    <span className="text-xs text-slate-400">({a.account_type})</span>
                  </span>
                  <span className="font-medium">{money(Number(a.balance))}</span>
                </li>
              ))}
              {accounts.length === 0 && <li className="text-sm text-slate-400">No accounts yet</li>}
            </ul>
            <form onSubmit={onCreateAccount} className="flex gap-2">
              <input
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                placeholder="Account name"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white">
                Add
              </button>
            </form>
          </section>

          {/* Add transaction */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Add transaction</h2>
            <form onSubmit={onCreateTx} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={txAccount}
                  onChange={(e) => setTxAccount(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <select
                  value={txKind}
                  onChange={(e) => setTxKind(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                placeholder="Amount"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value ? Number(e.target.value) : "")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">No category</option>
                {categories
                  .filter((c) => c.kind === txKind)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
              <input
                value={txDesc}
                onChange={(e) => setTxDesc(e.target.value)}
                placeholder="Description"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={!accounts.length}
                className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Save transaction
              </button>
            </form>
          </section>
        </div>

        {/* Recent transactions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Recent transactions</h2>
          {txs.length === 0 ? (
            <p className="text-sm text-slate-400">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Description</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {txs.map((t) => (
                    <tr key={t.id}>
                      <td className="py-2.5 text-slate-500">{t.occurred_on}</td>
                      <td className="py-2.5">{t.description || "—"}</td>
                      <td className="py-2.5 text-slate-500">
                        {t.category_id ? catMap[t.category_id] || "—" : "—"}
                      </td>
                      <td
                        className={`py-2.5 text-right font-medium ${
                          t.kind === "income" ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {t.kind === "income" ? "+" : "-"}
                        {money(Number(t.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
