import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from "recharts";

interface TransactionStats {
  [key: string]: { income: number; expense: number };
}

interface Summary {
  total_income: number;
  total_expense: number;
  balance: number;
  budget: number;
}

export default function Statistics() {
  const [categoryStats, setCategoryStats] = useState<TransactionStats>({});
  const [monthlyStats, setMonthlyStats] = useState<TransactionStats>({});
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Veuillez vous connecter.");
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const [resCat, resMonth, resSum] = await Promise.all([
          axios.get("https://moneywise-api-backend.onrender.com/api/stats/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://moneywise-api-backend.onrender.com/api/stats/monthly", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://moneywise-api-backend.onrender.com/api/stats/summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCategoryStats(resCat.data.stats_by_category || {});
        setMonthlyStats(resMonth.data.stats_by_month || {});
        setSummary(resSum.data.summary || null);
      } catch (err) {
        console.error(err);
        setError("Impossible de récupérer les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const categoryData = Object.entries(categoryStats).map(([name, data]) => ({
    category: name,
    income: data.income,
    expense: data.expense,
  }));

  const monthlyData = Object.entries(monthlyStats).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense,
  }));

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white space-y-10">
      <h1 className="text-2xl font-bold">Statistiques MoneyWise</h1>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded shadow">
            <h2>Total Revenus</h2>
            <p className="text-green-400 font-bold">{summary.total_income} Fca</p>
          </div>
          <div className="bg-gray-800 p-4 rounded shadow">
            <h2>Total Dépenses</h2>
            <p className="text-red-400 font-bold">{summary.total_expense} Fca</p>
          </div>
          <div className="bg-gray-800 p-4 rounded shadow">
            <h2>Solde</h2>
            <p className="text-yellow-400 font-bold">{summary.balance} Fca</p>
          </div>
          <div className="bg-gray-800 p-4 rounded shadow">
            <h2>Budget</h2>
            <p className="text-blue-400 font-bold">{summary.budget} Fca</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Dépenses et Revenus par Catégorie</h2>
        {categoryData.length === 0 ? (
          <p>Aucune donnée à afficher.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" />
              <Bar dataKey="expense" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Revenus et Dépenses par Mois</h2>
        {monthlyData.length === 0 ? (
          <p>Aucune donnée à afficher.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#22c55e" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
