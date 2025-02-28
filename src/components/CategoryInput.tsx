import React, { useState } from "react";

interface CategoryInputProps {
  onSave: (name: string) => void;
}

export const CategoryInput: React.FC<CategoryInputProps> = ({ onSave }) => {
  const [categoryName, setCategoryName] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCategoryName(transcript);
    };
    recognition.onend = () => setIsListening(false);
  };

  return (
    <div className="p-4">
      <label className="block mb-2">
        Category Name:
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="border p-2 w-full"
        />
      </label>
      <button
        onClick={handleVoiceInput}
        className={`p-2 rounded ${isListening ? "bg-red-500" : "bg-blue-500"} text-white`}
      >
        {isListening ? "Listening..." : "🎤 Use Voice"}
      </button>
      <button
        onClick={() => onSave(categoryName)}
        className="ml-4 p-2 bg-green-500 text-white rounded"
      >
        Save
      </button>
    </div>
  );
};
