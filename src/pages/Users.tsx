  import { useEffect, useState, useCallback } from "react";
  import { toast } from "sonner";
  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { Users, Filter } from "lucide-react";
  import API from "@/lib/services/api";

  type User = {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    birth_date?: string;
    is_active: boolean;
    is_staff?: boolean;
    is_superuser?: boolean;
    is_email_verified?: boolean;
    watched_no?: number;
    join_date?: string;
    profile_picture?: string;
  };

  type UserFilters = {
    search: string;
    is_active: string; 
    is_staff: string;
    is_superuser: string;
    is_email_verified: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    birth_date_after: string;
    birth_date_before: string;
    watched_no_min: string;
    watched_no_max: string;
  };

  type PaginationInfo = {
    count: number;
    next: string | null;
    previous: string | null;
    current_page: number;
    total_pages: number;
  };

  interface UserCardProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
  }

  interface EditUserFormProps {
    user: User | null;
    onSave: () => void;
    onCancel: () => void;
    onChange: (user: User) => void;
  }

  interface DeleteConfirmationProps {
    user: User | null;
    onConfirm: () => void;
    onCancel: () => void;
  }

  export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState<PaginationInfo>({
      count: 0,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1,
    });
    const [showFilters, setShowFilters] = useState(false);
    
    const [filters, setFilters] = useState<UserFilters>({
      search: '',
      is_active: 'all',
      is_staff: 'all',
      is_superuser: 'all',
      is_email_verified: 'all',
      email: '',
      username: '',
      first_name: '',
      last_name: '',
      birth_date: '',
      birth_date_after: '',
      birth_date_before: '',
      watched_no_min: '',
      watched_no_max: '',
    });

    const buildQueryParams = useCallback(() => {
      const params = new URLSearchParams();
      
      // Pagination
      params.append('page', currentPage.toString());
      params.append('page_size', pageSize.toString());
      
      // Filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value.trim() !== '') {
          params.append(key, value.trim());
        }
      });
      
      return params.toString();
    }, [currentPage, pageSize, filters]);

    const fetchUsers = useCallback(async () => {
      try {
        setIsLoading(true);
        console.log("Fetching users with params:", buildQueryParams());
        
        const res = await API.get(`/admin/users/?${buildQueryParams()}`);
        console.log("API Response:", res);
        
        if (res.data) {
          // Handle paginated response
          if (res.data.results && Array.isArray(res.data.results)) {
            setUsers(res.data.results);
            setPagination({
              count: res.data.count || 0,
              next: res.data.next,
              previous: res.data.previous,
              current_page: currentPage,
              total_pages: Math.ceil((res.data.count || 0) / pageSize),
            });
          } else if (Array.isArray(res.data)) {
            // Handle direct array response (fallback)
            setUsers(res.data);
            setPagination({
              count: res.data.length,
              next: null,
              previous: null,
              current_page: 1,
              total_pages: 1,
            });
          } else {
            console.error("Unexpected response format:", res.data);
            toast.error("Unexpected response format");
          }
        }
      } catch (err: any) {
        console.error("Error fetching users", err);
        
        if (err.response?.status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else if (err.response?.status === 403) {
          toast.error("Access denied. Admin privileges required.");
        } else {
          toast.error(`Error loading users: ${err.message || 'Unknown error'}`);
        }
      } finally {
        setIsLoading(false);
      }
    }, [buildQueryParams, currentPage, pageSize]);

    useEffect(() => {
      fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async () => {
      if (!deleteTarget) return;
      
      try {
        await API.delete(`/admin/users/${deleteTarget.id}/`);
        setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
        toast.success(`User ${deleteTarget.username} deleted`);
        
        // Refresh the list to update pagination
        fetchUsers();
      } catch (err: any) {
        console.error("Delete error:", err);
        toast.error("Delete failed");
      } finally {
        setDeleteTarget(null);
      }
    };

    const handleEditSubmit = async () => {
      if (!editUser) return;
      
      try {
        const { id, ...updateData } = editUser;
        await API.patch(`/admin/users/${id}/`, updateData);
        
        // Update local state
        setUsers(prev =>
          prev.map(u => (u.id === id ? { ...u, ...updateData } : u))
        );
        
        toast.success("User updated");
        setEditUser(null);
      } catch (err: any) {
        console.error("Update error:", err);
        toast.error("Failed to update user");
      }
    };

    const handleFilterChange = (key: keyof UserFilters, value: string) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      setCurrentPage(1); // Reset to first page when filtering
    };

    const clearAllFilters = () => {
      setFilters({
        search: '',
        is_active: 'all',
        is_staff: 'all',
        is_superuser: 'all',
        is_email_verified: 'all',
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        birth_date: '',
        birth_date_after: '',
        birth_date_before: '',
        watched_no_min: '',
        watched_no_max: '',
      });
      setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newSize: string) => {
      setPageSize(parseInt(newSize));
      setCurrentPage(1);
    };

    // pagination render function -
    const renderPagination = () => {
      if (pagination.total_pages <= 1) return null;

      const getPageNumbers = () => {
        const pages = [];
        const showPages = 5; // Number of page buttons to show
        
        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
        let endPage = Math.min(pagination.total_pages, startPage + showPages - 1);
        
        if (endPage - startPage + 1 < showPages) {
          startPage = Math.max(1, endPage - showPages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
        
        return pages;
      };

      return (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Previous
          </button>
          
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? 'bg-[#f6d33d] text-black font-medium'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(Math.min(pagination.total_pages, currentPage + 1))}
            disabled={currentPage === pagination.total_pages}
            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      );
    };

    if (isLoading) {
      return (
        <div className="p-4">
          <div className="flex justify-center items-center h-32">
            <div className="text-lg">Loading users...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-[#f6d33d]" />
            <h1 className="text-3xl font-bold text-[#f6d33d]">
              Users ({pagination.count})
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-yellow-400"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-yellow-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="outline" onClick={clearAllFilters} size="sm">
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <Label>Search (ID, username, email, name)</Label>
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              {/* Status Filters */}
              <div>
                <Label>Active Status</Label>
                <Select
                  value={filters.is_active}
                  onValueChange={(value) => handleFilterChange('is_active', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Staff Status</Label>
                <Select
                  value={filters.is_staff}
                  onValueChange={(value) => handleFilterChange('is_staff', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Staff</SelectItem>
                    <SelectItem value="false">Non-Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Superuser Status</Label>
                <Select
                  value={filters.is_superuser}
                  onValueChange={(value) => handleFilterChange('is_superuser', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Superuser</SelectItem>
                    <SelectItem value="false">Regular User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Email Verified</Label>
                <Select
                  value={filters.is_email_verified}
                  onValueChange={(value) => handleFilterChange('is_email_verified', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Not Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Field-specific filters */}
              <div>
                <Label>Username</Label>
                <Input
                  placeholder="Filter by username..."
                  value={filters.username}
                  onChange={(e) => handleFilterChange('username', e.target.value)}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  placeholder="Filter by email..."
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                />
              </div>

              <div>
                <Label>First Name</Label>
                <Input
                  placeholder="Filter by first name..."
                  value={filters.first_name}
                  onChange={(e) => handleFilterChange('first_name', e.target.value)}
                />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  placeholder="Filter by last name..."
                  value={filters.last_name}
                  onChange={(e) => handleFilterChange('last_name', e.target.value)}
                />
              </div>

              {/* Date filters */}
              <div>
                <Label>Birth Date (exact)</Label>
                <Input
                  type="date"
                  value={filters.birth_date}
                  onChange={(e) => handleFilterChange('birth_date', e.target.value)}
                />
              </div>

              <div>
                <Label>Birth Date After</Label>
                <Input
                  type="date"
                  value={filters.birth_date_after}
                  onChange={(e) => handleFilterChange('birth_date_after', e.target.value)}
                />
              </div>

              <div>
                <Label>Birth Date Before</Label>
                <Input
                  type="date"
                  value={filters.birth_date_before}
                  onChange={(e) => handleFilterChange('birth_date_before', e.target.value)}
                />
              </div>

              {/* Watched movies filters */}
              <div>
                <Label>Min Watched Movies</Label>
                <Input
                  type="number"
                  placeholder="Minimum..."
                  value={filters.watched_no_min}
                  onChange={(e) => handleFilterChange('watched_no_min', e.target.value)}
                />
              </div>

              <div>
                <Label>Max Watched Movies</Label>
                <Input
                  type="number"
                  placeholder="Maximum..."
                  value={filters.watched_no_max}
                  onChange={(e) => handleFilterChange('watched_no_max', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Page Size Selector */}
        <div className="bg-white rounded-lg border border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.count)} of {pagination.count} users
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="text-sm text-gray-600">Loading...</div>
          </div>
        )}

        {/* Users Grid */}
        {users.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-gray-500">
            No users found matching your criteria
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={setEditUser}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
            
            {/* Movies-style Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
          <DialogContent className="bg-white text-black border border-yellow-400">
            <EditUserForm
              user={editUser}
              onSave={handleEditSubmit}
              onCancel={() => setEditUser(null)}
              onChange={setEditUser}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="bg-white text-black border border-yellow-400">
            <DeleteConfirmation
              user={deleteTarget}
              onConfirm={handleDelete}
              onCancel={() => setDeleteTarget(null)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Enhanced UserCard with more user info
  function UserCard({ user, onEdit, onDelete }: UserCardProps) {
    return (
      <div className="rounded-2xl shadow-xl border border-yellow-200 p-5 bg-white hover:scale-[1.01] transition-transform duration-200">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold">{user.username}</h2>
            <div className="flex gap-1">
              {user.is_superuser && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Super</span>}
              {user.is_staff && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Staff</span>}
            </div>
          </div>
          
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm">
            {user.first_name} {user.last_name}
          </p>
          
          <div className="space-y-1 text-xs">
            <p>Status: {user.is_active ? "✅ Active" : "❌ Inactive"}</p>
            {user.is_email_verified !== undefined && (
              <p>Email: {user.is_email_verified ? "✅ Verified" : "❌ Not Verified"}</p>
            )}
            {user.watched_no !== undefined && (
              <p>Watched: {user.watched_no} movies</p>
            )}
            {user.join_date && (
              <p>Joined: {new Date(user.join_date).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onEdit(user)} size="sm">
            Edit
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => onDelete(user)}
            size="sm"
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  function EditUserForm({ user, onSave, onCancel, onChange }: EditUserFormProps) {
    if (!user) return null;

    return (
      <>
        <h2 className="text-xl font-bold mb-2 text-yellow-600">Edit User</h2>
        <div className="grid gap-4 max-h-96 overflow-y-auto">
          <div>
            <Label>Email</Label>
            <Input
              value={user.email}
              onChange={(e) => onChange({ ...user, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Username</Label>
            <Input
              value={user.username}
              onChange={(e) => onChange({ ...user, username: e.target.value })}
            />
          </div>
          <div>
            <Label>First Name</Label>
            <Input
              value={user.first_name}
              onChange={(e) => onChange({ ...user, first_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              value={user.last_name}
              onChange={(e) => onChange({ ...user, last_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Birth Date</Label>
            <Input
              type="date"
              value={user.birth_date || ''}
              onChange={(e) => onChange({ ...user, birth_date: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave} className="bg-yellow-400 text-black hover:bg-yellow-500">
              Save
            </Button>
          </div>
        </div>
      </>
    );
  }

  function DeleteConfirmation({ user, onConfirm, onCancel }: DeleteConfirmationProps) {
    if (!user) return null;

    return (
      <>
        <h2 className="text-lg font-semibold text-red-600">Confirm Delete</h2>
        <p>
          Are you sure you want to delete <b>{user.username}</b>?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
          >
            Yes, Delete
          </Button>
        </div>
      </>
    );
  }