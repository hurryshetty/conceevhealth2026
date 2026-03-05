import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

const CoordinatorMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [msgText, setMsgText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ["coordinator-conversations", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("conversation_participants")
        .select("conversation_id, conversations(id, title, case_id, patient_cases(case_number, title))")
        .eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedConvId],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, profiles!sender_id(full_name)")
        .eq("conversation_id", selectedConvId!)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
    enabled: !!selectedConvId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!selectedConvId) return;
    const channel = supabase
      .channel(`messages:${selectedConvId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selectedConvId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages", selectedConvId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConvId, queryClient]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConvId!,
        sender_id: user!.id,
        content: msgText,
      });
      if (error) throw error;
    },
    onSuccess: () => setMsgText(""),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    sendMutation.mutate();
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-foreground mb-6">Messages</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden flex" style={{ height: "calc(100vh - 220px)" }}>
        {/* Conversation list */}
        <div className="w-72 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <p className="text-sm font-medium text-muted-foreground">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">No conversations yet</p>
            ) : (
              conversations.map((c: any) => {
                const conv = c.conversations;
                return (
                  <button
                    key={c.conversation_id}
                    className={`w-full text-left p-3 hover:bg-accent transition-colors border-b border-border last:border-0 ${selectedConvId === c.conversation_id ? "bg-accent" : ""}`}
                    onClick={() => setSelectedConvId(c.conversation_id)}
                  >
                    <p className="text-sm font-medium text-foreground truncate">
                      {conv?.title ?? conv?.patient_cases?.title ?? "Untitled"}
                    </p>
                    {conv?.patient_cases?.case_number && (
                      <p className="text-xs text-muted-foreground font-mono">{conv.patient_cases.case_number}</p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {!selectedConvId ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Select a conversation</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg: any) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"}`}>
                        {!isMe && (
                          <p className="text-xs font-medium mb-1 opacity-70">{msg.profiles?.full_name ?? "Unknown"}</p>
                        )}
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2">
                <Input
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!msgText.trim() || sendMutation.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoordinatorMessages;
