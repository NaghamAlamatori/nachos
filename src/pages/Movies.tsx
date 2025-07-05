import { useEffect, useState, useCallback } from "react";
import API from "@/lib/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Film, Filter } from "lucide-react";

// Updated Movie type to match API response
type Movie = {
  id: number;
  name: string;
  description: string;
  trailer: string;
  poster: string;
  language: string;
};

// API Response type for paginated results
type MoviesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Movie[];
};

// Filter state type
type FilterState = {
  search: string;
  genres_name: string;
  directors_name: string;
  actors_name: string;
  language_name: string;
};

type PaginationInfo = {
  count: number;
  next: string | null;
  previous: string | null;
  current_page: number;
  total_pages: number;
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
    current_page: 1,
    total_pages: 1,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    genres_name: '',
    directors_name: '',
    actors_name: '',
    language_name: ''
  });

  // Debounced search to avoid too many API calls
  const [searchDebounce, setSearchDebounce] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(filters.search);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters.search]);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    // Pagination
    params.append('page', currentPage.toString());
    params.append('page_size', pageSize.toString());
    
    // Filters
    const effectiveFilters = { ...filters, search: searchDebounce };
    Object.entries(effectiveFilters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.append(key, value.trim());
      }
    });
    
    return params.toString();
  }, [currentPage, pageSize, filters, searchDebounce]);

  const fetchMovies = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching movies with params:", buildQueryParams());
      
      const res = await API.get(`/movies/?${buildQueryParams()}`);
      console.log("API Response:", res);
      
      if (res.data) {
        // Handle paginated response
        if (res.data.results && Array.isArray(res.data.results)) {
          const paginatedData = res.data as MoviesResponse;
          setMovies(paginatedData.results);
          setPagination({
            count: paginatedData.count || 0,
            next: paginatedData.next,
            previous: paginatedData.previous,
            current_page: currentPage,
            total_pages: Math.ceil((paginatedData.count || 0) / pageSize),
          });
        } else if (Array.isArray(res.data)) {
          // Handle direct array response (fallback)
          setMovies(res.data);
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
      console.error("Error fetching movies", err);
      
      if (err.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("Access denied.");
      } else if (err.response?.status === 404) {
        toast.error("Movies endpoint not found. Please check the API configuration.");
      } else if (err.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(`Error loading movies: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryParams, currentPage, pageSize]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      genres_name: '',
      directors_name: '',
      actors_name: '',
      language_name: ''
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

  // Pagination render function - matches Users page
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
          <div className="text-lg">Loading movies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Film className="h-8 w-8 text-[#f6d33d]" />
          <h1 className="text-3xl font-bold text-[#f6d33d]">
            Movies ({pagination.count})
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
              <Label>Search Movies</Label>
              <Input
                placeholder="Search by name or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Genre Filter */}
            <div>
              <Label>Genre</Label>
              <Input
                placeholder="e.g., Action, Comedy..."
                value={filters.genres_name}
                onChange={(e) => handleFilterChange('genres_name', e.target.value)}
              />
            </div>

            {/* Director Filter */}
            <div>
              <Label>Director</Label>
              <Input
                placeholder="e.g., Christopher Nolan..."
                value={filters.directors_name}
                onChange={(e) => handleFilterChange('directors_name', e.target.value)}
              />
            </div>

            {/* Actor Filter */}
            <div>
              <Label>Actor</Label>
              <Input
                placeholder="e.g., Tom Hanks..."
                value={filters.actors_name}
                onChange={(e) => handleFilterChange('actors_name', e.target.value)}
              />
            </div>

            {/* Language Filter */}
            <div>
              <Label>Language</Label>
              <Input
                placeholder="e.g., English, Spanish..."
                value={filters.language_name}
                onChange={(e) => handleFilterChange('language_name', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Page Size Selector */}
      <div className="bg-white rounded-lg border border-yellow-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.count)} of {pagination.count} movies
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
                <SelectItem value="96">96</SelectItem>
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

      {/* Movies Grid */}
      {movies.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-gray-500">
          No movies found matching your criteria
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          
          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
}

// Movie card component with proper TypeScript props
interface MovieCardProps {
  movie: Movie;
}

function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="rounded-2xl shadow-xl border border-yellow-200 p-5 bg-white hover:scale-[1.01] transition-transform duration-200">
      {/* Movie poster */}
      {movie.poster && (
        <div className="mb-4">
          <img
            src={movie.poster}
            alt={movie.name}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              // Hide broken images
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900">{movie.name}</h2>
        
        <p className="text-sm text-gray-600 line-clamp-3">
          {movie.description}
        </p>
        
        {movie.language && (
          <p className="text-sm text-gray-500">
            <span className="font-medium">Language:</span> {movie.language}
          </p>
        )}
        
        {movie.trailer && (
          <div className="pt-2">
            <a
              href={movie.trailer}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-full hover:bg-yellow-200 transition-colors"
            >
              🎬 Watch Trailer
            </a>
          </div>
        )}
      </div>
    </div>
  );
}