import { Hotel } from './types';

export const hotelData: Hotel[] = [
  {
    id: 1,
    name: "Parkview Residence Munich",
    location: {
      area: "City Center",
      distanceToCenter: "0.8 km to main square",
      address: "Maximilianstrasse 17, City Center, 80539 Munich, Germany",
      nearbyAttractions: [
        "Residenz Palace (0.4 km)",
        "Hofgarten (0.5 km)",
        "Nationaltheater (0.6 km)",
        "Viktualienmarkt (0.9 km)"
      ],
      coordinates: {
        lat: 48.1371,
        lng: 11.5754
      }
    },
    price: 215,
    rating: 4.8,
    reviewCount: 324,
    description: "Parkview Residence Munich is an elegant hotel located in the heart of Munich's city center. The hotel offers a peaceful retreat from the bustling city with its soundproofed rooms and strategic location on a quiet side street, just minutes from major attractions.\n\nEach room is designed with comfort in mind, featuring premium bedding, blackout curtains, and noise-reducing windows to ensure a restful stay. The hotel prides itself on its exceptional breakfast buffet, which includes both traditional Bavarian specialties and international options.\n\nPet owners will appreciate the thoughtful amenities provided for their furry companions, including pet beds, bowls, and a welcome treat. The hotel's underground parking facility offers convenient and secure parking for guests arriving by car.",
    shortDescription: "Elegant hotel with soundproofed rooms, gourmet breakfast buffet, and underground parking in the heart of Munich.",
    amenities: ["Pet friendly", "Parking", "Breakfast", "Quiet rooms", "Free high-speed WiFi", "Air conditioning", "24/7 concierge", "Premium bedding"],
    images: {
      main: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1544097935-e6b0ea370f19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      ]
    },
    matchPercentage: 95
  },
  {
    id: 2,
    name: "Grand Palace Hotel",
    location: {
      area: "Maxvorstadt",
      distanceToCenter: "1.2 km to city center",
      address: "Leopoldstrasse 45, Maxvorstadt, 80802 Munich, Germany",
      nearbyAttractions: [
        "Pinakothek der Moderne (0.5 km)",
        "Alte Pinakothek (0.6 km)",
        "Odeonsplatz (0.9 km)",
        "English Garden (1.1 km)"
      ],
      coordinates: {
        lat: 48.1521,
        lng: 11.5817
      }
    },
    price: 249,
    rating: 4.6,
    reviewCount: 278,
    description: "Grand Palace Hotel is a luxurious 5-star establishment that combines elegant design with modern amenities. Located in the cultural district of Maxvorstadt, the hotel offers easy access to Munich's famous museums and the English Garden.\n\nThe spacious rooms feature high ceilings, marble bathrooms, and premium furnishings to ensure maximum comfort for guests. The award-winning breakfast is served in a beautiful winter garden setting, offering an extensive selection of fresh, locally-sourced ingredients.\n\nPet owners will find the hotel especially accommodating, with special pet amenities including walking services and pet-friendly dining areas. Valet parking is available for guests arriving by car, making arrival and departure hassle-free.",
    shortDescription: "Luxurious 5-star hotel with spacious rooms, award-winning breakfast, and special pet amenities.",
    amenities: ["Pet friendly", "Valet parking", "Gourmet breakfast", "Spa", "Fitness center", "Room service", "Concierge", "Business center"],
    images: {
      main: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ]
    },
    matchPercentage: 88
  },
  {
    id: 3,
    name: "Quiet Haven Boutique Hotel",
    location: {
      area: "Lehel",
      distanceToCenter: "0.5 km to city center",
      address: "Praterinsel 5, Lehel, 80538 Munich, Germany",
      nearbyAttractions: [
        "Isartor (0.3 km)",
        "Deutsches Museum (0.6 km)",
        "Marienplatz (0.7 km)",
        "Bavarian State Opera (0.8 km)"
      ],
      coordinates: {
        lat: 48.1351,
        lng: 11.5820
      }
    },
    price: 189,
    rating: 4.9,
    reviewCount: 156,
    description: "Quiet Haven Boutique Hotel is a charming establishment located in the peaceful Lehel district, just a short walk from Munich's city center. The hotel is housed in a renovated 19th-century building that combines historic charm with modern comfort.\n\nThe boutique hotel features individually designed rooms, each with unique décor and high-quality soundproofing to ensure a peaceful stay. The garden courtyard provides a tranquil oasis in the middle of the city where guests can relax and enjoy the complimentary afternoon tea.\n\nThe hotel's breakfast is a highlight, featuring organic and locally-sourced ingredients, with many vegan and gluten-free options available. Pet owners will appreciate the pet-friendly policies, with special amenities for four-legged guests and nearby walking areas.",
    shortDescription: "Charming boutique hotel in a quiet side street with organic breakfast options and a peaceful garden courtyard.",
    amenities: ["Pet friendly", "Parking", "Breakfast", "Soundproof", "Garden", "Free WiFi", "Bike rental", "Afternoon tea service"],
    images: {
      main: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1587985064135-0366536eab42?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ]
    },
    matchPercentage: 92
  },
  {
    id: 4,
    name: "Marienplatz Suites",
    location: {
      area: "City Center",
      distanceToCenter: "0.2 km to Marienplatz",
      address: "Rindermarkt 10, City Center, 80331 Munich, Germany",
      nearbyAttractions: [
        "New Town Hall (0.2 km)",
        "St. Peter's Church (0.3 km)",
        "Viktualienmarkt (0.4 km)",
        "Frauenkirche (0.5 km)"
      ],
      coordinates: {
        lat: 48.1369,
        lng: 11.5753
      }
    },
    price: 195,
    rating: 4.5,
    reviewCount: 207,
    description: "Marienplatz Suites offers modern apartment-style accommodations in the very heart of Munich, just steps away from the famous Marienplatz. These stylish suites combine the services of a hotel with the space and comfort of a private apartment.\n\nEach suite features a fully equipped kitchenette, separate living area, and premium bedding to ensure a comfortable stay. The windows are well-insulated to minimize noise from the bustling square below, though some ambient city sounds may still be noticeable.\n\nA delicious breakfast is available either in the breakfast room or delivered to your suite at your preferred time. While the hotel itself doesn't have parking, it has partnered with a nearby garage to offer guests discounted rates. Pet owners will find the suites very accommodating, with special welcome amenities for four-legged guests.",
    shortDescription: "Modern suites in the heart of Munich with kitchenettes, premium bedding, and excellent breakfast options.",
    amenities: ["Pet friendly", "Nearby parking", "Breakfast", "Kitchenette", "Laundry service", "Free WiFi", "Smart TV", "Daily housekeeping"],
    images: {
      main: "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1551105378-80f9a5a3f734?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ]
    },
    matchPercentage: 85
  },
  {
    id: 5,
    name: "Englischer Garten Inn",
    location: {
      area: "Schwabing",
      distanceToCenter: "1.5 km to city center",
      address: "Feilitzschstrasse 25, Schwabing, 80802 Munich, Germany",
      nearbyAttractions: [
        "English Garden (0.2 km)",
        "Monopteros (0.7 km)",
        "Chinese Tower (1.1 km)",
        "Eisbach Wave (1.3 km)"
      ],
      coordinates: {
        lat: 48.1517,
        lng: 11.5930
      }
    },
    price: 165,
    rating: 4.3,
    reviewCount: 182,
    description: "Englischer Garten Inn is a cozy, family-run hotel located on the edge of Munich's famous English Garden. This charming property offers a peaceful retreat from the city while maintaining easy access to the center via nearby public transportation.\n\nThe hotel features comfortable rooms decorated in a traditional Bavarian style with modern amenities. While the property doesn't have its own restaurant, it serves a simple continental breakfast, and there are many excellent dining options within walking distance.\n\nOne of the main advantages of this hotel is its free parking lot, a rarity in Munich. The hotel is extremely pet-friendly, with no additional charges for pets and easy access to the English Garden for walks. The surrounding neighborhood of Schwabing is known for its bohemian atmosphere, art galleries, and cafes.",
    shortDescription: "Cozy, pet-friendly hotel next to the English Garden with free parking and traditional Bavarian charm.",
    amenities: ["Pet friendly", "Free parking", "Continental breakfast", "Garden terrace", "Bicycle rental", "Free WiFi", "Family rooms", "Luggage storage"],
    images: {
      main: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1519974719765-e6559eac2575?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1579488803416-8e4960ca091a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1587716839025-5960084fa5d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ]
    },
    matchPercentage: 78
  },
  {
    id: 6,
    name: "Quiet Comfort Hotel",
    location: {
      area: "Haidhausen",
      distanceToCenter: "1.0 km to city center",
      address: "Orleansplatz 6A, Haidhausen, 81667 Munich, Germany",
      nearbyAttractions: [
        "Gasteig Cultural Center (0.4 km)",
        "Maximilianeum (0.7 km)",
        "Deutsches Museum (0.9 km)",
        "Isar River Promenade (0.3 km)"
      ],
      coordinates: {
        lat: 48.1371,
        lng: 11.5954
      }
    },
    price: 175,
    rating: 4.7,
    reviewCount: 219,
    description: "Quiet Comfort Hotel is located in the trendy district of Haidhausen, often referred to as the 'French Quarter' of Munich. The hotel occupies a beautifully restored 19th-century building that combines historic architecture with contemporary interior design.\n\nThe hotel is renowned for its exceptionally quiet rooms, which feature triple-glazed windows, noise-absorbing walls, and premium bedding to ensure a peaceful night's sleep. Each room is equipped with individual climate control and blackout curtains for maximum comfort.\n\nThe breakfast buffet offers a wide selection of hot and cold items, with many organic and locally-sourced options. The hotel's location next to Ostbahnhof station provides excellent public transport connections to all parts of Munich and beyond. Pet-friendly policies make this a great choice for travelers with animal companions.",
    shortDescription: "Tranquil hotel in the trendy Haidhausen district with triple-glazed windows and organic breakfast options.",
    amenities: ["Pet friendly", "Breakfast", "Soundproof rooms", "Climate control", "Reading lounge", "Free WiFi", "Tea station", "Bike rental"],
    images: {
      main: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1549638441-b787d2e11f14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1610392148030-9be3cc4fd176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ]
    },
    matchPercentage: 82
  }
];
