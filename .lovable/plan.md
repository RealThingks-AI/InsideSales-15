
## Stakeholders Section – Full Layout Redesign

### Reference Image Analysis

The image defines a precise column layout for each of the 2 stakeholder columns (50% of total width each):

```text
|-- 14% Label --|-- 30% Contact Name(s) --|-- 3% info --|-- 3% + --|
```

- **Label** (14%): "Budget Owner", "Champion", etc. — fixed, vertically top-aligned
- **Contact Names** (30%): stacked vertically, one per row, each truncated
- **Info button** (3%): one `i` button per contact, stacked alongside the contact name — appears/disappears per row
- **+ Add button** (3%): a single `+` icon button, appears on the **first row** only (top-right), opens a dropdown of 40% width

Key observations:
- The `+` button does **NOT** shift for each contact — it's fixed at top-right of the role block
- Each contact row is: `[contact name (30%)] [i button (3%)]`
- The `+` column (3%) is separate and sits on the right, aligned to the top
- When no contacts: label + empty space + `+` button

### Implementation Plan

**File: `src/components/DealExpandedPanel.tsx`** — rewrite `StakeholdersSection` (lines 257–310)

#### 1. Lift contacts fetch into `StakeholdersSection` (single fetch, shared across all 4 roles)

Move the contacts data fetch from `ContactSearchableDropdown` (which fires 4 separate fetches) into `StakeholdersSection` state. Pass contacts down to the inline add-dropdown. This eliminates 3 redundant network requests.

#### 2. Build an inline `StakeholderAddDropdown` sub-component

A small, self-contained Popover-based search dropdown defined inside `DealExpandedPanel.tsx`:
- Trigger: a `+` icon button (no text, compact)
- `PopoverContent` width: fixed pixel value derived from `ref` measurement of the row container × 0.40, so it's always exactly 40% of the available row width
- Uses `Command` / `CommandInput` / `CommandList` for search (same pattern as `ContactSearchableDropdown`)
- Accepts `contacts` and `excludeIds` (already-added contacts for this role) as props — filters them out
- On select: calls `onAdd(role, contact)` and closes

#### 3. Rewrite the role row layout

Each role cell uses a strict 4-column flex layout:

```tsx
<div className="flex items-start">
  {/* 14% — Label */}
  <span style={{ width: '14%' }} className="shrink-0 ...">Budget Owner :</span>

  {/* 30% — Contact names stacked vertically */}
  <div style={{ width: '30%' }} className="flex flex-col gap-0.5 min-w-0">
    {roleStakeholders.map(sh => (
      <div key={sh.id} className="flex items-center">
        <span className="truncate text-[10px]">{contactNames[sh.contact_id]}</span>
      </div>
    ))}
  </div>

  {/* 3% — Info buttons stacked vertically (one per contact) */}
  <div style={{ width: '3%' }} className="flex flex-col gap-0.5 items-center">
    {roleStakeholders.map(sh => (
      <InfoPopover key={sh.id} stakeholder={sh} ... />
    ))}
  </div>

  {/* 3% — Single + Add button at the top */}
  <div style={{ width: '3%' }} className="flex items-start justify-center">
    <StakeholderAddDropdown ... />
  </div>
</div>
```

#### 4. Remove X (remove contact) from inline view

The `X` remove button currently sits inside the contact chip. Per the reference image there is no `X` visible — removal can be accessed via the info popover or kept as a hover-only state to keep the layout clean. We'll add it as a hover-only element inside the contact name area.

#### 5. Grid layout stays `grid-cols-2`

The outer `grid grid-cols-2 gap-x-6 gap-y-2` is kept, giving each role cell exactly 50% width to work within.

### Technical Details

- **Width percentages via `style` prop** — Tailwind percentage classes like `w-[14%]` work fine here but inline `style={{ width: '14%' }}` is more reliable inside flex containers. We'll use Tailwind `w-[14%]`, `w-[30%]`, `w-[3%]` classes which are JIT-safe.
- **Dropdown width**: The `PopoverContent` for the add-dropdown will use `style={{ width: '200px' }}` as a sensible fixed minimum, plus `align="start"` so it doesn't overflow. Alternatively we measure the grid container via `useRef` — we'll use a ref for accuracy.
- **Single contacts fetch**: Add `contacts` state + `loading` state to `StakeholdersSection`; pass the array to each `StakeholderAddDropdown`; each dropdown filters out contacts already in that role using `excludeIds`.
- **Info popover**: Keep existing Popover note-editing behavior, just relocated to the 3% column, stacked per contact.
- **X remove**: Show on hover of the contact name row using `group/row` and `group-hover/row:opacity-100 opacity-0` pattern.
