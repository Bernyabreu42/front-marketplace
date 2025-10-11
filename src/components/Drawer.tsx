import { MenuIcon, X } from "lucide-react";
import React, { useRef, useEffect } from "react";

interface Props {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  position?: "left" | "right" | "top" | "bottom";
  width?: string;
  className?: string;
  toClose?: boolean;
  header?: boolean;
  activeButtonNavbar?: boolean;
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  drawerClass?: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveModal?: React.Dispatch<React.SetStateAction<boolean>>;
  handler?: () => React.ReactNode;
  autoMediaQueryClose?: string;
}

export default function Drawer({
  setOpen,
  open,
  title,
  children,
  position = "left",
  width = "w-80",
  className = "",
  toClose = false,
  icon,
  footer,
  header = true,
  handler,
  activeButtonNavbar = false,
  setActiveModal,
  drawerClass = "h-[100dvh]",
  autoMediaQueryClose = "(min-width: 768px)",
}: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const btnActionRef = useRef<HTMLButtonElement>(null);

  // const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    if (autoMediaQueryClose) {
      const mediaQuery = window.matchMedia(autoMediaQueryClose); // md en Tailwind

      const handleResize = () => {
        if (mediaQuery.matches) {
          setOpen(false); // Cierra el drawer
        }
      };

      // Llama al inicio para asegurarte
      handleResize();

      mediaQuery.addEventListener("change", handleResize);

      return () => {
        mediaQuery.removeEventListener("change", handleResize);
      };
    }
  }, [setOpen, autoMediaQueryClose]);

  const orientation = {
    left: {
      origen: "left-0",
      position: "left-0",
      open: "",
      close: "-translate-x-full",
    },
    right: {
      origen: "right-0",
      position: "right-0",
      open: "",
      close: "translate-x-full",
    },
    top: {
      origen: "top-0",
      position: "top-0",
      open: "",
      close: "-translate-y-full",
    },
    bottom: {
      origen: "bottom-0",
      position: "bottom-0",
      open: "",
      close: "translate-y-full",
    },
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const toast = document.querySelector(".Toastify__toast-container");

      if (drawerRef?.current) {
        if (
          !drawerRef?.current?.contains(event.target as Node) &&
          !toast &&
          !btnActionRef?.current?.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      }
    };

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpen, open]);

  return (
    <>
      {icon && icon}

      <div
        id={title ? `Drawer-${title}` : "Drawer"}
        className={`fixed inset-0 z-[999] ${open ? "" : "pointer-events-none"}`}
      >
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-500 ease-out  ${
            open ? "opacity-50" : "opacity-0"
          }`}
        ></div>
        <div
          ref={drawerRef}
          // style={orientation[position]?.position === 'bottom-0' ? {width: '100vw'} : {}}
          className={`fixed ${orientation[position]?.origen} ${
            orientation[position]?.position
          } z-50 ${drawerClass}  transition-transform  shadow flex flex-col ${
            open
              ? orientation[position]?.open
              : orientation[position]?.close || "-translate-x-full"
          } bg-background ${width}`}
        >
          {header && (
            <div className="border-b border-border p-4">
              <div className="flex gap-2 items-center">
                {activeButtonNavbar && (
                  <button onClick={() => setActiveModal?.(true)}>
                    <MenuIcon className="text-texto" size={25} />
                  </button>
                )}
                <h5
                  id="drawer-label"
                  className="inline-flex items-center text-base font-semibold text-texto"
                >
                  {title}
                </h5>
              </div>

              <button
                ref={btnActionRef}
                onClick={() => {
                  setOpen(!open);
                  handler?.();
                }}
                type="button"
                data-drawer-hide="drawer-example"
                aria-controls="drawer-example"
                className="btn-open-close-drawer text-texto bg-transparent hover:bg-primary hover:text-texto rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center cursor-pointer"
              >
                <X size={25} />
              </button>
            </div>
          )}

          {toClose && (
            <button
              ref={btnActionRef}
              onClick={() => {
                setOpen(!open);
                handler?.();
              }}
              type="button"
              data-drawer-hide="drawer-example"
              aria-controls="drawer-example"
              className="text-texto bg-transparent hover:bg-foreground hover:text-primary rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center cursor-pointer"
            >
              <X size={25} />
            </button>
          )}

          {/* movil:h-[calc(100%_-_245px)] */}
          <div className={`${className}  flex-1 `}>{children}</div>

          {footer && <div>{footer}</div>}
        </div>
      </div>
    </>
  );
}
