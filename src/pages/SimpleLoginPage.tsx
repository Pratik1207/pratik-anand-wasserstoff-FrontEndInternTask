import { useState, useEffect } from "react";
import Editor from "./Editor";

const SimpleLoginPage = () => {
  // Stores the name entered by the user
  const [username, setUsername] = useState<string>("");

  // Tracks whether the user has submitted their name
  const [hasEntered, setHasEntered] = useState<boolean>(false);

  // Holds the randomly assigned color for the current user
  const [userColor, setUserColor] = useState<string>("");

  // Assign a unique color to the user once when the component loads
  useEffect(() => {
    const hue = Math.floor(Math.random() * 360); // generate a hue
    const color = `hsl(${hue}, 70%, 50%)`; // create the unique color
    setUserColor(color);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {!hasEntered ? (
        <div className="p-6 bg-white rounded shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Enter your name to continue</h2>

          {/* Input field to store user's name */}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Anand"
            className="border px-3 py-2 w-full rounded mb-4"
          />

          {/* the button will only work if the entered name in not empty */}
          <button
            onClick={() => setHasEntered(true)}
            disabled={username.trim() === ""}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Enter
          </button>
        </div>
      ) : (
        // Once entered, it will load the editor with data
        <Editor username={username} color={userColor} />
      )}
    </div>
  );
};

export default SimpleLoginPage;
