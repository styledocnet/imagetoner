import React, { useState } from "react";
import { Note, InstrumentType } from "@/types/audio";

// iterating over the InstrumentType enum
const instrumentOptions: InstrumentType[] = Object.values(InstrumentType);

interface AddNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (note: Note) => void;
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({ isOpen, onClose, onAdd }) => {
  const [time, setTime] = useState(0);
  const [pitch, setPitch] = useState("C4");
  const [duration, setDuration] = useState(1);
  const [instrument, setInstrument] = useState<InstrumentType>(InstrumentType.Sawtooth);

  if (!isOpen) return null;

  const generateId = (): string => {
    return `note-${Math.random().toString(36).substr(2, 9)}`; // simple random ID generator
  };

  const handleAddNote = () => {
    const newNote: Note = {
      id: generateId(),
      start: time, // Set start time
      length: duration, // Set duration
      pitch, // Set pitch
      instrument, // Set instrument type
    };

    onAdd(newNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white text-black p-6 rounded shadow-lg">
        <h2 className="text-lg font-bold mb-4">Add Note</h2>
        <div className="mb-4">
          <label>Time (in 16th notes):</label>
          <input type="number" value={time} onChange={(e) => setTime(parseFloat(e.target.value))} className="ml-2 p-1 border rounded" />
        </div>
        <div className="mb-4">
          <label>Pitch:</label>
          <input type="text" value={pitch} onChange={(e) => setPitch(e.target.value)} className="ml-2 p-1 border rounded" />
        </div>
        <div className="mb-4">
          <label>Duration (in 16th notes):</label>
          <input type="number" value={duration} onChange={(e) => setDuration(parseFloat(e.target.value))} className="ml-2 p-1 border rounded" />
        </div>
        <div className="mb-4">
          <label>Instrument:</label>
          <select value={instrument} onChange={(e) => setInstrument(e.target.value as InstrumentType)} className="ml-2 p-1 border rounded">
            {instrumentOptions.map((instr) => (
              <option key={instr} value={instr}>
                {instr}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 rounded">
            Cancel
          </button>
          <button onClick={handleAddNote} className="px-4 py-2 bg-blue-500 text-white rounded">
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNoteDialog;
