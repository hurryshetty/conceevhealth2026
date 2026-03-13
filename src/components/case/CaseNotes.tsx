import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lock, MessageSquare, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const ROLE_COLOR: Record<string, string> = {
  admin:       "bg-rose-100 text-rose-700",
  coordinator: "bg-indigo-100 text-indigo-700",
  doctor:      "bg-teal-100 text-teal-700",
  hospital:    "bg-blue-100 text-blue-700",
  patient:     "bg-gray-100 text-gray-600",
};

const ROLE_LABEL: Record<string, string> = {
  admin:       "Admin",
  coordinator: "Coordinator",
  doctor:      "Doctor",
  hospital:    "Hospital",
  patient:     "Patient",
};

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

interface Props { caseId: string }

export const CaseNotes = ({ caseId }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [noteText, setNoteText] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  // Per-note reply state
  const [openReplies, setOpenReplies] = useState<Set<string>>(new Set());
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<string | null>(null);

  // Current user's role (fetched once)
  const { data: myRole = "coordinator" } = useQuery({
    queryKey: ["my-role", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data?.role ?? "coordinator";
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  // Notes
  const { data: notes = [] } = useQuery({
    queryKey: ["case-notes", caseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_notes")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  // All replies for all notes in this case (single query)
  const noteIds = (notes as any[]).map((n) => n.id);
  const { data: allReplies = [] } = useQuery({
    queryKey: ["case-note-replies", caseId],
    queryFn: async () => {
      if (!noteIds.length) return [];
      const { data } = await supabase
        .from("case_note_replies")
        .select("*")
        .in("note_id", noteIds)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
    enabled: noteIds.length > 0,
  });

  // All unique author IDs from notes + replies → batch fetch names
  const authorIds = Array.from(new Set([
    ...(notes as any[]).map((n) => n.author_id).filter(Boolean),
    ...(allReplies as any[]).map((r) => r.author_id).filter(Boolean),
  ]));

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-batch", authorIds.sort().join(",")],
    queryFn: async () => {
      if (!authorIds.length) return [];
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", authorIds);
      return data ?? [];
    },
    enabled: authorIds.length > 0,
    staleTime: 60_000,
  });

  const getAuthorName = (id?: string) => {
    if (!id) return "Unknown";
    const p = (profiles as any[]).find((p) => p.id === id);
    return p?.full_name || p?.email || "User";
  };

  const getRepliesFor = (noteId: string) =>
    (allReplies as any[]).filter((r) => r.note_id === noteId);

  // Add note
  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("case_notes").insert({
        case_id: caseId,
        author_id: user!.id,
        author_role: myRole,
        content: noteText.trim(),
        is_internal: isInternal,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-notes", caseId] });
      setNoteText("");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Add reply
  const addReplyMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const text = replyText[noteId]?.trim();
      if (!text) throw new Error("Reply is empty");
      const { error } = await supabase.from("case_note_replies").insert({
        note_id: noteId,
        author_id: user!.id,
        author_role: myRole,
        content: text,
      });
      if (error) throw error;
    },
    onSuccess: (_, noteId) => {
      qc.invalidateQueries({ queryKey: ["case-note-replies", caseId] });
      setReplyText((prev) => ({ ...prev, [noteId]: "" }));
      setReplyOpen(null);
      // Keep replies expanded after posting
      setOpenReplies((prev) => new Set([...prev, noteId]));
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleReplies = (noteId: string) => {
    setOpenReplies((prev) => {
      const next = new Set(prev);
      next.has(noteId) ? next.delete(noteId) : next.add(noteId);
      return next;
    });
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Note list */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6 text-center">No notes yet.</p>
        ) : (
          (notes as any[]).map((note) => {
            const replies = getRepliesFor(note.id);
            const repliesExpanded = openReplies.has(note.id);
            const isReplyFormOpen = replyOpen === note.id;
            const authorName = getAuthorName(note.author_id);
            const role = note.author_role ?? "coordinator";

            return (
              <div
                key={note.id}
                className={`rounded-xl border ${
                  note.is_internal
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-card border-border"
                }`}
              >
                {/* Note header + body */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{authorName}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_COLOR[role] ?? "bg-gray-100 text-gray-600"}`}>
                      {ROLE_LABEL[role] ?? role}
                    </span>
                    {note.is_internal && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-200">
                        <Lock className="h-3 w-3" /> Internal
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">{formatDate(note.created_at)}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>

                {/* Replies toggle + reply form */}
                <div className={`border-t px-4 py-2 ${note.is_internal ? "border-yellow-200" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    {replies.length > 0 && (
                      <button
                        onClick={() => toggleReplies(note.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {repliesExpanded
                          ? <><ChevronUp className="h-3.5 w-3.5" /> Hide {replies.length} {replies.length === 1 ? "reply" : "replies"}</>
                          : <><ChevronDown className="h-3.5 w-3.5" /> {replies.length} {replies.length === 1 ? "reply" : "replies"}</>}
                      </button>
                    )}
                    <button
                      onClick={() => setReplyOpen(isReplyFormOpen ? null : note.id)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {isReplyFormOpen ? "Cancel" : "Reply"}
                    </button>
                  </div>

                  {/* Replies thread */}
                  {repliesExpanded && replies.length > 0 && (
                    <div className="mt-3 space-y-3 pl-4 border-l-2 border-border/60">
                      {replies.map((reply: any) => {
                        const replyRole = reply.author_role ?? "coordinator";
                        return (
                          <div key={reply.id}>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-semibold text-foreground">{getAuthorName(reply.author_id)}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${ROLE_COLOR[replyRole] ?? "bg-gray-100 text-gray-600"}`}>
                                {ROLE_LABEL[replyRole] ?? replyRole}
                              </span>
                              <span className="text-[11px] text-muted-foreground ml-auto">{formatDate(reply.created_at)}</span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reply form */}
                  {isReplyFormOpen && (
                    <div className="mt-3 flex gap-2">
                      <Textarea
                        value={replyText[note.id] ?? ""}
                        onChange={(e) => setReplyText((p) => ({ ...p, [note.id]: e.target.value }))}
                        placeholder="Write a reply…"
                        rows={2}
                        className="resize-none text-sm flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.ctrlKey && replyText[note.id]?.trim()) {
                            addReplyMutation.mutate(note.id);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="self-end gap-1.5"
                        onClick={() => addReplyMutation.mutate(note.id)}
                        disabled={!replyText[note.id]?.trim() || addReplyMutation.isPending}
                      >
                        {addReplyMutation.isPending
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Send className="h-3.5 w-3.5" />}
                        Send
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Note form */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-foreground text-sm">Add Note</h3>
        <Textarea
          placeholder="Add update, follow-up note, patient response…"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={4}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey && noteText.trim()) {
              addNoteMutation.mutate();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded"
            />
            <Lock className="h-3.5 w-3.5" />
            Internal only (not visible to patient)
          </label>
          <Button
            size="sm"
            onClick={() => addNoteMutation.mutate()}
            disabled={!noteText.trim() || addNoteMutation.isPending}
            className="gap-2"
          >
            {addNoteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Add Note
          </Button>
        </div>
      </div>
    </div>
  );
};
