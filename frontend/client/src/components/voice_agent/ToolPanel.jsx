import { useEffect, useState } from "react";

const sessionUpdate = {
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "display_color_palette",
        description: "Display a color palette based on a theme when the user asks for color suggestions.",
        parameters: {
          type: "object",
          strict: true,
          properties: {
            theme: {
              type: "string",
              description: "Description of the theme for the color scheme.",
            },
            colors: {
              type: "array",
              description: "Array of five hex color codes based on the theme.",
              items: {
                type: "string",
                description: "Hex color code",
              },
            },
          },
          required: ["theme", "colors"],
        },
      },
      {
        type: "function",
        name: "select_destination",
        description: "Select a destination for the travel search when the user specifies a city.",
        parameters: {
          type: "object",
          strict: true,
          properties: {
            city: {
              type: "string",
              description: "The destination city selected by the user. Should be one of: Mallorca, Kopenhagen, New York.",
              enum: ["Mallorca", "Kopenhagen", "New York"]
            }
          },
          required: ["city"]
        }
      },
      {
        type: "function",
        name: "select_dates",
        description: "Select travel dates for the hotel search when the user specifies dates.",
        parameters: {
          type: "object",
          strict: true,
          properties: {
            startDate: {
              type: "string",
              description: "The start date in ISO format (YYYY-MM-DD)."
            },
            endDate: {
              type: "string",
              description: "The end date in ISO format (YYYY-MM-DD)."
            }
          },
          required: ["startDate", "endDate"]
        }
      },
      {
        type: "function",
        name: "search_hotels",
        description: "Search for hotels based on user requirements and previously selected destination.",
        parameters: {
          type: "object",
          strict: true,
          properties: {
            requirements: {
              type: "string",
              description: "The user's requirements for the hotel (e.g., pool, breakfast, etc.)"
            }
          },
          required: ["requirements"]
        }
      }
    ],
    tool_choice: "auto",
  },
};

function mapHotelsData(rawHotels) {
  return Object.entries(rawHotels).map(([name, raw]) => {
    const amenityKeys = Object.keys(raw).filter(key => raw[key] === 1);
    const amenities = amenityKeys.map(key => key.replace(/_/g, ' '));

    return {
      id: raw.clusterid,
      name,
      location: {
        area: raw.locationname || "Unknown",
        distanceToCenter: `${raw.distancetocity ?? 'N/A'} km`,
        address: "Address not provided", // Placeholder
        nearbyAttractions: [
          raw.distancetobeach ? `Beach (${raw.distancetobeach} km)` : '',
          raw.distancetocity ? `City center (${raw.distancetocity} km)` : ''
        ].filter(Boolean),
        coordinates: {
          lat: 0,
          lng: 0
        }
      },
      price: raw.price,
      rating: raw.rating,
      reviewCount: raw.ratingscount,
      description: `A ${raw.starcategory}-star all-inclusive aparthotel in ${raw.locationname}, ${raw.distancetocity} km from the center and ${raw.distancetobeach} km from the beach.`,
      shortDescription: `${raw.starcategory}-star all-inclusive stay near beach and city center.`,
      amenities,
      images: {
        main: "https://example.com/image.jpg", // Placeholder
        gallery: [
          "https://example.com/gallery1.jpg",
          "https://example.com/gallery2.jpg"
        ]
      },
      matchPercentage: raw.ltr_score ? Math.round(raw.ltr_score * 10000) / 100 : undefined
    };
  });
}

function FunctionCallOutput({ functionCallOutput }) {
  const { theme, colors } = JSON.parse(functionCallOutput.arguments);

  const colorBoxes = colors.map((color) => (
    <div
      key={color}
      className="w-full h-16 rounded-md flex items-center justify-center border border-gray-200"
      style={{ backgroundColor: color }}
    >
      <p className="text-sm font-bold text-black bg-slate-100 rounded-md p-2 border border-black">
        {color}
      </p>
    </div>
  ));

  return (
    <div className="flex flex-col gap-2">
      <p>Theme: {theme}</p>
      {colorBoxes}
      <pre className="text-xs bg-gray-100 rounded-md p-2 overflow-x-auto">
        {JSON.stringify(functionCallOutput, null, 2)}
      </pre>
    </div>
  );
}

