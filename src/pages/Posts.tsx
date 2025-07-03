import { useEffect, useState, useCallback } from "react";
import API from "@/lib/services/api";
import { toast } from "sonner";

// Post type based on typical API response structure
type Post = {
  id: number;
  content: string;
  add_date: string;
  reaction_no: number;
  comment_no: number;
  author?: string;
  group?: string;
  image?: string;
};

// API Response type for paginated results
type PostsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Post[];
};

// Filter state type based on API parameters
type FilterState = {
  search: string;
  content: string;
  add_date_after: string;
  add_date_before: string;
  reaction_no_min: string;
  reaction_no_max: string;
  comment_no_min: string;
  comment_no_max: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10); // Default page size as per API
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    content: '',
    add_date_after: '',
    add_date_before: '',
    reaction_no_min: '',
    reaction_no_max: '',
    comment_no_min: '',
    comment_no_max: ''
  });

  // Debounced search to avoid too many API calls
  const [searchDebounce, setSearchDebounce] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(filters.search);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchPosts = useCallback(async (page: number = 1, currentFilters: FilterState = filters) => {
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
      if (currentFilters.content.trim()) {
        params.append('content', currentFilters.content.trim());
      }
      if (currentFilters.add_date_after.trim()) {
        params.append('add_date_after', currentFilters.add_date_after.trim());
      }
      if (currentFilters.add_date_before.trim()) {
        params.append('add_date_before', currentFilters.add_date_before.trim());
      }
      if (currentFilters.reaction_no_min.trim()) {
        params.append('reaction_no_min', currentFilters.reaction_no_min.trim());
      }
      if (currentFilters.reaction_no_max.trim()) {
        params.append('reaction_no_max', currentFilters.reaction_no_max.trim());
      }
      if (currentFilters.comment_no_min.trim()) {
        params.append('comment_no_min', currentFilters.comment_no_min.trim());
      }
      if (currentFilters.comment_no_max.trim()) {
        params.append('comment_no_max', currentFilters.comment_no_max.trim());
      }

      const queryString = params.toString();
      const endpoint = `/admin/posts/${queryString ? '?' + queryString : ''}`;
      
      console.log("Fetching posts with endpoint:", endpoint);
      
      const res = await API.get(endpoint);
      console.log("API Response:", res);
      
      // Handle different response formats
      if (res.data) {
        if (Array.isArray(res.data)) {
          // Simple array response (non-paginated)
          setPosts(res.data);
          setTotalCount(res.data.length);
          console.log("Set posts directly:", res.data.length);
        } else if (res.data.results && Array.isArray(res.data.results)) {
          // Paginated response
          const paginatedData = res.data as PostsResponse;
          setPosts(paginatedData.results);
          setTotalCount(paginatedData.count || paginatedData.results.length);
          console.log("Set posts from paginated results:", paginatedData.results.length);
        } else if (res.data.data && Array.isArray(res.data.data)) {
          // Wrapped response
          setPosts(res.data.data);
          setTotalCount(res.data.count || res.data.data.length);
          console.log("Set posts from wrapped data:", res.data.data.length);
        } else {
          console.error("Unexpected response format:", res.data);
          toast.error("Unexpected response format");
        }
      } else {
        console.error("No data in response");
        toast.error("No data received");
      }
    } catch (err: any) {
      console.error("Error fetching posts", err);
      
      if (err.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("Access denied.");
      } else if (err.response?.status === 404) {
        toast.error("Posts endpoint not found. Please check the API configuration.");
      } else if (err.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(`Error loading posts: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, filters]);

  // Fetch posts when page changes or search debounce updates
  useEffect(() => {
    const effectiveFilters = { ...filters, search: searchDebounce };
    fetchPosts(currentPage, effectiveFilters);
  }, [currentPage, searchDebounce, fetchPosts]);

  // Reset to page 1 when filters change (except search which is debounced)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      const effectiveFilters = { ...filters, search: searchDebounce };
      fetchPosts(1, effectiveFilters);
    }
  }, [filters.content, filters.add_date_after, filters.add_date_before, 
      filters.reaction_no_min, filters.reaction_no_max, 
      filters.comment_no_min, filters.comment_no_max]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      content: '',
      add_date_after: '',
      add_date_before: '',
      reaction_no_min: '',
      reaction_no_max: '',
      comment_no_min: '',
      comment_no_max: ''
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

  if (isLoading && posts.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-[#f6d33d] mb-6">
        Posts ({totalCount})
      </h1>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Posts
            </label>
            <input
              type="text"
              placeholder="Search by post content..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6d33d] focus:border-transparent"
            />
          </div>

          {/* Content Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Contains
            </label>
            <input
              type="text"
              placeholder="Filter by content..."
              value={filters.content}
              onChange={(e) => handleFilterChange('content', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6d33d] focus:border-transparent"
            />
          </div>

          {/* Date After Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Created After
            </label>
            <input
              type="date"
              value={filters.add_date_after}
              onChange={(e) => handleFilterChange('add_date_after', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6d33d] focus:border-transparent"
            />
          </div>

          {/* Date Before Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Created Before
            </label>
            <input
              type="date"
              value={filters.add_date_before}
              onChange={(e) => handleFilterChange('add_date_before', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6d33d] focus:border-transparent"
            />
          </div>

          {/* Reactions Min Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Reactions
            </label>
            <input
              type="number"
              placeholder="e.g., 10"
              value={filters.reaction_no_min}
              onChange={(e) => handleFilterChange('reaction_no_min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6d33d] focus:border-transparent"
            />
          </div>

          {/* Reactions Max Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Reactions
            </label>
            <input
              type="number"
              placeholder="e.g., 100"
              value={filters.reaction_no_max}
              onChange={(e) => handleFilterChange('reaction_no_max', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6d33d] focus:border-transparent"
            />
          </div>

          {/* Comments Min Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Comments
            </label>
            <input
              type="number"
              placeholder="e.g., 5"
              value={filters.comment_no_min}
              onChange={(e) => handleFilterChange('comment_no_min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6d33d] focus:border-transparent"
            />
          </div>

          {/* Comments Max Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Comments
            </label>
            <input
              type="number"
              placeholder="e.g., 50"
              value={filters.comment_no_max}
              onChange={(e) => handleFilterChange('comment_no_max', e.target.value)}
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

      {/* Loading indicator for filter changes */}
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-gray-500">
          No posts found. Try adjusting your search or filters.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          
          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
}

// Post card component with proper TypeScript props
interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="rounded-2xl shadow-xl border border-yellow-200 p-6 bg-white hover:scale-[1.01] transition-transform duration-200">
      <div className="space-y-4">
        {/* Post Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
              <span className="font-medium">ID: {post.id}</span>
              {post.add_date && (
                <span>{formatDate(post.add_date)}</span>
              )}
            </div>
            
            {post.author && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Author:</span> {post.author}
              </p>
            )}
            
            {post.group && (
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Group:</span> {post.group}
              </p>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-3">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-800 leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* Post Image */}
          {post.image && (
            <div className="mt-3">
              <img
                src={post.image}
                alt="Post image"
                className="max-w-full h-auto rounded-lg shadow-sm"
                onError={(e) => {
                  // Hide broken images
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Post Stats */}
        <div className="flex items-center space-x-6 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">👍</span>
            <span className="text-sm font-medium text-gray-700">
              {post.reaction_no} reactions
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💬</span>
            <span className="text-sm font-medium text-gray-700">
              {post.comment_no} comments
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}