import { getRecording, restoreRecordings } from '@/lib/recordings';
import { isTrainingData } from './trainingState';
import type { TrainingData } from './trainingTypes';

function encodeBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function createTrainingBackup(data: TrainingData) {
  const audio: Record<string, string> = {};
  const missingRecordings: string[] = [];
  for (const id of new Set(
    data.results.flatMap((result) =>
      result.recordingId ? [result.recordingId] : [],
    ),
  )) {
    const blob = await getRecording(id);
    if (blob) audio[id] = await encodeBlob(blob);
    else missingRecordings.push(id);
  }
  return {
    format: 'linguadesk-training',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
    audio,
    missingRecordings,
  };
}

export async function readTrainingBackup(
  value: unknown,
): Promise<TrainingData> {
  if (typeof value !== 'object' || value === null)
    throw new Error('文件格式不正确');
  const backup = value as Record<string, unknown>;
  if (
    backup.format !== 'linguadesk-training' ||
    backup.version !== 1 ||
    !isTrainingData(backup.data)
  )
    throw new Error('文件格式或训练数据不正确');
  if (
    typeof backup.audio !== 'object' ||
    backup.audio === null ||
    Array.isArray(backup.audio)
  )
    throw new Error('录音数据不正确');
  const ids = new Set(
    backup.data.results.flatMap((result) =>
      result.recordingId ? [result.recordingId] : [],
    ),
  );
  const recordings: { id: string; blob: Blob }[] = [];
  for (const [id, encoded] of Object.entries(backup.audio)) {
    if (
      !ids.has(id) ||
      typeof encoded !== 'string' ||
      !/^data:audio\/[\w.+-]+(?:;codecs=[\w.,-]+)?;base64,/.test(encoded)
    )
      throw new Error('录音数据不正确');
    const comma = encoded.indexOf(',');
    const header = encoded.slice(0, comma);
    const bytes = Uint8Array.from(atob(encoded.slice(comma + 1)), (char) =>
      char.charCodeAt(0),
    );
    recordings.push({
      id,
      blob: new Blob([bytes], { type: header.slice(5, header.indexOf(';')) }),
    });
  }
  await restoreRecordings(recordings);
  return backup.data;
}
