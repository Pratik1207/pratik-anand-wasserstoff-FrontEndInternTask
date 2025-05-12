import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import { db } from "../firebase/firebase.ts";
import { ref, onValue, set, update, remove } from "firebase/database";
import debounce from "lodash.debounce";
import "react-quill/dist/quill.snow.css";

// This component receives the current user's name and color
interface Props {
  username: string;
  color: string;
}

const Editor = ({ username, color }: Props) => {
  // This state holds the current editor content
  const [value, setValue] = useState<string>("");

  // This state tracks the list of users who are actively typing
  const [editingUsers, setEditingUsers] = useState<{ username: string; color: string }[]>([]);

  // We use this to prevent conflicting content updates during typing
  const isTyping = useRef<boolean>(false);

  // Firebase paths: one for the text itself, one for activity tracking
  const editorRef = ref(db, "editor");
  const activityRef = ref(db, "editor/activity");

  //  Load the editor content from Firebase when the component mounts
  useEffect(() => {
    const unsubscribe = onValue(editorRef, (snapshot) => {
      const data = snapshot.val();

      // Only update the local editor if we're not currently typing
      if (data?.text !== undefined && !isTyping.current) {
        setValue(data.text);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  //  Keep track of which users are currently editing in real-time
  useEffect(() => {
    const unsubscribe = onValue(activityRef, (snapshot) => {
      const data = snapshot.val();
      const now = Date.now();
      const active: { username: string; color: string }[] = [];

      if (data) {
        Object.entries(data).forEach(([_, value]: any) => {
          const lastTyped = new Date(value.timestamp).getTime();

          // If user has typed in the last 5 seconds and it's not me
          if (now - lastTyped < 5000 && value.username !== username) {
            active.push({
              username: value.username,
              color: value.color || "black",
            });
          }
        });
      }

      setEditingUsers(active); // Update UI with active users
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [username]);

  //  Debounced function to send data to Firebase (runs 300ms after last keystroke)
  const updateText = useRef(
    debounce((content: string) => {
      const now = new Date().toISOString();

      // Save the updated text to the main editor path
      set(editorRef, {
        text: content,
        editedBy: username,
        editedAt: now,
      });

      // Update this user's "currently typing" status
      update(activityRef, {
        [username.toLowerCase()]: {
          username,
          color,
          timestamp: now,
        },
      });

      // Automatically remove activity after 6 seconds of inactivity
      setTimeout(() => {
        remove(ref(db, `editor/activity/${username.toLowerCase()}`));
      }, 6000);

      isTyping.current = false;
    }, 300)
  ).current;

  // 🖊️ When the content in the editor changes (user is typing)
  const handleChange = (content: string) => {
    setValue(content);         // Update local editor state
    isTyping.current = true;   // Prevent overwriting during active typing
    updateText(content);       // Trigger debounced update to Firebase
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        Editing as: <span style={{ color }}>{username}</span>
      </h2>

      {/* Main text editor */}
      <ReactQuill value={value} onChange={handleChange} theme="snow" />

      {/* Display who else is typing, with unique colors */}
      {editingUsers.length > 0 && (
        <p className="mt-4 text-sm">
          {" "}
          {editingUsers.map((user, idx) => (
            <span key={idx} style={{ color: user.color, fontWeight: 500 }}>
              {user.username}
              {idx < editingUsers.length - 1 ? " and " : ""}
            </span>
          ))}{" "}
          {editingUsers.length > 1 ? "are" : "is"} typing...
        </p>
      )}
    </div>
  );
};

export default Editor;
