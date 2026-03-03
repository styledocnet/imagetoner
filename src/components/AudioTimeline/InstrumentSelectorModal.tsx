import React, { useState, useEffect } from "react";
import { InstrumentType } from "../../types/audio";
import Modal from "../Modal";

export interface InstrumentParameters {
  instrument: InstrumentType;
  detune?: number;
  harmonicity?: number;
  resonance?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  attack?: number;
  partials?: number[];
  partialCount?: number;
  width?: number; // PWM width
}

interface InstrumentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInstrument: InstrumentType | string;
  onConfirm: (params: InstrumentParameters) => void;
  trackName?: string;
}

const INSTRUMENTS = [InstrumentType.Sine, InstrumentType.Square, InstrumentType.Sawtooth, InstrumentType.PWM, InstrumentType.OneShotSampler];

const INSTRUMENT_DESCRIPTIONS = {
  [InstrumentType.Sine]: "Pure sine wave - smooth and mellow",
  [InstrumentType.Square]: "Square wave - bright and hollow",
  [InstrumentType.Sawtooth]: "Sawtooth wave - bright and buzzy",
  [InstrumentType.PWM]: "Pulse Width Modulation - hollow and filtered",
  [InstrumentType.OneShotSampler]: "Sample-based - one-shot drums and sounds",
};

const DEFAULT_PARAMETERS: Record<InstrumentType, InstrumentParameters> = {
  [InstrumentType.Sine]: {
    instrument: InstrumentType.Sine,
    harmonicity: 12,
    resonance: 3000,
    decay: 0.4,
    sustain: 0.1,
    release: 0.5,
    attack: 0.005,
    detune: 0,
  },
  [InstrumentType.Square]: {
    instrument: InstrumentType.Square,
    harmonicity: 12,
    resonance: 3000,
    decay: 0.4,
    sustain: 0.1,
    release: 0.5,
    attack: 0.005,
    detune: 0,
  },
  [InstrumentType.Sawtooth]: {
    instrument: InstrumentType.Sawtooth,
    harmonicity: 12,
    resonance: 3000,
    decay: 0.4,
    sustain: 0.1,
    release: 0.5,
    attack: 0.005,
    detune: 0,
  },
  [InstrumentType.PWM]: {
    instrument: InstrumentType.PWM,
    width: 0.5,
    harmonicity: 12,
    resonance: 3000,
    decay: 0.4,
    sustain: 0.1,
    release: 0.5,
    attack: 0.005,
    detune: 0,
  },
  [InstrumentType.OneShotSampler]: {
    instrument: InstrumentType.OneShotSampler,
    attack: 0.005,
    decay: 1,
    release: 0.5,
  },
};

const InstrumentSelectorModal: React.FC<InstrumentSelectorModalProps> = ({ isOpen, onClose, currentInstrument, onConfirm, trackName = "Track" }) => {
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>((currentInstrument as InstrumentType) || InstrumentType.Sine);
  const [parameters, setParameters] = useState<InstrumentParameters>(DEFAULT_PARAMETERS[selectedInstrument]);

  useEffect(() => {
    if (isOpen) {
      setSelectedInstrument((currentInstrument as InstrumentType) || InstrumentType.Sine);
      setParameters(DEFAULT_PARAMETERS[(currentInstrument as InstrumentType) || InstrumentType.Sine]);
    }
  }, [isOpen, currentInstrument]);

  const handleInstrumentChange = (instrument: InstrumentType) => {
    setSelectedInstrument(instrument);
    setParameters(DEFAULT_PARAMETERS[instrument]);
  };

  const handleParameterChange = (key: keyof InstrumentParameters, value: number | string) => {
    setParameters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleConfirm = () => {
    const confirmData = {
      ...parameters,
      instrument: selectedInstrument,
    };
    onConfirm(confirmData);
    onClose();
  };

  const getVisibleParameters = (): Array<{
    key: keyof InstrumentParameters;
    label: string;
    min: number;
    max: number;
    step: number;
  }> => {
    const baseParams = [
      { key: "attack" as const, label: "Attack (s)", min: 0, max: 1, step: 0.01 },
      { key: "decay" as const, label: "Decay (s)", min: 0, max: 2, step: 0.05 },
      { key: "sustain" as const, label: "Sustain", min: 0, max: 1, step: 0.05 },
      { key: "release" as const, label: "Release (s)", min: 0, max: 2, step: 0.05 },
      { key: "detune" as const, label: "Detune (cents)", min: -100, max: 100, step: 1 },
    ];

    if (selectedInstrument === InstrumentType.PWM) {
      return [{ key: "width" as const, label: "Pulse Width", min: 0.01, max: 0.99, step: 0.01 }, ...baseParams];
    }

    if (selectedInstrument === InstrumentType.OneShotSampler) {
      return [
        { key: "attack" as const, label: "Attack (s)", min: 0, max: 1, step: 0.01 },
        { key: "decay" as const, label: "Decay (s)", min: 0, max: 2, step: 0.05 },
        { key: "release" as const, label: "Release (s)", min: 0, max: 2, step: 0.05 },
      ];
    }

    return baseParams;
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`Edit Instrument - ${trackName}`}
      onClose={onClose}
      footer={
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
            Confirm
          </button>
        </div>
      }
    >
      <div className="max-h-96 overflow-y-auto">
        {/* Instrument Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3 text-gray-200">Select Instrument</label>
          <div className="grid grid-cols-2 gap-2">
            {INSTRUMENTS.map((instrument) => (
              <button
                key={instrument}
                onClick={() => handleInstrumentChange(instrument)}
                className={`p-3 rounded border-2 transition-all text-sm font-medium ${
                  selectedInstrument === instrument
                    ? "border-blue-500 bg-blue-900 text-white"
                    : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-600"
                }`}
              >
                {instrument}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">{INSTRUMENT_DESCRIPTIONS[selectedInstrument as InstrumentType]}</p>
        </div>

        {/* ADSR & Parameters */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-4 text-gray-200">Parameters</label>
          <div className="space-y-3">
            {getVisibleParameters().map((param) => (
              <div key={param.key} className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-gray-300">{param.label}</label>
                  <span className="text-xs font-mono bg-gray-700 px-2 py-0.5 rounded text-gray-200">
                    {typeof parameters[param.key] === "number" ? (parameters[param.key] as number).toFixed(3) : parameters[param.key]}
                  </span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={parameters[param.key] as number}
                  onChange={(e) => handleParameterChange(param.key, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-700 bg-opacity-50 p-3 rounded text-xs text-gray-300 mt-4">
          <p>
            <strong>Tip:</strong> Adjust the ADSR (Attack, Decay, Sustain, Release) envelope to shape how the instrument sounds over time.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default InstrumentSelectorModal;
