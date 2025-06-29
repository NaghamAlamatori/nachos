import { useEffect, useState } from "react";
import API from "@/lib/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
  is_active: boolean;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // You'd ideally use /admin/users/ to get all IDs, but here we simulate 1-60
        const responses = await Promise.all(
          Array.from({ length: 60 }, (_, i) =>
            API.get(`/admin/users/${i + 1}/`).catch(() => null)
          )
        );
        const validUsers = responses
          .filter(Boolean)
          .map((res) => res?.data)
          .filter((u) => !!u);
        setUsers(validUsers);
      } catch (err) {
        console.error("Error fetching users", err);
        toast.error("Error loading users.");
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/admin/users/${deleteTarget.id}/`);
      setUsers(users.filter((u) => u.id !== deleteTarget.id));
      toast.success(`User ${deleteTarget.username} deleted`);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEditSubmit = async () => {
    if (!editUser) return;
    try {
      const { id, ...body } = editUser;
      await API.patch(`/admin/users/${id}/`, body);
      toast.success("User updated");
      setEditUser(null);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...body } : u))
      );
    } catch {
      toast.error("Failed to update user");
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-[#f6d33d] mb-6">Users</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentUsers.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl shadow-xl border border-yellow-200 p-5 bg-white hover:scale-[1.01] transition-transform duration-200"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-sm">
                Status: {user.is_active ? "✅ Active" : "❌ Inactive"}
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setEditUser(user)}
                  >
                    Edit
                  </Button>
                </DialogTrigger>

                {editUser?.id === user.id && (
                  <DialogContent className="bg-white text-black border border-yellow-400">
                    <h2 className="text-xl font-bold mb-2 text-yellow-600">
                      Edit User
                    </h2>

                    <div className="grid gap-4">
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={editUser.email}
                          onChange={(e) =>
                            setEditUser({ ...editUser, email: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Username</Label>
                        <Input
                          value={editUser.username}
                          onChange={(e) =>
                            setEditUser({
                              ...editUser,
                              username: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>First Name</Label>
                        <Input
                          value={editUser.first_name}
                          onChange={(e) =>
                            setEditUser({
                              ...editUser,
                              first_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={editUser.last_name}
                          onChange={(e) =>
                            setEditUser({
                              ...editUser,
                              last_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditUser(null)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleEditSubmit}>Save</Button>
                      </div>
                    </div>
                  </DialogContent>
                )}
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => setDeleteTarget(user)}
                  >
                    Delete
                  </Button>
                </DialogTrigger>

                {deleteTarget?.id === user.id && (
                  <DialogContent className="bg-white text-black border border-yellow-400">
                    <h2 className="text-lg font-semibold text-red-600">
                      Confirm Delete
                    </h2>
                    <p>
                      Are you sure you want to delete{" "}
                      <b>{user.username}</b>?
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setDeleteTarget(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleDelete}
                      >
                        Yes, Delete
                      </Button>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
