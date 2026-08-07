"use client";

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxIcon,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectComboboxProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
}

/**
 * Searchable multi-select with removable chips — built on Base UI's
 * Combobox in `multiple` mode. Replaces a checkbox list once the option
 * count grows past what's comfortably scannable/clickable (categories,
 * here); typing filters, selected options collapse into chips instead of
 * staying visible+checked in a long list.
 */
export function MultiSelectCombobox({
  options,
  value,
  onChange,
  placeholder,
  emptyMessage = "No matches.",
}: MultiSelectComboboxProps) {
  const selected = options.filter((option) => value.includes(option.value));

  return (
    <Combobox
      items={options}
      multiple
      value={selected}
      onValueChange={(next) => onChange(next.map((option) => option.value))}
      isItemEqualToValue={(item, val) => item.value === val.value}
    >
      <ComboboxInputGroup>
        <ComboboxChips>
          {selected.map((option) => (
            <ComboboxChip key={option.value} aria-label={option.label}>
              {option.label}
              <ComboboxChipRemove aria-label={`Remove ${option.label}`} />
            </ComboboxChip>
          ))}
          <ComboboxInput placeholder={selected.length > 0 ? "" : placeholder} />
        </ComboboxChips>
        <ComboboxIcon />
      </ComboboxInputGroup>
      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(option: MultiSelectOption) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
