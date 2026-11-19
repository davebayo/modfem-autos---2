"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

interface CustomSelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  "aria-label"?: string;
}

/** Enterprise-grade replacement for native `<select>` — Radix UI primitives
 * handle ARIA listbox compliance, keyboard typeahead, focus-trapping and
 * viewport-collision flipping, styled to the Arena Aesthetic rather than a
 * glass popover: the trigger reuses the `.field` class verbatim (pixel-exact
 * match with every other form input on the site) and the popover is a solid
 * `bg-[#101216]` panel — no `backdrop-blur`, since CLAUDE.md's flat-carbon
 * rule only carves out glass for nav-link pills, not dropdowns. Radix only
 * accepts string option values; callers owning a non-string value (e.g. a
 * year) convert at the call site, same as native `<select>` always required. */
export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  "aria-label": ariaLabel,
}: CustomSelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onChange}>
      <RadixSelect.Trigger aria-label={ariaLabel} className="field group flex w-full items-center justify-between gap-2 text-left">
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-white/45 transition-transform duration-200 group-data-[state=open]:rotate-180"
            strokeWidth={1.5}
          />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className="z-[9999] max-h-[min(24rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-white/12 bg-[#101216] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <RadixSelect.ScrollUpButton className="flex items-center justify-center py-1 text-white/40">
            <ChevronDown className="h-3.5 w-3.5 rotate-180" strokeWidth={1.5} />
          </RadixSelect.ScrollUpButton>

          <RadixSelect.Viewport className="select-viewport">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 font-mono text-sm tnum text-white/70 outline-none transition-colors duration-150 data-[highlighted]:bg-white/5 data-[highlighted]:text-white data-[state=checked]:bg-emerald-500/10 data-[state=checked]:text-emerald-400"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.5} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>

          <RadixSelect.ScrollDownButton className="flex items-center justify-center py-1 text-white/40">
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
