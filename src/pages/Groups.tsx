import { useEffect, useState, useCallback } from "react";
import API from "@/lib/services/api";
import { toast } from "sonner";

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
type FilterState = {
  search: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(12); // Fixed page size
  const [filters, setFilters] = useState<FilterState>({
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search to avoid too many API calls
  const [searchDebounce, setSearchDebounce] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(filters.search);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchGroups = useCallback(async (page: number = 1, currentFilters: FilterState = filters) => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      
      // Add filters if they exist
      if (currentFilters.search.trim()) {
        params.append('search', currentFilters.search.trim());
      }

      const queryString = params.toString();
      const endpoint = `/groups/${queryString ? '?' + queryString : ''}`;
      
      console.log("Fetching groups with endpoint:", endpoint);
      
      const res = await API.get(endpoint);
      console.log("API Response:", res);
      
      // Handle different response formats
      if (res.data) {
        if (Array.isArray(res.data)) {
          // Simple array response (non-paginated)
          setGroups(res.data);
          setTotalCount(res.data.length);
          console.log("Set groups directly:", res.data.length);
        } else if (res.data.results && Array.isArray(res.data.results)) {
          // Paginated response
          const paginatedData = res.data as GroupsResponse;
          setGroups(paginatedData.results);
          setTotalCount(paginatedData.count || paginatedData.results.length);
          console.log("Set groups from paginated results:", paginatedData.results.length);
        } else if (res.data.data && Array.isArray(res.data.data)) {
          // Wrapped response
          setGroups(res.data.data);
          setTotalCount(res.data.count || res.data.data.length);
          console.log("Set groups from wrapped data:", res.data.data.length);
        } else {
          console.error("Unexpected response format:", res.data);
          toast.error("Unexpected response format");
        }
      } else {
        console.error("No data in response");
        toast.error("No data received");
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
  }, [pageSize, filters]);

  // Fetch groups when page changes or search debounce updates
  useEffect(() => {
    const effectiveFilters = { ...filters, search: searchDebounce };
    fetchGroups(currentPage, effectiveFilters);
  }, [currentPage, searchDebounce, fetchGroups]);

  // Reset to page 1 when filters change (except search which is debounced)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      const effectiveFilters = { ...filters, search: searchDebounce };
      fetchGroups(1, effectiveFilters);
    }
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: ''
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const showPages = 5; 
      
      let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
      let endPage = Math.min(totalPages, startPage + showPages - 1);
      
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
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          Previous
        </button>
        
        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
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
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    );
  };

  if (isLoading && groups.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading groups...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#f6d33d]">
          Groups ({totalCount})
        </h1>
        
        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-[#f6d33d] text-black rounded-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
        >
          <span>🔍</span>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Collapsible Search and Filter Section */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-[#f6d33d]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Groups
              </label>
              <input
                type="text"
                placeholder="Search by group name or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6d33d] focus:border-transparent"
              />
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator for filter changes */}
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
      )}

      {/* Groups Grid */}
      {groups.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-gray-500">
          No groups found. Try adjusting your search or filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
          
          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
}

// Group card component with proper TypeScript props
interface GroupCardProps {
  group: Group;
}

function GroupCard({ group }: GroupCardProps) {
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
          {group.is_member && (
            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
              Member
            </span>
          )}
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
          <button className="flex-1 px-3 py-2 text-sm font-medium text-[#f6d33d] border border-[#f6d33d] rounded-md hover:bg-[#f6d33d] hover:text-black transition-colors">
            View Details
          </button>
          {!group.is_member && (
            <button className="flex-1 px-3 py-2 text-sm font-medium text-white bg-[#f6d33d] rounded-md hover:bg-yellow-400 hover:text-black transition-colors">
              Join Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
}