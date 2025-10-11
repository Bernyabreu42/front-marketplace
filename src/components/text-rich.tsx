// Editor.tsx
import Quill from "quill";
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";

// Editor is an uncontrolled React component
interface EditorProps {
  readOnly?: boolean;
  defaultValue?: any;
  placeholder?: string;
  onTextChange?: (...args: any[]) => void;
  onSelectionChange?: (...args: any[]) => void;
}

const Editor = forwardRef<Quill | null, EditorProps>(
  (
    { readOnly, defaultValue, placeholder, onTextChange, onSelectionChange },
    ref
  ) => {
    const containerRef = useRef<HTMLInputElement>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      if (ref && "current" in ref) {
        ref.current?.enable(!readOnly);
      }
    }, [ref, readOnly]);

    // Primer useEffect: Inicializa Quill
    useEffect(() => {
      const container = containerRef.current;
      const editorContainer = container?.appendChild(
        container.ownerDocument.createElement("div")
      );
      if (!editorContainer) {
        throw new Error("Editor container could not be created.");
      }
      const quill = new Quill(editorContainer, {
        theme: "snow",
        placeholder: placeholder || "",
      });

      if (ref && "current" in ref) {
        ref.current = quill;
      }

      // Este bloque se movió a un nuevo useEffect
      // if (defaultValueRef.current) {
      //   quill.setContents(defaultValueRef.current);
      // }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      if (ref && "current" in ref && container) {
        return () => {
          ref.current = null;
          container.innerHTML = "";
        };
      }
    }, [ref]);

    // Nuevo useEffect: Actualiza el contenido del editor cuando `defaultValue` cambie
    useEffect(() => {
      if (ref && "current" in ref && ref.current) {
        const quill = ref.current;
        const currentContent = quill.root.innerHTML;
        const newContent = defaultValue || "";

        // Solo actualiza si el contenido ha cambiado para evitar bucles infinitos
        if (currentContent !== newContent) {
          // Utiliza setHTML para establecer el contenido HTML
          quill.clipboard.dangerouslyPasteHTML(newContent);
        }
      }
    }, [defaultValue, ref]);

    return <div ref={containerRef}></div>;
  }
);

Editor.displayName = "Editor";

export default Editor;
