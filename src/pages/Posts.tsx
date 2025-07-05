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
import { MessageSquare, Filter } from "lucide-react";
import API from "@/lib/services/api";

// Post type based on typical API response structure
type Post = {
  id: number;
  content: string;
  add_date: string;
  reaction_no: number;
  comment_no: number;
  author?: string;
  group?: string;
  group_id?: number;
  image?: string;
};

// API Response type for paginated results
// type PostsResponse = {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: Post[];
// };

// Filter state type based on API parameters
type PostFilters = {
  search: string;
  content: string;
  add_date_after: string;
  add_date_before: string;
  reaction_no_min: string;
  reaction_no_max: string;
  comment_no_min: string;
  comment_no_max: string;
};

type PaginationInfo = {
  count: number;
  next: string | null;
  previous: string | null;
  current_page: number;
  total_pages: number;
};

interface PostCardProps {
  post: Post;
  onDelete: (post: Post) => void;
}

interface DeleteConfirmationProps {
  post: Post | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
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
  
  const [filters, setFilters] = useState<PostFilters>({
    search: '',
    content: '',
    add_date_after: '',
    add_date_before: '',
    reaction_no_min: '',
    reaction_no_max: '',
    comment_no_min: '',
    comment_no_max: '',
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

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching posts with params:", buildQueryParams());
      
      const res = await API.get(`/admin/posts/?${buildQueryParams()}`);
      console.log("API Response:", res);
      
      if (res.data) {
        // Handle paginated response
        if (res.data.results && Array.isArray(res.data.results)) {
          setPosts(res.data.results);
          setPagination({
            count: res.data.count || 0,
            next: res.data.next,
            previous: res.data.previous,
            current_page: currentPage,
            total_pages: Math.ceil((res.data.count || 0) / pageSize),
          });
        } else if (Array.isArray(res.data)) {
          // Handle direct array response (fallback)
          setPosts(res.data);
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
      console.error("Error fetching posts", err);
      
      if (err.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("Access denied. Admin privileges required.");
      } else {
        toast.error(`Error loading posts: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryParams, currentPage, pageSize]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      // Use the API endpoint format: /groups/{group_id}/posts/{post_id}/
      // If group_id is not available, we might need to adjust the API call
      const groupId = deleteTarget.group_id || 1; // fallback if group_id not provided
      await API.delete(`/groups/${groupId}/posts/${deleteTarget.id}/`);
      
      setPosts(prev => prev.filter(p => p.id !== deleteTarget.id));
      toast.success(`Post ${deleteTarget.id} deleted`);
      
      // Refresh the list to update pagination
      fetchPosts();
    } catch (err: any) {
      console.error("Delete error:", err);
      if (err.response?.status === 403) {
        toast.error("Not authorized to delete this post");
      } else if (err.response?.status === 404) {
        toast.error("Post not found");
      } else {
        toast.error("Delete failed");
      }
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleFilterChange = (key: keyof PostFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      content: '',
      add_date_after: '',
      add_date_before: '',
      reaction_no_min: '',
      reaction_no_max: '',
      comment_no_min: '',
      comment_no_max: '',
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

  // pagination render function
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
          <div className="text-lg">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-[#f6d33d]" />
          <h1 className="text-3xl font-bold text-[#f6d33d]">
            Posts ({pagination.count})
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
              <Label>Search (content)</Label>
              <Input
                placeholder="Search posts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Content Filter */}
            <div>
              <Label>Content Contains</Label>
              <Input
                placeholder="Filter by content..."
                value={filters.content}
                onChange={(e) => handleFilterChange('content', e.target.value)}
              />
            </div>

            {/* Date filters */}
            <div>
              <Label>Created After</Label>
              <Input
                type="date"
                value={filters.add_date_after}
                onChange={(e) => handleFilterChange('add_date_after', e.target.value)}
              />
            </div>

            <div>
              <Label>Created Before</Label>
              <Input
                type="date"
                value={filters.add_date_before}
                onChange={(e) => handleFilterChange('add_date_before', e.target.value)}
              />
            </div>

            {/* Reaction filters */}
            <div>
              <Label>Min Reactions</Label>
              <Input
                type="number"
                placeholder="Minimum reactions..."
                value={filters.reaction_no_min}
                onChange={(e) => handleFilterChange('reaction_no_min', e.target.value)}
              />
            </div>

            <div>
              <Label>Max Reactions</Label>
              <Input
                type="number"
                placeholder="Maximum reactions..."
                value={filters.reaction_no_max}
                onChange={(e) => handleFilterChange('reaction_no_max', e.target.value)}
              />
            </div>

            {/* Comment filters */}
            <div>
              <Label>Min Comments</Label>
              <Input
                type="number"
                placeholder="Minimum comments..."
                value={filters.comment_no_min}
                onChange={(e) => handleFilterChange('comment_no_min', e.target.value)}
              />
            </div>

            <div>
              <Label>Max Comments</Label>
              <Input
                type="number"
                placeholder="Maximum comments..."
                value={filters.comment_no_max}
                onChange={(e) => handleFilterChange('comment_no_max', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Page Size Selector */}
      <div className="bg-white rounded-lg border border-yellow-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.count)} of {pagination.count} posts
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

      {/* Posts Grid */}
      {posts.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-gray-500">
          No posts found matching your criteria
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-white text-black border border-yellow-400">
          <DeleteConfirmation
            post={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Enhanced PostCard with delete button
function PostCard({ post, onDelete }: PostCardProps) {
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
    <div className="rounded-2xl shadow-xl border border-yellow-200 p-5 bg-white hover:scale-[1.01] transition-transform duration-200">
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
            <p className="text-gray-800 leading-relaxed line-clamp-3">
              {post.content}
            </p>
          </div>

          {/* Post Image */}
          {post.image && (
            <div className="mt-3">
              <img
                src={post.image}
                alt="Post image"
                className="max-w-full h-auto rounded-lg shadow-sm max-h-48 object-cover"
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
            <span className="text-xl">👍</span>
            <span className="text-sm font-medium text-gray-700">
              {post.reaction_no}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium text-gray-700">
              {post.comment_no}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => onDelete(post)}
            size="sm"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmation({ post, onConfirm, onCancel }: DeleteConfirmationProps) {
  if (!post) return null;

  return (
    <>
      <h2 className="text-lg font-semibold text-red-600">Confirm Delete</h2>
      <p>
        Are you sure you want to delete post <b>#{post.id}</b>?
      </p>
      <div className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded">
        <p className="line-clamp-3">{post.content}</p>
      </div>
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