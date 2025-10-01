import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://moneywise-api-backend.onrender.com/api/forgot-password",
        { email }
      );

      if (response.data.success) {
        setMessage("Email envoyé avec succès !");
        setTimeout(() => navigate("/login"), 2000); // redirection après 2s
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi de l'email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-base-200 p-4">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center text-primary">
        MoneyWise
      </h1>

      <div className="card w-full sm:w-96 bg-base-100 shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">Mot de passe oublié</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </form>

        {message && <p className="text-green-500 mt-2 text-center">{message}</p>}
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

        <div className="mt-6 text-center space-y-2 text-sm sm:text-base">
          <Link to="/login" className="text-blue-500 hover:underline block">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
