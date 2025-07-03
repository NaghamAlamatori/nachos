import { useEffect, useState, useCallback } from "react";
import API from "@/lib/services/api";
import { toast } from "sonner";

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

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(12); // Fixed page size
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

  const fetchMovies = useCallback(async (page: number = 1, currentFilters: FilterState = filters) => {
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
      if (currentFilters.genres_name.trim()) {
        params.append('genres_name', currentFilters.genres_name.trim());
      }
      if (currentFilters.directors_name.trim()) {
        params.append('directors_name', currentFilters.directors_name.trim());
      }
      if (currentFilters.actors_name.trim()) {
        params.append('actors_name', currentFilters.actors_name.trim());
      }
      if (currentFilters.language_name.trim()) {
        params.append('language_name', currentFilters.language_name.trim());
      }

      const queryString = params.toString();
      const endpoint = `/movies/${queryString ? '?' + queryString : ''}`;
      
      console.log("Fetching movies with endpoint:", endpoint);
      
      const res = await API.get(endpoint);
      console.log("API Response:", res);
      
      // Handle different response formats
      if (res.data) {
        if (Array.isArray(res.data)) {
          // Simple array response (non-paginated)
          setMovies(res.data);
          setTotalCount(res.data.length);
          console.log("Set movies directly:", res.data.length);
        } else if (res.data.results && Array.isArray(res.data.results)) {
          // Paginated response
          const paginatedData = res.data as MoviesResponse;
          setMovies(paginatedData.results);
          setTotalCount(paginatedData.count || paginatedData.results.length);
          console.log("Set movies from paginated results:", paginatedData.results.length);
        } else if (res.data.data && Array.isArray(res.data.data)) {
          // Wrapped response
          setMovies(res.data.data);
          setTotalCount(res.data.count || res.data.data.length);
          console.log("Set movies from wrapped data:", res.data.data.length);
        } else {
          console.error("Unexpected response format:", res.data);
          toast.error("Unexpected response format");
        }
      } else {
        console.error("No data in response");
        toast.error("No data received");
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
  }, [pageSize, filters]);

  // Fetch movies when page changes or search debounce updates
  useEffect(() => {
    const effectiveFilters = { ...filters, search: searchDebounce };
    fetchMovies(currentPage, effectiveFilters);
  }, [currentPage, searchDebounce, fetchMovies]);

  // Reset to page 1 when filters change (except search which is debounced)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      const effectiveFilters = { ...filters, search: searchDebounce };
      fetchMovies(1, effectiveFilters);
    }
  }, [filters.genres_name, filters.directors_name, filters.actors_name, filters.language_name]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      genres_name: '',
      directors_name: '',
      actors_name: '',
      language_name: ''
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

  if (isLoading && movies.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading movies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-[#f6d33d] mb-6">
        Movies ({totalCount})
      </h1>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Movies
            </label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6d33d] focus:border-transparent"
            />
          </div>

          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genre
            </label>
            <input
              type="text"
              placeholder="e.g., Action, Comedy..."
              value={filters.genres_name}
              onChange={(e) => handleFilterChange('genres_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6d33d] focus:border-transparent"
            />
          </div>

          {/* Director Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Director
            </label>
            <input
              type="text"
              placeholder="e.g., Christopher Nolan..."
              value={filters.directors_name}
              onChange={(e) => handleFilterChange('directors_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6d33d] focus:border-transparent"
            />
          </div>

          {/* Actor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actor
            </label>
            <input
              type="text"
              placeholder="e.g., Tom Hanks..."
              value={filters.actors_name}
              onChange={(e) => handleFilterChange('actors_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6d33d] focus:border-transparent"
            />
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <input
              type="text"
              placeholder="e.g., English, Spanish..."
              value={filters.language_name}
              onChange={(e) => handleFilterChange('language_name', e.target.value)}
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

      {/* Movies Grid */}
      {movies.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-gray-500">
          No movies found. Try adjusting your search or filters.
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