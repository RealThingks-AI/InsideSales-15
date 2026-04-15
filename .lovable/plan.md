

## Add Email / LinkedIn / Call Subsections to Outreach Tab

Currently the Outreach tab shows all communications in a single flat list/thread view. The plan adds three dedicated sub-tabs within the Outreach section, each with channel-specific UI, metrics, and actions.

### Design

The existing `CampaignCommunications` component will gain an inner `Tabs` component with four tabs:

1. **All** — current unified list/thread view (default)
2. **Email** — filtered to Email only, shows email-specific columns (Subject, Status, Delivery), "Send Email" and "Reply" actions
3. **LinkedIn** — filtered to LinkedIn only, shows LinkedIn-specific columns (Connection Status, Message), "Log LinkedIn" action
4. **Call** — filtered to Call/Phone only, shows call-specific columns (Outcome, Duration), phone script reference panel, "Log Call" action

Each sub-tab shows a count badge (e.g., "Email (5)") and channel-specific summary stats at the top (e.g., Sent/Opened/Replied counts for Email).

### Changes

**File: `src/components/campaigns/CampaignCommunications.tsx`** (rewrite ~350 lines)

1. Add `outreachTab` state: `"all" | "email" | "linkedin" | "call"` defaulting to `"all"`

2. Compute per-channel counts from `communications`:
   - `emailComms` = filter by `communication_type === "Email"`
   - `linkedinComms` = filter by `communication_type === "LinkedIn"`
   - `callComms` = filter by `communication_type === "Call" || "Phone"`

3. Add inner Tabs below the header:
   ```
   All (total) | Email (n) | LinkedIn (n) | Call (n)
   ```

4. **All tab** — keeps existing list/thread view with all filters intact (no changes)

5. **Email tab** — dedicated view:
   - Summary stats row: Sent count, Opened count, Replied count, Bounced count
   - Table columns: Date, Contact, Account, Subject, Status, Delivery, Owner, Actions (Reply, Task)
   - "Send Email" button in header
   - Filters: contact, account, owner (channel filter removed since it's implicit)

6. **LinkedIn tab** — dedicated view:
   - Summary stats row: Connection Sent, Connected, Message Sent, Responded counts
   - Table columns: Date, Contact, Account, LinkedIn Status, Notes, Owner, Actions (Task)
   - "Log LinkedIn" button in header opens log modal pre-set to LinkedIn channel

7. **Call tab** — dedicated view:
   - Summary stats row: Interested, Not Interested, Call Later, No Answer counts
   - Table columns: Date, Contact, Account, Outcome, Notes, Owner, Actions (Task)
   - "Log Call" button in header opens log modal pre-set to Call channel
   - Phone script reference panel shown below table (if scripts exist)

8. **Optimization**: Extract shared table rendering into a helper function `renderCommTable(comms, columns, channelType)` to avoid duplicating table markup across tabs. Each tab passes its filtered data and column config.

9. **Optimization**: The existing `channelFilter` dropdown becomes redundant when on a specific channel tab — hide it on Email/LinkedIn/Call tabs, show only on "All" tab.

10. Move "Send Email" button to appear only on All and Email tabs. Move "+ Log" to show on all tabs but pre-select the channel when on a specific tab.

### Technical Details

- No new files — all changes within `CampaignCommunications.tsx`
- No database changes
- The inner tabs use the existing `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` components
- Summary stat cards use small inline `div` blocks with counts, not full `Card` components, to keep it compact
- The `logModalOpen` handler will accept an optional `defaultChannel` param so clicking "+ Log Call" on the Call tab pre-selects "Call"
- Existing thread view only shown on "All" tab (channel-specific tabs always use list view since threading across a single channel is less useful)

