import { useEffect, useState } from "react";
import API from "@/lib/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
};

const dummyUsers: User[] = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  username: `user${i + 1}`,
  email: `user${i + 1}@example.com`,
  first_name: `First${i + 1}`,
  last_name: `Last${i + 1}`,
  is_active: i % 2 === 0,
}));

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    API.get("/user/all/")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        toast.error("Failed to load users, using fallback data", {
          style: {
            backgroundColor: "#f6d33d",
            color: "#000",
          },
        });
        console.error(err);
        setUsers(dummyUsers);
      });
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/user/delete/${deleteTarget.id}/`);
      setUsers(users.filter((u) => u.id !== deleteTarget.id));
      toast.success(`User ${deleteTarget.username} deleted`, {
        style: {
          backgroundColor: "#f6d33d",
          color: "#000",
        },
      });
    } catch (err) {
      toast.error("Failed to delete user", {
        style: {
          backgroundColor: "#f6d33d",
          color: "#000",
        },
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#f6d33d] mb-6">Users</h1>
      <div className="space-y-4">
        {currentUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white shadow p-4 rounded-md flex justify-between items-center border border-yellow-100"
          >
            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-sm">
                Status: {user.is_active ? "✅ Active" : "❌ Inactive"}
              </p>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/edit-user/${user.id}`)}
              >
                Edit
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setDeleteTarget(user)}
                  >
                    Delete
                  </Button>
                </DialogTrigger>

                {deleteTarget?.id === user.id && (
                  <DialogContent className="bg-[#ffffff] text-black border border-yellow-400">
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
