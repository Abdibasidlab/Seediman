// Recordings a child chooses to share with a grown up (Speak items marked `keep`), saved on this device only
// (IndexedDB) so a parent can play them back from the Parent view. Nothing is uploaded.
export interface Recording { id: number; lesson: string; prompt: string; at: number; blob: Blob }

const DB = 'seediman', STORE = 'recordings';
function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
export async function saveRecording(lesson: string, prompt: string, blob: Blob) {
  try {
    const db = await open();
    await new Promise<void>((res, rej) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).add({ lesson, prompt, at: Date.now(), blob }); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
  } catch { /* storage unavailable: the recording still plays back in the activity */ }
}
export async function listRecordings(): Promise<Recording[]> {
  try {
    const db = await open();
    return await new Promise((res, rej) => { const r = db.transaction(STORE).objectStore(STORE).getAll(); r.onsuccess = () => res((r.result as Recording[]).sort((a, b) => b.at - a.at)); r.onerror = () => rej(r.error); });
  } catch { return []; }
}
