// src/pages/GroupsPage.tsx
import { useEffect, useState } from "react";
import API from "@/lib/services/api";
import { toast } from "sonner";

type Group = {
  id: number;
  name: string;
  permissions: string[];
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    API.get("/user/groups/")
      .then((res) => setGroups(res.data))
      .catch((err) => {
        console.error("Fetch groups error:", err);
        toast.error("Failed to load groups");
      });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#f6d33d] mb-4">Groups</h1>
      <ul className="space-y-4">
        {groups.map((group) => (
          <li key={group.id} className="border p-4 rounded bg-white">
            <p className="font-semibold">{group.name}</p>
            <p className="text-sm text-gray-600">
              Permissions: {group.permissions.join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
