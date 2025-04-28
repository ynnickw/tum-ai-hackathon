export interface Hotel {
  id: number;
  name: string;
  location: {
    area: string;
    distanceToCenter: string;
    address: string;
    nearbyAttractions: string[];
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  shortDescription: string;
  amenities: string[];
  images: {
    main: string;
    gallery: string[];
  };
  matchPercentage?: number;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export type ViewMode = 'list' | 'map';
