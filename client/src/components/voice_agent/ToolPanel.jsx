import { useEffect, useState } from "react";

const functionDescription = `
Call this function when a user asks to find a hotel.
`;

const sessionUpdate = {
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "display_color_palette",
        description: functionDescription,
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
        name: "console_print",
        description: "Print a message to the console when the user asks to print something.",
        parameters: {
          type: "object",
          strict: true,
          properties: {
            message: {
              type: "string",
              description: "The message to print to the console",
            }
          },
          required: ["message"]
        }
      }
    ],
    tool_choice: "auto",
  },
};

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
}) {
  const [functionAdded, setFunctionAdded] = useState(false);
  const [functionCallOutput, setFunctionCallOutput] = useState(null);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const firstEvent = events[events.length - 1];
    if (!functionAdded && firstEvent.type === "session.created") {
      sendClientEvent(sessionUpdate);
      setFunctionAdded(true);
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
                  instructions: `
                  ask for feedback about the color palette - don't repeat 
                  the colors, just ask if they like the colors.
                `,
                },
              });
            }, 500);
          } else if (output.name === "console_print") {
            const { message } = JSON.parse(output.arguments);
            console.log("Voice Agent says:", message);
            setTimeout(() => {
              sendClientEvent({
                type: "response.create",
                response: {
                  instructions: "Ask if they want to print something else.",
                },
              });
            }, 500);
          }
        }
      });
    } 
  }, [events]);

  useEffect(() => {
    if (!isSessionActive) {
      setFunctionAdded(false);
      setFunctionCallOutput(null);
    }
  }, [isSessionActive]);

  return (
   <div>
   
   </div>
  );
}
