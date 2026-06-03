// src/components/classroom/Whiteboard.tsx
// Pissarra col·laborativa amb tldraw
// Sincronització en temps real via LiveKit DataChannel (sense servidor extern)

"use client";

import { useCallback, useEffect, useRef } from "react";
import { Tldraw, type Editor, type TLRecord } from "tldraw";
import "tldraw/tldraw.css";

interface Props {
  onDataSend: (data: Uint8Array) => void;
  incomingData?: Uint8Array;
  isTeacher: boolean;
}

export function Whiteboard({ onDataSend, incomingData, isTeacher }: Props) {
  const editorRef = useRef<Editor | null>(null);
  const isSyncing = useRef(false); // evitar bucles d'eco

  // Aplica canvis rebuts dels altres participants
  useEffect(() => {
    if (!incomingData || !editorRef.current) return;

    try {
      const text = new TextDecoder().decode(incomingData);
      const { type, records } = JSON.parse(text) as {
        type: "put" | "remove";
        records: TLRecord[];
      };

      isSyncing.current = true;
      if (type === "put") {
        editorRef.current.store.put(records);
      } else {
        editorRef.current.store.remove(records.map((r) => r.id));
      }
      isSyncing.current = false;
    } catch {
      // missatge malformat, ignorem
    }
  }, [incomingData]);

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      // Subscripció als canvis locals → enviar via DataChannel
      const unsub = editor.store.listen(
        ({ changes }) => {
          if (isSyncing.current) return;

          const added = Object.values(changes.added);
          const updated = Object.values(changes.updated).map(([, next]) => next);
          const removed = Object.values(changes.removed);

          if (added.length > 0 || updated.length > 0) {
            const payload = JSON.stringify({
              type: "put",
              records: [...added, ...updated],
            });
            onDataSend(new TextEncoder().encode(payload));
          }

          if (removed.length > 0) {
            const payload = JSON.stringify({
              type: "remove",
              records: removed,
            });
            onDataSend(new TextEncoder().encode(payload));
          }
        },
        { source: "user", scope: "document" }
      );

      return () => unsub();
    },
    [onDataSend]
  );

  return (
    <div className="w-full h-full min-h-[500px]">
      <Tldraw
        onMount={handleMount}
        // L'alumne pot dibujar però no té accés als menús avançats
        hideUi={!isTeacher}
        components={
          isTeacher
            ? undefined
            : {
                // UI mínima per a l'alumne
                Toolbar: null,
                StylePanel: null,
                NavigationPanel: null,
              }
        }
      />
    </div>
  );
}
