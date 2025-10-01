import React, { useEffect, useState } from "react";
import axios from "axios";

interface Transaction {
  id: number;
  title: string;
  amount: number | string;
  type: "income" | "expense";
  date: string;
  category?: { name: string };
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [newTransaction, setNewTransaction] = useState({
    category_name: "",
    title: "",
    amount: "",
    type: "expense" as "income" | "expense",
    date: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Veuillez vous connecter pour voir vos transactions.");
      return;
    }
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(
        "https://moneywise-api-backend.onrender.com/api/transactions",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data.transactions ? res.data.transactions : res.data;
      setTransactions(data || []);
    } catch (err) {
      setError("Impossible de charger les transactions.");
    }
  };

  const totalBudget = transactions.reduce((acc, t) => {
    const amt = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount;
    return t.type === "income" ? acc + amt : acc - amt;
  }, 0);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://moneywise-api-backend.onrender.com/api/transactions",
        {
          ...newTransaction,
          amount: parseFloat(newTransaction.amount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTransaction({ category_name: "", title: "", amount: "", type: "expense", date: "" });
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      setError("Impossible de créer la transaction.");
      console.error(err);
    }
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    try {
      await axios.put(
        `https://moneywise-api-backend.onrender.com/api/transactions/${editingTransaction.id}`,
        {
          title: editingTransaction.title,
          amount: parseFloat(editingTransaction.amount as any),
          type: editingTransaction.type,
          date: editingTransaction.date,
          category_name: editingTransaction.category?.name || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      fetchTransactions();
    } catch (err) {
      setError("Impossible de mettre à jour la transaction.");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette transaction ?")) return;
    try {
      await axios.delete(
        `https://moneywise-api-backend.onrender.com/api/transactions/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTransactions();
    } catch (err) {
      setError("Impossible de supprimer la transaction.");
    }
  };

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="card bg-gray-800 px-6 py-3 rounded-xl font-semibold">
          Budget total : <span className="text-emerald-400">{totalBudget.toFixed(2)} Fca</span>
        </div>
      </div>

      {/* Bouton ajouter */}
      <button className="btn btn-primary mb-6" onClick={() => setShowModal(true)}>
        ➕ Ajouter une transaction
      </button>

      {/* Liste des transactions */}
      {/* Liste des transactions */}
        <div className="card bg-gray-800 shadow p-6 rounded-xl">
          <h2 className="text-lg font-bold mb-4">Liste des transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-400">Aucune transaction trouvée.</p>
          ) : (
            <div className="overflow-y-auto max-h-[400px]">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Montant</th>
                    <th>Catégorie</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.title}</td>
                      <td>{typeof t.amount === "string" ? parseFloat(t.amount) : t.amount} Fca</td>
                      <td>{t.category?.name || "N/A"}</td>
                      <td className={t.type === "income" ? "text-green-400" : "text-red-400"}>
                        {t.type === "income" ? "Entrée" : "Sortie"}
                      </td>
                      <td>{t.date}</td>
                      <td>
                        <button
                          className="btn btn-xs btn-warning mr-2"
                          onClick={() => { setEditingTransaction(t); setShowEditModal(true); }}
                        >
                          Modifier
                        </button>
                        <button className="btn btn-xs btn-error" onClick={() => handleDelete(t.id)}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Modal création */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-lg font-bold mb-4">Nouvelle transaction</h2>
            <form onSubmit={handleCreateTransaction} className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Catégorie"
                className="input input-bordered"
                value={newTransaction.category_name}
                onChange={(e) => setNewTransaction({ ...newTransaction, category_name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Titre"
                className="input input-bordered"
                value={newTransaction.title}
                onChange={(e) => setNewTransaction({ ...newTransaction, title: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Montant"
                className="input input-bordered"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                required
              />
              <select
                className="select select-bordered"
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as "income" | "expense" })}
                required
              >
                <option value="income">Entrée</option>
                <option value="expense">Sortie</option>
              </select>
              <input
                type="date"
                className="input input-bordered"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                required
              />
              <button type="submit" className="btn btn-primary">Ajouter</button>
            </form>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal édition */}
      {showEditModal && editingTransaction && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-lg font-bold mb-4">Modifier la transaction</h2>
            <form onSubmit={handleUpdateTransaction} className="grid gap-3">
              <input
                type="text"
                placeholder="Catégorie"
                className="input input-bordered"
                value={editingTransaction.category?.name || ""}
                onChange={(e) =>
                  setEditingTransaction({ ...editingTransaction, category: { ...editingTransaction.category, name: e.target.value } })
                }
                required
              />
              <input
                type="text"
                className="input input-bordered"
                value={editingTransaction.title}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, title: e.target.value })}
                required
              />
              <input
                type="number"
                className="input input-bordered"
                value={editingTransaction.amount}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: e.target.value })}
                required
              />
              <select
                className="select select-bordered"
                value={editingTransaction.type}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, type: e.target.value as "income" | "expense" })}
                required
              >
                <option value="income">Entrée</option>
                <option value="expense">Sortie</option>
              </select>
              <input
                type="date"
                className="input input-bordered"
                value={editingTransaction.date}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                required
              />
              <button type="submit" className="btn btn-warning">Mettre à jour</button>
            </form>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowEditModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
