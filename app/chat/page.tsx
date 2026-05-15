import { ChatView } from "@/components/chat/chat-view";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  // Lecture côté serveur (NEXT_PUBLIC_* déjà inliné côté client mais on
  // évite la dépendance à window). Fallback hardcodé pour le prototype.
  const ueName = process.env["NEXT_PUBLIC_UE_NAME"] ?? "Analyse 2";
  return <ChatView ueName={ueName} />;
}
