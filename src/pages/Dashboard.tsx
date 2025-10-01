import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FiHome, FiList, FiUser, FiBarChart2, FiLogOut, FiMenu } from "react-icons/fi";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: number;
  name: string;
  email: string;
  budget?: number;
}

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense" | string;
  date: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const token = localStorage.getItem("token");

  const typeColors: Record<string, string> = {
    income: "text-emerald-400 font-semibold",
    expense: "text-rose-400 font-semibold",
    other: "text-orange-400 font-semibold",
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }
    setUser({ ...storedUser, budget: storedUser.budget || 0 });
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(
        "https://moneywise-api-backend.onrender.com/api/transactions?limit=5",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data.transactions ? res.data.transactions : res.data;
      setTransactions(data || []);
      refreshBudget(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des transactions", err);
    }
  };

  // 🔹 Nouvelle fonction pour recalculer le budget
  const refreshBudget = (transactionsList?: Transaction[]) => {
    if (!user) return;
    const list = transactionsList || transactions;
    const newBudget = list.reduce((acc, t) => {
      return t.type === "income" ? acc + t.amount : acc - t.amount;
    }, 0);
    setUser({ ...user, budget: newBudget });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const sidebarVariants = {
    open: { width: 256, transition: { duration: 0.3 } },
    closed: { width: 64, transition: { duration: 0.3 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-white">
      {/* Sidebar */}
      <motion.div
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="bg-gray-900 flex flex-col justify-between fixed h-screen overflow-hidden"
      >
        <div className="p-4">
          <button
            className="mb-6 text-gray-300 hover:text-white text-xl transition-transform duration-300"
            onClick={toggleSidebar}
          >
            <motion.span
              animate={{ rotate: isSidebarOpen ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <FiMenu />
            </motion.span>
          </button>
          {isSidebarOpen && <h2 className="text-2xl font-bold mb-6">MoneyWise</h2>}

          <nav className="flex flex-col gap-3">
            <Link to="" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
              <FiHome size={20} /> {isSidebarOpen && "Dashboard"}
            </Link>
            <Link to="transactions" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
              <FiList size={20} /> {isSidebarOpen && "Transactions"}
            </Link>
            <Link to="profile" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
              <FiUser size={20} /> {isSidebarOpen && "Profil"}
            </Link>
            <Link to="statistics" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
              <FiBarChart2 size={20} /> {isSidebarOpen && "Statistiques"}
            </Link>
          </nav>
        </div>

        {/* Déconnexion en bas */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full bg-red-600 hover:bg-red-700 py-3 px-4 rounded-lg shadow-lg transition"
          >
            <FiLogOut size={18} /> {isSidebarOpen && "Déconnexion"}
          </button>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto relative">
        {/* Header fixe */}
        <div className="fixed top-4 left-0 right-0 px-8 z-50 flex items-center justify-between">
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-white tracking-wide">
            {user ? `Bienvenue, ${user.name}` : "Dashboard"}
          </h1>

          {/* Budget à droite */}
          <div className="ml-auto bg-gray-800 bg-opacity-70 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg font-semibold text-white border border-gray-700">
            Budget : {user?.budget?.toFixed(2) ?? 0} Fca
          </div>
        </div>

        <div className="mt-28"></div>

        {/* Transactions récentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {transactions.length === 0 ? (
              <motion.div
                key="empty"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={cardVariants}
               className="bg-gray-800 bg-opacity-70 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-white border border-gray-700"
              >
                Aucune transaction récente.
              </motion.div>
            ) : (
              transactions.map((t) => (
                <motion.div
                  key={t.id}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={cardVariants}
                  className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-6 rounded-xl shadow-md"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{t.title}</h3>
                  <p className="text-white mb-1">Montant : {t.amount.toFixed(2)} Fca</p>
                  <p className={typeColors[t.type.toLowerCase()] || "text-orange-300 font-semibold"}>
                    Type : {t.type}
                  </p>
                  <p className="text-gray-200 text-sm mt-1">{t.date}</p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Zone dynamique pour sous-pages */}
        <motion.div
          key={window.location.pathname} 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
