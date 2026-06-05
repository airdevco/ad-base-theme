"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  MentionSuggestionList,
  buildMentionItems,
  type MentionSuggestionListRef,
} from "@/components/ui/mention-suggestion-list";

interface MergeTermInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  /** Known merge terms — these are always rendered as badges */
  knownTerms?: string[];
  /** Called when a new term is created via the suggestion dropdown */
  onNewTerm?: (term: string) => void;
}

/**
 * An input that renders @term patterns as styled inline badges.
 * Shows a suggestion dropdown when the user types @, matching the
 * same UX as the TipTap rich text editor mentions.
 */
export function MergeTermInput({
  value,
  onChange,
  placeholder,
  className,
  id,
  knownTerms = [],
  onNewTerm,
}: MergeTermInputProps) {
  const editableRef = useRef<HTMLDivElement>(null);
  const suggestionRef = useRef<MentionSuggestionListRef>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Suggestion dropdown state
  const [suggestion, setSuggestion] = useState<{
    query: string;
    position: { top: number; left: number };
  } | null>(null);

  // Convert raw text to HTML with styled @term badges.
  // Only badge known terms or terms followed by a space.
  const renderHTML = useCallback(
    (text: string): string => {
      if (!text) return "";
      return text.replace(
        /@(\w+(?:_\w+)*)/g,
        (match, term, offset) => {
          const charAfter = text[offset + match.length];
          const isKnown = knownTerms.includes(term);
          const shouldBadge = isKnown || charAfter === " ";

          if (shouldBadge) {
            return `<span class="merge-term-badge" contenteditable="false" data-term="${term}">@${term}</span>`;
          }
          return match;
        }
      );
    },
    [knownTerms]
  );

  // Extract plain text from the contenteditable
  const extractText = useCallback((el: HTMLDivElement): string => {
    let result = "";
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent ?? "";
      } else if (node instanceof HTMLElement && node.dataset.term) {
        result += `@${node.dataset.term}`;
      } else if (node instanceof HTMLElement) {
        result += node.textContent ?? "";
      }
    });
    return result;
  }, []);

  // Detect @query at cursor position for suggestion dropdown
  const detectMentionQuery = useCallback(() => {
    if (!editableRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setSuggestion(null);
      return;
    }

    const range = sel.getRangeAt(0);
    // Only look at text nodes
    if (range.startContainer.nodeType !== Node.TEXT_NODE) {
      setSuggestion(null);
      return;
    }

    const textBefore = (range.startContainer.textContent ?? "").slice(
      0,
      range.startOffset
    );
    // Match @word_chars at the end of text before cursor
    const match = textBefore.match(/@(\w*)$/);

    if (match) {
      // Get position of the @ character for the dropdown
      const tempRange = document.createRange();
      tempRange.setStart(
        range.startContainer,
        range.startOffset - match[0].length
      );
      tempRange.setEnd(range.startContainer, range.startOffset);
      const rect = tempRange.getBoundingClientRect();

      setSuggestion({
        query: match[1],
        position: {
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        },
      });
    } else {
      setSuggestion(null);
    }
  }, []);

  // Sync the contenteditable when value changes externally
  useEffect(() => {
    if (!editableRef.current) return;
    const currentText = extractText(editableRef.current);
    if (currentText !== value) {
      const sel = window.getSelection();
      const hadFocus = document.activeElement === editableRef.current;

      editableRef.current.innerHTML = renderHTML(value);

      if (hadFocus && sel && editableRef.current.childNodes.length > 0) {
        const range = document.createRange();
        range.selectNodeContents(editableRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [value, renderHTML, extractText]);

  const handleInput = useCallback(() => {
    if (!editableRef.current) return;

    // Save cursor position
    const sel = window.getSelection();
    let cursorOffset = 0;
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const preRange = range.cloneRange();
      preRange.selectNodeContents(editableRef.current);
      preRange.setEnd(range.startContainer, range.startOffset);
      cursorOffset = preRange.toString().length;
    }

    // Get plain text
    const text = extractText(editableRef.current);
    onChange(text);

    // Re-render with badges
    const html = renderHTML(text);
    if (editableRef.current.innerHTML !== html) {
      editableRef.current.innerHTML = html;

      // Restore cursor position
      if (sel) {
        try {
          let remaining = cursorOffset;
          const range = document.createRange();
          let found = false;

          const walker = document.createTreeWalker(
            editableRef.current,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            null
          );

          let node = walker.nextNode();
          while (node) {
            if (node.nodeType === Node.TEXT_NODE) {
              const len = node.textContent?.length ?? 0;
              if (remaining <= len) {
                range.setStart(node, remaining);
                range.collapse(true);
                found = true;
                break;
              }
              remaining -= len;
            } else if (
              node instanceof HTMLElement &&
              node.dataset.term
            ) {
              const termLen = `@${node.dataset.term}`.length;
              if (remaining <= termLen) {
                const parent = node.parentNode;
                if (parent) {
                  const idx = Array.from(parent.childNodes).indexOf(node);
                  range.setStart(parent, idx + 1);
                  range.collapse(true);
                  found = true;
                  break;
                }
              }
              remaining -= termLen;
              node = walker.nextNode();
              continue;
            }
            node = walker.nextNode();
          }

          if (!found) {
            range.selectNodeContents(editableRef.current);
            range.collapse(false);
          }

          sel.removeAllRanges();
          sel.addRange(range);
        } catch {
          const range = document.createRange();
          range.selectNodeContents(editableRef.current);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }

    // Detect mention query after cursor restore
    detectMentionQuery();
  }, [onChange, renderHTML, extractText, detectMentionQuery]);

  // Insert a selected term from the suggestion dropdown
  const handleSelectTerm = useCallback(
    (attrs: { id: string; label: string }) => {
      if (!editableRef.current) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      if (range.startContainer.nodeType !== Node.TEXT_NODE) return;

      const textNode = range.startContainer;
      const textBefore = (textNode.textContent ?? "").slice(0, range.startOffset);
      const match = textBefore.match(/@(\w*)$/);
      if (!match) return;

      // Replace @query with @term + space in the text
      const beforeAt = textBefore.slice(0, textBefore.length - match[0].length);
      const afterCursor = (textNode.textContent ?? "").slice(range.startOffset);
      const newText = `${beforeAt}@${attrs.id} ${afterCursor}`;

      // Notify parent of new term
      const isNew = !knownTerms.includes(attrs.id);
      if (isNew && onNewTerm) {
        onNewTerm(attrs.id);
      }

      // Get full text, replace this node's content, and update
      textNode.textContent = newText;
      const fullText = extractText(editableRef.current);
      onChange(fullText);

      // Re-render with badges
      editableRef.current.innerHTML = renderHTML(fullText);

      // Place cursor after the inserted term
      const cursorTarget = beforeAt.length + `@${attrs.id} `.length;
      try {
        let remaining = cursorTarget;
        const newRange = document.createRange();
        let found = false;

        const walker = document.createTreeWalker(
          editableRef.current,
          NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
          null
        );

        let node = walker.nextNode();
        while (node) {
          if (node.nodeType === Node.TEXT_NODE) {
            const len = node.textContent?.length ?? 0;
            if (remaining <= len) {
              newRange.setStart(node, remaining);
              newRange.collapse(true);
              found = true;
              break;
            }
            remaining -= len;
          } else if (node instanceof HTMLElement && node.dataset.term) {
            const termLen = `@${node.dataset.term}`.length;
            if (remaining <= termLen) {
              const parent = node.parentNode;
              if (parent) {
                const idx = Array.from(parent.childNodes).indexOf(node);
                newRange.setStart(parent, idx + 1);
                newRange.collapse(true);
                found = true;
                break;
              }
            }
            remaining -= termLen;
            node = walker.nextNode();
            continue;
          }
          node = walker.nextNode();
        }

        if (!found) {
          newRange.selectNodeContents(editableRef.current);
          newRange.collapse(false);
        }

        sel.removeAllRanges();
        sel.addRange(newRange);
      } catch {
        // fallback
      }

      setSuggestion(null);
    },
    [knownTerms, onNewTerm, extractText, onChange, renderHTML]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }

      // Forward keyboard events to suggestion list when open
      if (suggestion && suggestionRef.current) {
        const handled = suggestionRef.current.onKeyDown({
          event: e.nativeEvent,
        });
        if (handled) {
          e.preventDefault();
          return;
        }
      }

      if (e.key === "Escape" && suggestion) {
        setSuggestion(null);
        e.preventDefault();
      }
    },
    [suggestion]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    },
    []
  );

  const handleBlur = useCallback(() => {
    // Delay to allow click on suggestion item
    setTimeout(() => {
      setIsFocused(false);
      setSuggestion(null);
      if (!editableRef.current) return;
      const text = extractText(editableRef.current);
      // On blur, badge all @terms since user is done typing
      const blurHTML = text.replace(
        /@(\w+(?:_\w+)*)/g,
        '<span class="merge-term-badge" contenteditable="false" data-term="$1">@$1</span>'
      );
      if (editableRef.current.innerHTML !== blurHTML) {
        editableRef.current.innerHTML = blurHTML;
      }
    }, 150);
  }, [extractText]);

  const suggestionItems = suggestion
    ? buildMentionItems(suggestion.query, knownTerms)
    : [];

  return (
    <div className="relative">
      <div
        ref={editableRef}
        id={id}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        data-placeholder={placeholder}
        className={cn(
          "flex h-9 w-full items-center rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground",
          "focus:ring-2 focus:ring-primary focus:ring-offset-1",
          "[&_.merge-term-badge]:inline-flex [&_.merge-term-badge]:items-center [&_.merge-term-badge]:rounded-full [&_.merge-term-badge]:bg-primary/10 [&_.merge-term-badge]:px-1.5 [&_.merge-term-badge]:py-0 [&_.merge-term-badge]:text-xs [&_.merge-term-badge]:font-medium [&_.merge-term-badge]:text-primary [&_.merge-term-badge]:mx-0.5",
          className
        )}
      />

      {/* Suggestion dropdown portal */}
      {suggestion &&
        suggestionItems.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: suggestion.position.top,
              left: suggestion.position.left,
              zIndex: 50,
            }}
          >
            <MentionSuggestionList
              ref={suggestionRef}
              items={suggestionItems}
              command={handleSelectTerm}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
