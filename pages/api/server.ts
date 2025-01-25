import type { NextApiRequest, NextApiResponse } from 'next';

var SpotifyWebApi = require('spotify-web-api-node');
type ErrorResponse = {
  error: string;
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
    // Get Access Token
    const spotifyApi = new SpotifyWebApi(
      {
        clientId: client_id,
        clientSecret: client_secret,
      }
    );

    const dataToken = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(dataToken.body.access_token);

    // search playlists for "Top 50 - [Country]"
    const country = "United Kingdom";
    const playlistName = `Top 50 - ${country}`;
    const data = await spotifyApi.search(playlistName, ['playlist'], { limit: 15 });
    
    

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
