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

// Updated Group type to match API response
type Group = {
  id: number;
  name: string;
  description: string;
  create_date: string;
  is_member: boolean;
};

// API Response type for paginated results
type GroupsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Group[];
};

// Filter state type
type GroupFilters = {
  search: string;
  is_member: string; // 'all' | 'true' | 'false'
  name: string;
  description: string;
  create_date: string;
  create_date_after: string;
  create_date_before: string;
};

type PaginationInfo = {
  count: number;
  next: string | null;
  previous: string | null;
  current_page: number;
  total_pages: number;
};

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
}

interface EditGroupFormProps {
  group: Group | null;
  onSave: () => void;
  onCancel: () => void;
  onChange: (group: Group) => void;
}

interface DeleteConfirmationProps {
  group: Group | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);
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
  
  const [filters, setFilters] = useState<GroupFilters>({
    search: '',
    is_member: 'all',
    name: '',
    description: '',
    create_date: '',
    create_date_after: '',
    create_date_before: '',
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

  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching groups with params:", buildQueryParams());
      
      const res = await API.get(`/groups/?${buildQueryParams()}`);
      console.log("API Response:", res);
      
      if (res.data) {
        // Handle different response formats
        if (Array.isArray(res.data)) {
          // Simple array response (non-paginated)
          setGroups(res.data);
          setPagination({
            count: res.data.length,
            next: null,
            previous: null,
            current_page: 1,
            total_pages: 1,
          });
        } else if (res.data.results && Array.isArray(res.data.results)) {
          // Paginated response
          const paginatedData = res.data as GroupsResponse;
          setGroups(paginatedData.results);
          setPagination({
            count: paginatedData.count || 0,
            next: paginatedData.next,
            previous: paginatedData.previous,
            current_page: currentPage,
            total_pages: Math.ceil((paginatedData.count || 0) / pageSize),
          });
        } else if (res.data.data && Array.isArray(res.data.data)) {
          // Wrapped response
          setGroups(res.data.data);
          setPagination({
            count: res.data.count || res.data.data.length,
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
      console.error("Error fetching groups", err);
      
      if (err.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("Access denied.");
      } else if (err.response?.status === 404) {
        toast.error("Groups endpoint not found. Please check the API configuration.");
      } else if (err.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(`Error loading groups: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryParams, currentPage, pageSize]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await API.delete(`/groups/${deleteTarget.id}/`);
      setGroups(prev => prev.filter(g => g.id !== deleteTarget.id));
      toast.success(`Group ${deleteTarget.name} deleted`);
      
      // Refresh the list to update pagination
      fetchGroups();
    } catch (err: any) {
      console.error("Delete error:", err);
      if (err.response?.status === 403) {
        toast.error("Access denied. Admin privileges required.");
      } else if (err.response?.status === 404) {
        toast.error("Group not found.");
      } else {
        toast.error("Delete failed");
      }
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEditSubmit = async () => {
    if (!editGroup) return;
    
    try {
      const updateData = {
        group_name: editGroup.name,
        description: editGroup.description
      };
      
      await API.patch(`/groups/edit/${editGroup.id}/`, updateData);
      
      // Update local state
      setGroups(prev =>
        prev.map(g => (g.id === editGroup.id ? { ...g, ...editGroup } : g))
      );
      
      toast.success("Group updated");
      setEditGroup(null);
    } catch (err: any) {
      console.error("Update error:", err);
      if (err.response?.status === 403) {
        toast.error("Access denied. Admin privileges required.");
      } else if (err.response?.status === 404) {
        toast.error("Group not found.");
      } else {
        toast.error("Failed to update group");
      }
    }
  };

  const handleFilterChange = (key: keyof GroupFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      is_member: 'all',
      name: '',
      description: '',
      create_date: '',
      create_date_after: '',
      create_date_before: '',
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

  // Pagination render function
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
          <div className="text-lg">Loading groups...</div>
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
            Groups ({pagination.count})
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
              <Label>Search (ID, name, description)</Label>
              <Input
                placeholder="Search groups..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Membership Status */}
            <div>
              <Label>Membership Status</Label>
              <Select
                value={filters.is_member}
                onValueChange={(value) => handleFilterChange('is_member', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Member</SelectItem>
                  <SelectItem value="false">Not Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Field-specific filters */}
            <div>
              <Label>Group Name</Label>
              <Input
                placeholder="Filter by group name..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                placeholder="Filter by description..."
                value={filters.description}
                onChange={(e) => handleFilterChange('description', e.target.value)}
              />
            </div>

            {/* Date filters */}
            <div>
              <Label>Create Date (exact)</Label>
              <Input
                type="date"
                value={filters.create_date}
                onChange={(e) => handleFilterChange('create_date', e.target.value)}
              />
            </div>

            <div>
              <Label>Created After</Label>
              <Input
                type="date"
                value={filters.create_date_after}
                onChange={(e) => handleFilterChange('create_date_after', e.target.value)}
              />
            </div>

            <div>
              <Label>Created Before</Label>
              <Input
                type="date"
                value={filters.create_date_before}
                onChange={(e) => handleFilterChange('create_date_before', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Page Size Selector */}
      <div className="bg-white rounded-lg border border-yellow-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.count)} of {pagination.count} groups
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

      {/* Groups Grid */}
      {groups.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-gray-500">
          No groups found matching your criteria
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onEdit={setEditGroup}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editGroup} onOpenChange={(open) => !open && setEditGroup(null)}>
        <DialogContent className="bg-white text-black border border-yellow-400">
          <EditGroupForm
            group={editGroup}
            onSave={handleEditSubmit}
            onCancel={() => setEditGroup(null)}
            onChange={setEditGroup}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-white text-black border border-yellow-400">
          <DeleteConfirmation
            group={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Enhanced GroupCard with edit/delete functionality
function GroupCard({ group, onEdit, onDelete }: GroupCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="rounded-2xl shadow-xl border border-yellow-200 p-5 bg-white hover:scale-[1.01] transition-transform duration-200">
      <div className="space-y-3">
        {/* Group Header */}
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-gray-900 flex-1">{group.name}</h2>
          <div className="flex gap-1">
            {group.is_member && (
              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                Member
              </span>
            )}
          </div>
        </div>
        
        {/* Group Description */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {group.description || 'No description available'}
        </p>
        
        {/* Group Details */}
        <div className="space-y-1">
          <p className="text-sm text-gray-500">
            <span className="font-medium">Created:</span> {formatDate(group.create_date)}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">ID:</span> {group.id}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="pt-2 flex gap-2">
          <Button variant="outline" onClick={() => onEdit(group)} size="sm">
            Edit
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => onDelete(group)}
            size="sm"
          >
            Delete
          </Button>
          {!group.is_member && (
            <Button
              className="flex-1 bg-[#f6d33d] text-black hover:bg-yellow-400"
              size="sm"
            >
              Join Group
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditGroupForm({ group, onSave, onCancel, onChange }: EditGroupFormProps) {
  if (!group) return null;

  return (
    <>
      <h2 className="text-xl font-bold mb-2 text-yellow-600">Edit Group</h2>
      <div className="grid gap-4 max-h-96 overflow-y-auto">
        <div>
          <Label>Group Name</Label>
          <Input
            value={group.name}
            onChange={(e) => onChange({ ...group, name: e.target.value })}
            placeholder="Enter group name"
          />
        </div>
        <div>
          <Label>Description</Label>
          <Input
            value={group.description}
            onChange={(e) => onChange({ ...group, description: e.target.value })}
            placeholder="Enter group description"
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

function DeleteConfirmation({ group, onConfirm, onCancel }: DeleteConfirmationProps) {
  if (!group) return null;

  return (
    <>
      <h2 className="text-lg font-semibold text-red-600">Confirm Delete</h2>
      <p>
        Are you sure you want to delete the group <b>{group.name}</b>?
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