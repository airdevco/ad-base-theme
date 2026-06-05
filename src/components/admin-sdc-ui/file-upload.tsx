"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  accept?: string;
  maxSize?: number;
  onFileSelect?: (file: File) => void;
  disabled?: boolean;
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    { className, accept, maxSize, onFileSelect, disabled = false, ...props },
    ref
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFile = React.useCallback(
      (file: File) => {
        setError(null);

        if (maxSize && file.size > maxSize) {
          setError(
            `File size exceeds ${(maxSize / (1024 * 1024)).toFixed(1)}MB limit`
          );
          return;
        }

        if (accept) {
          const acceptedTypes = accept.split(",").map((t) => t.trim());
          const fileType = file.type;
          const fileExt = `.${file.name.split(".").pop()}`;
          const isAccepted = acceptedTypes.some(
            (type) =>
              type === fileType ||
              type === fileExt ||
              (type.endsWith("/*") &&
                fileType.startsWith(type.replace("/*", "/")))
          );
          if (!isAccepted) {
            setError("File type not accepted");
            return;
          }
        }

        setSelectedFile(file);
        onFileSelect?.(file);
      },
      [accept, maxSize, onFileSelect]
    );

    const handleDragOver = React.useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      },
      [disabled]
    );

    const handleDragLeave = React.useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    }, []);

    const handleDrop = React.useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      },
      [disabled, handleFile]
    );

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
      },
      [handleFile]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input p-6 text-center transition-colors hover:border-primary",
          isDragging && "border-primary bg-accent/50",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        {...props}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium">
              Drop a file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              {accept
                ? `Accepted: ${accept}`
                : "Any file type"}
              {maxSize &&
                ` (max ${(maxSize / (1024 * 1024)).toFixed(1)}MB)`}
            </p>
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
FileUpload.displayName = "FileUpload";

export { FileUpload };
export type { FileUploadProps };
