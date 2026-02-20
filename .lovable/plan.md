

## Fix Stakeholders Section Layout

### Current Issues
- Label width is set to 38% which is too wide, pushing content to the right
- Text is too small (10px) and hard to read
- Spacing between elements is cramped
- The info and + buttons are tiny (18px columns) and hard to click
- No visual separation between the two columns
- Empty state looks awkward with invisible spacer divs
- Dropdown may get clipped or hidden behind other elements

### Reference Image Analysis
The uploaded image shows a clean, well-spaced layout:
- Labels like "Budget Owner :", "Champion :" are left-aligned with readable size
- Contact names ("Deepak") are clearly visible with good spacing
- Info (i) and + buttons are well-spaced and easily clickable
- Two columns with clear visual separation

### Changes (File: `src/components/DealExpandedPanel.tsx`)

#### 1. Fix column proportions
- Change label width from `38%` to `28%` -- labels don't need that much space
- Give contact names more room with `flex-1`
- Increase info and + button columns from `18px` to `24px` for better clickability

#### 2. Increase text size and spacing
- Bump label text from `text-[10px]` to `text-xs` (12px)
- Bump contact name text from `text-[10px]` to `text-xs`
- Increase row height from `h-4` to `h-5` for better readability
- Increase gap between rows from `gap-0.5` to `gap-1`
- Increase grid gap from `gap-y-1` to `gap-y-2` for breathing room between role rows

#### 3. Improve visual styling
- Add subtle bottom border to each role row for visual separation
- Style labels with consistent color and colon formatting
- Add a slight left padding to contact names for alignment

#### 4. Ensure dropdown visibility
- Add `sideOffset={4}` to the StakeholderAddDropdown's PopoverContent
- Set `avoidCollisions={true}` (currently `false`) so the dropdown repositions if near edges
- Ensure z-index `z-[200]` is maintained
- Set a minimum width of `200px` on the dropdown so it's always usable regardless of cell size

#### 5. Improve empty state
- Show a subtle "No contact" placeholder text instead of an invisible spacer div
- Style it as muted italic text

#### 6. Button improvements
- Make the + button slightly larger and add a subtle hover background
- Make info button consistently visible (not opacity-50) but muted color, with hover highlight
- Increase hit area on both buttons

### Technical Details

All changes are confined to `src/components/DealExpandedPanel.tsx`, specifically the `StakeholdersSection` component (lines ~370-482) and the `StakeholderAddDropdown` component (lines ~220-294).

Key style changes:
- Label: `text-xs font-medium text-muted-foreground` with `width: 28%`
- Contact row: `h-5` with `text-xs` text, `gap-1` between rows
- Grid: `gap-x-6 gap-y-2.5` for cleaner column/row spacing
- Info/+ buttons: `w-6 h-5` with proper hover states
- Dropdown: `avoidCollisions={true}`, min-width 200px, `z-[200]`
- Empty state: `<span className="text-xs text-muted-foreground/50 italic">--</span>`

