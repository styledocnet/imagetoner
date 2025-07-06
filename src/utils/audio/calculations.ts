export const calculatePitchYIN = (
  data: Float32Array,
  sampleRate: number,
): number | null => {
  const size = data.length;
  const threshold = 0.1;
  const probabilityThreshold = 0.1;
  const yinBuffer = new Float32Array(size / 2);

  for (let tau = 1; tau < size / 2; tau++) {
    let sum = 0;
    for (let i = 0; i < size / 2; i++) {
      const delta = data[i] - data[i + tau];
      sum += delta * delta;
    }
    yinBuffer[tau] = sum;
  }

  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < size / 2; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] *= tau / runningSum;
  }

  let tauEstimate = -1;
  for (let tau = 1; tau < size / 2; tau++) {
    if (yinBuffer[tau] < threshold) {
      tauEstimate = tau;
      break;
    }
  }

  if (tauEstimate === -1) return null;

  const betterTau =
    tauEstimate +
    (yinBuffer[tauEstimate + 1] - yinBuffer[tauEstimate - 1]) /
      (2 *
        (2 * yinBuffer[tauEstimate] -
          yinBuffer[tauEstimate - 1] -
          yinBuffer[tauEstimate + 1]));

  const pitch = sampleRate / betterTau;
  const probability = 1 - yinBuffer[Math.round(betterTau)];

  return probability > probabilityThreshold ? pitch : null;
};

export const calculatePitchAutocorrelation = (
  data: Float32Array,
  sampleRate: number,
): number | null => {
  const size = data.length;
  const autocorrelation = new Float32Array(size);

  const mean = data.reduce((acc, val) => acc + val, 0) / size;
  for (let i = 0; i < size; i++) {
    data[i] -= mean;
  }
  const rms = Math.sqrt(data.reduce((acc, val) => acc + val ** 2, 0) / size);
  if (rms < 0.01) return null;

  for (let lag = 0; lag < size; lag++) {
    let sum = 0;
    for (let i = 0; i < size - lag; i++) {
      sum += data[i] * data[i + lag];
    }
    autocorrelation[lag] = sum;
  }

  let bestLag = -1;
  let maxCorrelation = 0;
  for (let lag = 1; lag < size / 2; lag++) {
    if (
      autocorrelation[lag] > maxCorrelation &&
      autocorrelation[lag] > autocorrelation[lag - 1]
    ) {
      maxCorrelation = autocorrelation[lag];
      bestLag = lag;
    }
  }

  if (bestLag === -1 || maxCorrelation < 0.1) return null;

  return sampleRate / bestLag;
};
