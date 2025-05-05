// YouTube API service for fetching educational videos
// This service handles interactions with the YouTube Data API v3

// IMPORTANT: In a production environment, API keys should NEVER be stored in client-side code.
// This implementation is for demonstration purposes only.
// In a real application, API requests should be proxied through a secure backend service.

// Define the API key in a way that's not directly accessible
// For a real application, this should be stored in environment variables on the server
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

// Types for API responses
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
}

interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: {
          url: string;
        };
      };
      channelTitle: string;
      publishedAt: string;
    };
  }>;
}

interface YouTubeVideoResponse {
  items: Array<{
    statistics: {
      viewCount: string;
    };
  }>;
}

// Create a class to handle YouTube API interactions
export class YouTubeAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  // Search for videos related to a query
  public async searchVideos(query: string, maxResults: number = 5): Promise<YouTubeVideo[]> {
    try {
      // Add educational keywords to the query to get better results
      const enhancedQuery = `${query} tutorial educational`;
      
      // Make the search request
      const searchUrl = `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(enhancedQuery)}&maxResults=${maxResults}&type=video&relevanceLanguage=en&key=${this.apiKey}`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        throw new Error(`YouTube API search error: ${searchResponse.statusText}`);
      }
      
      const searchData: YouTubeSearchResponse = await searchResponse.json();
      
      // Extract video IDs for getting additional details
      const videoIds = searchData.items.map(item => item.id.videoId).join(',');
      
      // Get video statistics
      const videoUrl = `${this.baseUrl}/videos?part=statistics&id=${videoIds}&key=${this.apiKey}`;
      const videoResponse = await fetch(videoUrl);
      
      if (!videoResponse.ok) {
        throw new Error(`YouTube API video error: ${videoResponse.statusText}`);
      }
      
      const videoData: YouTubeVideoResponse = await videoResponse.json();
      
      // Combine search and video data
      return searchData.items.map((item, index) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
        viewCount: videoData.items[index]?.statistics.viewCount
      }));
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      return [];
    }
  }

  // Get the embed URL for a video
  public getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Get the watch URL for a video
  public getWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}

// Create and export a singleton instance for use throughout the application
export const youtubeAPI = new YouTubeAPI();
