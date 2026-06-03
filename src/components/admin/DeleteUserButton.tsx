"use client";

export default function DeleteUserButton({ userId }: { userId: string }) {
  const handleDelete = async () => {
    if (!confirm("Estàs segur que vols esborrar aquest usuari?")) return;

    await fetch(`/api/admin/delete-user`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    });
    window.location.reload(); // Recarreguem per veure el canvi
  };

  return (
    <button onClick={handleDelete} className="text-red-600 font-bold">
      Esborrar
    </button>
  );
}