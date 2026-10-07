let database: Promise<IDBDatabase> | undefined;

function openDatabase() {
  if (!database)
    database = new Promise((resolve, reject) => {
      const request = indexedDB.open('linguadesk-recordings', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('audio');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        database = undefined;
        reject(request.error);
      };
    });
  return database;
}

export async function saveRecording(id: string, blob: Blob) {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('audio', 'readwrite');
    transaction.objectStore('audio').put(blob, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function getRecording(id: string): Promise<Blob | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction('audio').objectStore('audio').get(id);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function restoreRecordings(
  recordings: { id: string; blob: Blob }[],
) {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('audio', 'readwrite');
    for (const recording of recordings)
      transaction.objectStore('audio').put(recording.blob, recording.id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
