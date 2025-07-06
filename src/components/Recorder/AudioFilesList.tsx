import React from "react";

interface AudioFile {
  id: string;
  name: string;
  blob: Blob;
}

interface Props {
  files: AudioFile[];
  onPlay: (blob: Blob) => void;
}

const AudioFilesList: React.FC<Props> = ({ files, onPlay }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Recorded Files</h2>
      <ul className="shadow-neumorphism space-y-2">
        {files.map((file) => (
          <li
            key={file.id}
            className="flex justify-between items-center p-2 bg-gray-800 rounded-md"
          >
            <span>{file.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => onPlay(file.blob)}
                className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 hidden"
              >
                Play
              </button>
              <a
                href={URL.createObjectURL(file.blob)}
                download={file.name}
                className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Download
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AudioFilesList;
