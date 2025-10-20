const SYNC_TAG = 'conforma-evidence-sync';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const notifyClientsToSync = async () => {
  const clients = await self.clients.matchAll();
  await Promise.all(
    clients.map((client) => client.postMessage('SYNC_EVIDENCE_QUEUE')),
  );
};

self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(notifyClientsToSync());
  }
});
