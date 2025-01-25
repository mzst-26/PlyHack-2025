import type { NextApiRequest, NextApiResponse } from 'next';
import SpotifyWebApi from 'spotify-web-api-js';

type ErrorResponse = {
  error: string;
};

type SpotifyTokenResponse = {
  access_token: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
): Promise<void> {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  const grant_type = 'client_credentials';
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return res
      .status(500)
      .json({ error: 'Missing Spotify credentials in environment variables.' });
  }

  try {
    // Fetch Spotify Access Token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return res
        .status(tokenResponse.status)
        .json({ error: `Failed to fetch token: ${errorText}` });
    }

    const { access_token }: SpotifyTokenResponse = await tokenResponse.json();

    // Initialize Spotify API Client
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(access_token);

    // Fetch Top Playlists
    const data = await spotifyApi.getCategoryPlaylists('toplists', {
      country: 'GB',
      limit: 10,
      offset: 0,
    });

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
