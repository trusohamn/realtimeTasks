import WebSocketConnection from "./WebSocket/WebSocket";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Real time app
      <WebSocketConnection />
    </main>
  );
}
