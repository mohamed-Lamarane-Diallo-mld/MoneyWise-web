import React, { useEffect, useState } from "react";
import axios from "axios";

interface User {
  name: string;
  email: string;
  profile_image?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("/default-avatar.png"); // image par défaut
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Veuillez vous connecter.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("https://moneywise-api-backend.onrender.com/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = res.data.user || res.data;
        setUser(userData);
        setName(userData.name);

        setPreview(
          userData.profile_image
            ? `https://moneywise-api-backend.onrender.com/storage/profiles/${userData.profile_image}`
            : "/default-avatar.png"
        );
      } catch {
        setError("Impossible de charger le profil.");
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpdateProfile = async () => {
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("profile_image", image);

      const res = await axios.post(
        "https://moneywise-api-backend.onrender.com/api/update-profile",
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      const updatedUser = res.data.user;
      setUser(updatedUser);
      setSuccess("Profil mis à jour !");
      setError(null);

      setPreview(
        updatedUser.profile_image
          ? `https://moneywise-api-backend.onrender.com/storage/profiles/${updatedUser.profile_image}`
          : "/default-avatar.png"
      );
    } catch {
      setError("Impossible de mettre à jour le profil.");
      setSuccess(null);
    }
  };

  const handlePasswordReset = () => {
    window.location.href = "/forgot-password";
  };

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold">Profil</h1>

      <div className="flex flex-col items-center gap-4">
        <img
          src={preview}
          alt="Profil"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-600"
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input input-bordered w-full"
          placeholder="Nom"
        />
        <input
          type="email"
          value={user.email}
          className="input input-bordered w-full"
          disabled
        />
      </div>

      <div className="flex gap-4">
        <button className="btn btn-primary" onClick={handleUpdateProfile}>
          Mettre à jour le profil
        </button>
        <button className="btn btn-secondary" onClick={handlePasswordReset}>
          Modifier le mot de passe
        </button>
      </div>

      {success && <p className="text-green-400">{success}</p>}
      {error && <p className="text-red-400">{error}</p>}
    </div>
  );
}
