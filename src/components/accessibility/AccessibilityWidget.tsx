import { useEffect, useRef, useState } from "react";

import { Minus, PersonStanding, Plus, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "app:accessibility:font-scale";
const FONT_SCALE_MIN = 1;
const FONT_SCALE_MAX = 1.3;
const FONT_SCALE_STEP = 0.1;

const clampScale = (value: number) =>
  Math.max(FONT_SCALE_MIN, Math.min(FONT_SCALE_MAX, value));

export function AccessibilityWidget() {
  const [isOpen, setOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const baseFontSizeRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const computed = window.getComputedStyle(root).fontSize;
    const parsed = Number.parseFloat(computed);

    baseFontSizeRef.current =
      Number.isFinite(parsed) && parsed > 0 ? parsed : 16;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const value = Number.parseFloat(stored);
        if (!Number.isNaN(value)) {
          setFontScale(clampScale(value));
        }
      }
    } catch (error) {
      console.warn("No se pudo leer la configuracion de accesibilidad", error);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!baseFontSizeRef.current) {
      const computed = Number.parseFloat(
        window.getComputedStyle(document.documentElement).fontSize
      );
      baseFontSizeRef.current =
        Number.isFinite(computed) && computed > 0 ? computed : 16;
    }

    const root = document.documentElement;

    if (Math.abs(fontScale - 1) < 0.01) {
      root.style.fontSize = "";
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* noop */
      }
      return () => {
        root.style.fontSize = "";
      };
    }

    const base = baseFontSizeRef.current ?? 16;
    const next = Math.round(base * fontScale * 100) / 100;
    root.style.fontSize = `${next}px`;

    try {
      window.localStorage.setItem(STORAGE_KEY, fontScale.toFixed(2));
    } catch {
      /* noop */
    }

    return () => {
      root.style.fontSize = "";
    };
  }, [fontScale]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const increaseFont = () =>
    setFontScale((prev) =>
      clampScale(Math.round((prev + FONT_SCALE_STEP) * 100) / 100)
    );

  const decreaseFont = () =>
    setFontScale((prev) =>
      clampScale(Math.round((prev - FONT_SCALE_STEP) * 100) / 100)
    );

  const resetFont = () => setFontScale(1);

  const isMinScale = fontScale <= FONT_SCALE_MIN;
  const isMaxScale = fontScale >= FONT_SCALE_MAX;
  const isDefaultScale = Math.abs(fontScale - 1) < 0.01;
  const fontScaleLabel = `${Math.round(fontScale * 100)}%`;

  const panelId = "accessibility-widget-panel";

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3">
      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          className="pointer-events-auto w-72 max-w-full rounded-2xl border border-border bg-background p-4 shadow-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Accesibilidad
              </p>
              <p className="text-xs text-muted-foreground">
                Ajusta el tamano del texto en todo el sitio.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menu de accesibilidad"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Tamano de texto</span>
              {/* <span className="rounded-md border px-2 py-1 text-foreground bg-background">
                {fontScaleLabel}
              </span> */}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decreaseFont}
                disabled={isMinScale}
                aria-label="Reducir tamano del texto"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="h-10 flex-1 rounded-md border border-dashed border-border/60 bg-muted/40 flex items-center justify-center font-semibold">
                {fontScaleLabel}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={increaseFont}
                disabled={isMaxScale}
                aria-label="Aumentar tamano del texto"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={resetFont}
              disabled={isDefaultScale}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Restablecer texto
            </Button>

            <p className="text-[11px] leading-snug text-muted-foreground">
              Consejo: tambien puedes usar{" "}
              <span className="font-medium">Ctrl +</span> y
              <span className="font-medium"> Ctrl -</span> para ajustar el
              tamano del texto.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        // size="icon"
        className="pointer-events-auto h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/90 flex items-center justify-center animate-bounce"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label="Abrir menu de accesibilidad"
      >
        <div className="border-2 p-1 rounded-full">
          <PersonStanding size={30} />
        </div>
      </button>
    </div>
  );
}
