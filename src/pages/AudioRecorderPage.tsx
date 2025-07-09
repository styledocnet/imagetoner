// import React from "react";
import Recorder from "../components/Recorder/Recorder";

const AudioRecorderPage = () => {
  return (
    <div className="flex min-h-screen min-w-screen  dark:text-white  p-6">
      <div className="container mx-auto">
        <Recorder />
      </div>
    </div>
  );
};

export default AudioRecorderPage;
