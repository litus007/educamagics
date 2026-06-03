"use client";

import { trpc } from "@/lib/trpc/client"; 

export default function UserManagementPage() {
  const { data: users, refetch, isLoading } = trpc.user.listAll.useQuery();
  
  const deleteMutation = trpc.user.delete.useMutation({ 
    onSuccess: () => refetch() 
  });

  // Nova mutació per actualitzar el rol
  const updateMutation = trpc.user.updateRole.useMutation({ 
    onSuccess: () => refetch() 
  });

  if (isLoading) return <div className="p-8">Carregant usuaris...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-sky-950">Gestió d'Usuaris</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-sky-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-sky-50">
            <tr>
              <th className="p-4 border-b">Nom</th>
              <th className="p-4 border-b">Email</th>
              <th className="p-4 border-b">Rol</th>
              <th className="p-4 border-b">Accions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-t hover:bg-sky-50/50">
                <td className="p-4">{user.name || "Sense nom"}</td>
                <td className="p-4 text-sky-700">{user.email}</td>
                <td className="p-4">
                  {/* Selector de rol */}
                  <select 
                    defaultValue={user.role}
                    onChange={(e) => updateMutation.mutate({ 
                      userId: user.id, 
                      role: e.target.value as "PARENT" | "TEACHER" | "ADMIN" 
                    })}
                    className="border border-sky-200 rounded-lg p-1 text-sm bg-white"
                  >
                    <option value="PARENT">Pare/Mare</option>
                    <option value="TEACHER">Professor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => deleteMutation.mutate({ userId: user.id })}
                    className="text-red-500 hover:text-red-700 font-bold text-sm"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}