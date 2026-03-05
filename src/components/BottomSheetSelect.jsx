import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Check } from "lucide-react";

/**
 * On mobile: renders a bottom-sheet drawer for better touch ergonomics.
 * On desktop: falls back to the standard Select popover.
 *
 * Props mirror a simple select:
 *   value, onValueChange, options: [{value, label}], placeholder, triggerClassName, title
 */
export default function BottomSheetSelect({ value, onValueChange, options = [], placeholder, triggerClassName = "", title }) {
  const [open, setOpen] = React.useState(false);
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder || "Select…";

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center justify-between gap-2 border border-input bg-transparent px-3 py-2 text-sm rounded-md shadow-sm ${triggerClassName}`}
        style={{ minHeight: 44 }}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{selectedLabel}</span>
        <svg className="w-4 h-4 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[60vh]">
          {title && (
            <DrawerHeader className="pb-2">
              <DrawerTitle>{title}</DrawerTitle>
            </DrawerHeader>
          )}
          <div className="overflow-y-auto pb-6 px-4 space-y-1">
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onValueChange(o.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${o.value === value
                    ? "bg-amber-50 text-amber-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {o.label}
                {o.value === value && <Check className="w-4 h-4 text-amber-600" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}