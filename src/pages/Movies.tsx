// src/pages/MoviesPage.tsx
import { useEffect, useState } from "react";
import API from "@/lib/services/api";
import { toast } from "sonner";

type Movie = {
  id: number;
  title: string;
  description: string;
  rating: number;
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    API.get("/movie/list/")
      .then((res) => setMovies(res.data))
      .catch((err) => {
        console.error("Fetch movies error:", err);
        toast.error("Failed to load movies");
      });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#f6d33d] mb-4">Movies</h1>
      <ul className="space-y-4">
        {movies.map((movie) => (
          <li key={movie.id} className="border p-4 rounded bg-white">
            <h2 className="text-xl font-semibold">{movie.title}</h2>
            <p className="text-sm">{movie.description}</p>
            <p className="text-sm text-yellow-700">Rating: {movie.rating}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
