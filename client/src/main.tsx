import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Font Awesome
const fontAwesomeScript = document.createElement('script');
fontAwesomeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js';
fontAwesomeScript.defer = true;
document.head.appendChild(fontAwesomeScript);

// Add Google Fonts
const googleFontsLink = document.createElement('link');
googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
googleFontsLink.rel = 'stylesheet';
document.head.appendChild(googleFontsLink);

createRoot(document.getElementById("root")!).render(<App />);
