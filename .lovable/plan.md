

## Fix Campaign Outreach Section Issues

### Issues Found

**1. Duplicate filters in Outreach UI**
The "All" tab has both channel sub-tabs (All/Email/LinkedIn/Call) AND a "All Channels" dropdown filter inside `renderFilters(true)`. When on the "All" tab, the channel dropdown duplicates the tab functionality. Additionally, each channel sub-tab still shows Contact/Account/Owner filter dropdowns that look redundant alongside the tabs.

**2. LinkedIn templates showing in Email Compose modal**
`EmailComposeModal` queries ALL `campaign_email_templates` for the campaign without filtering by `email_type`. Templates with `email_type = "LinkedIn-Connection"` or `"LinkedIn-Followup"` appear in the email template picker. These should be excluded since they're LinkedIn message templates, not email templates.

**3. Task creation from outreach doesn't populate Contact/Account**
The `handleCreateTask` function (line 225-238) creates an `action_item` but never sets contact or account info. It only saves `title`, `description`, `due_date`, `priority`. The `taskContactId` is tracked in state but never used in the insert. Meanwhile, `CampaignActionItems` extracts contact/account from description text via regex — but the outreach task creator doesn't write that metadata into the description either.

**4. Additional issues found**
- The "Create Follow-up Task" modal from outreach (lines 867-902) has no Contact or Account fields visible — user can't see or change which contact/account the task is for
- The `openTaskForContact` function sets `taskContactId` but `handleCreateTask` ignores it entirely
- When "Send Email" button shows on LinkedIn tab (line 670-673: shows when `outreachTab === "all" || outreachTab === "email"`), it correctly hides on LinkedIn/Call tabs, but the "+ Log" button label says "Log" on "all" tab which is vague

### Changes

#### File: `src/components/campaigns/EmailComposeModal.tsx`
- Filter templates query to exclude LinkedIn types: add `.not('email_type', 'in', '("LinkedIn-Connection","LinkedIn-Followup")')` to the query, OR filter in JS after fetch

#### File: `src/components/campaigns/CampaignCommunications.tsx`

**Fix duplicate filters:**
- Remove the "All Channels" dropdown from `renderFilters` when called from "All" tab — the channel tabs already serve this purpose
- Only show `channelFilter` dropdown inside the "All" tab if viewMode is "list" and remove it from the filter bar; the tabs handle channel switching

**Fix task creation from outreach:**
- In `handleCreateTask`, look up the contact name and account from `campaignContacts` using `taskContactId`
- Write `Contact: <name> | Account: <name>` into the description (matching the format `CampaignActionItems` parses via regex)
- Add read-only Contact and Account display fields to the "Create Follow-up Task" modal so the user can see which contact/account the task is linked to

**UI cleanup:**
- Remove the channel filter dropdown from `renderFilters` entirely — the sub-tabs already handle this
- On "all" tab, the "+ Log" button should say "+ Log Activity" for clarity

### Technical Details

1. **EmailComposeModal.tsx** (line 63): Add `.not('email_type', 'in', '("LinkedIn-Connection","LinkedIn-Followup")')` or filter in useMemo after query
2. **CampaignCommunications.tsx** (line 507-551): Remove `showChannelFilter` parameter and the channel dropdown from `renderFilters`
3. **CampaignCommunications.tsx** (lines 225-238): Update `handleCreateTask` to enrich description with contact/account names using `taskContactId` + `campaignContacts`/`campaignAccounts`
4. **CampaignCommunications.tsx** (lines 867-902): Add read-only Contact and Account info display in the task modal when `taskContactId` is set

