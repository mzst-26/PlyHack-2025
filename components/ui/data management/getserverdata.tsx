import { useEffect, useState } from 'react';

// Define TypeScript interfaces for the data structure
interface Playlist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
}

interface ApiResponse {
  playlists: {
    items: Playlist[];
  };
}

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const response = await fetch('/api/spotify'); // Adjust path if needed
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json(); // Type the response
        setPlaylists(data.playlists.items || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPlaylists();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Top Playlists</h1>
      <ul>
        {playlists.map((playlist) => (
          <li key={playlist.id}>
            <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
              {playlist.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