export default function ToolPanel({
  isSessionActive,
  sendClientEvent,
  events,
  onHotelsFetched,
}) {
  const [functionAdded, setFunctionAdded] = useState(false);
  const [functionCallOutput, setFunctionCallOutput] = useState(null);
  const [conversationStep, setConversationStep] = useState('destination');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null
  });
  const [hotelRequirements, setHotelRequirements] = useState(null);

  const fetchHotels = async (query, destination) => {
    try {
      const response = await fetch(`http://localhost:8000/hotels?query=${encodeURIComponent(query)}&city=${encodeURIComponent(destination)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      let mappedHotels = mapHotelsData(data);
      
      // Store the mapped hotels in sessionStorage
      sessionStorage.setItem('searchResults', JSON.stringify(mappedHotels));
      
      onHotelsFetched(mappedHotels || []);

      // Send a follow-up prompt
      setTimeout(() => {
        sendClientEvent({
          type: "response.create",
          response: {
            instructions: "Tell the user you found some hotels that match their requirements and ask if they would like to refine their search.",
          },
        });
      }, 500);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  useEffect(() => {
    if (!events || events.length === 0) return;

    const firstEvent = events[events.length - 1];
    if (!functionAdded && firstEvent.type === "session.created") {
      sendClientEvent(sessionUpdate);
      setFunctionAdded(true);
      
      // Initialize the conversation by asking for the destination
      setTimeout(() => {
        sendClientEvent({
          type: "response.create",
          response: {
            instructions: "Welcome the user and ask which city they would like to visit. Mention the available options are Mallorca, Kopenhagen, and New York.",
          },
        });
      }, 500);
    }

    const mostRecentEvent = events[0];
    if (
      mostRecentEvent.type === "response.done" &&
      mostRecentEvent.response.output
    ) {
      mostRecentEvent.response.output.forEach((output) => {
        if (output.type === "function_call") {
          if (output.name === "display_color_palette") {
            setFunctionCallOutput(output);
            setTimeout(() => {
              sendClientEvent({
                type: "response.create",
                response: {
                  instructions: "Ask for feedback about the color palette - don't repeat the colors, just ask if they like the colors.",
                },
              });
            }, 500);
          } else if (output.name === "select_destination") {
            const { city } = JSON.parse(output.arguments);
            setSelectedDestination(city);
            setConversationStep('dates');
            
            setTimeout(() => {
              sendClientEvent({
                type: "response.create",
                response: {
                  instructions: `Confirm to the user that they've selected ${city} as their destination. Now ask them for their travel dates. Tell them to provide a start date and end date.`,
                },
              });
            }, 500);
          } else if (output.name === "select_dates") {
            const { startDate, endDate } = JSON.parse(output.arguments);
            setSelectedDates({ startDate, endDate });
            setConversationStep('requirements');
            
            setTimeout(() => {
              sendClientEvent({
                type: "response.create",
                response: {
                  instructions: `Confirm to the user that you've recorded their travel dates from ${startDate} to ${endDate}. Now ask them if they have any specific requirements for the hotel, such as a pool, breakfast included, or being pet-friendly.`,
                },
              });
            }, 500);
          } else if (output.name === "search_hotels") {
            const { requirements } = JSON.parse(output.arguments);
            setHotelRequirements(requirements);
            
            // Trigger the hotel search
            if (selectedDestination) {
              fetchHotels(requirements, selectedDestination);
            }
          }
        }
      });
    } 
  }, [events, functionAdded, selectedDestination]);

  useEffect(() => {
    if (!isSessionActive) {
      setFunctionAdded(false);
      setFunctionCallOutput(null);
      setConversationStep('destination');
      setSelectedDestination(null);
      setSelectedDates({
        startDate: null,
        endDate: null
      });
      setHotelRequirements(null);
    }
  }, [isSessionActive]);

  return (
   <div>
     {/* This is an empty div but will be used to communicate with the voice agent */}
   </div>
  );
}
