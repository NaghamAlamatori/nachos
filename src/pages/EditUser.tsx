
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/lib/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserForm = {
  email: string;
  username: string;
  password: string;
  birth_date: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_staff: boolean;
  is_superuser: boolean;
};

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<UserForm>({
    email: "",
    username: "",
    password: "",
    birth_date: "",
    first_name: "",
    last_name: "",
    is_active: true,
    is_email_verified: false,
    is_staff: false,
    is_superuser: false,
  });

  useEffect(() => {
    API.get(`/user/detail/${id}/`)
      .then(res => setForm({ ...res.data, password: "" }))
      .catch(err => {
        console.error(err);
        toast.error("Failed to load user");
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.put("/user/profile/edit/", form);
      toast.success("User updated successfully");
      navigate("/dashboard/users");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#f6d33d] mb-4">Edit User</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {[
          ["email", "Email"],
          ["username", "Username"],
          ["password", "Password"],
          ["first_name", "First Name"],
          ["last_name", "Last Name"],
          ["birth_date", "Birth Date"],
        ].map(([name, label]) => (
          <div key={name}>
            <Label htmlFor={name}>{label}</Label>
            <Input
              type={name === "password" ? "password" : "text"}
              name={name}
              value={(form as any)[name]}
              onChange={handleChange}
              required={name !== "password"} // allow empty password
            />
          </div>
        ))}

        {/* Switches for boolean values */}
        {[
          ["is_active", "Active"],
          ["is_email_verified", "Email Verified"],
          ["is_staff", "Staff"],
          ["is_superuser", "Superuser"],
        ].map(([name, label]) => (
          <div key={name} className="flex items-center space-x-2">
            <input
              type="checkbox"
              name={name}
              checked={(form as any)[name]}
              onChange={handleChange}
              id={name}
            />
            <Label htmlFor={name}>{label}</Label>
          </div>
        ))}

        <Button type="submit" className="bg-[#f6d33d] hover:bg-[#f7df6e]">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
