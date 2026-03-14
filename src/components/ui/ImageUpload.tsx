import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string; // storage sub-folder, e.g. "doctors" or "hospitals"
}

const ImageUpload = ({ value, onChange, label = "Profile Image", folder = "uploads" }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are supported.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`File size must be under ${MAX_SIZE_MB}MB. Selected file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e: any) {
      setError(e.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <p className="text-xs text-muted-foreground">
        JPEG, PNG or WebP · Max {MAX_SIZE_MB}MB
      </p>

      {/* Preview */}
      {value && (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      )}

      {/* Drop zone / Upload area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-3 transition-colors hover:border-primary/50 hover:bg-primary/5"
      >
        <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
          {uploading ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {uploading ? "Uploading..." : value ? "Replace image" : "Upload image"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {uploading ? "Please wait" : "Drag & drop or click to browse"}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="shrink-0 gap-1.5"
        >
          <Upload className="h-3.5 w-3.5" />
          Browse
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <X className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
