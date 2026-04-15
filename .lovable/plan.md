

## Fix Campaign Email Outreach Issues

### Issues Identified

**1. Emails sent from shared CRM address instead of logged-in user's email**

The `send-campaign-email` edge function uses `azureConfig.senderEmail` (the `AZURE_SENDER_EMAIL` env var, set to `crm@realthingks.com`) as the sender for Microsoft Graph's `sendMail` endpoint. This is a shared mailbox. To send as the logged-in user, the function should use the user's email from `user.email` as the sender in the Graph API call — Microsoft Graph supports `sendMail` on behalf of any licensed user in the tenant when using client credentials with `Mail.Send` application permission.

**Changes:**
- `supabase/functions/send-campaign-email/index.ts`: Use `user.email` as the sender email for `sendEmailViaGraph()` instead of `azureConfig.senderEmail`. Keep `azureConfig.senderEmail` as fallback if user email is unavailable. Also update `sender_email` in both `campaign_communications` and `email_history` inserts to reflect the actual sender.
- `supabase/functions/_shared/azure-email.ts`: No changes needed — the `sendEmailViaGraph` function already accepts `senderEmail` as a parameter.

**2. Email thread/replies not tracked — no reply detection**

The system sends emails via Microsoft Graph but has no mechanism to detect incoming replies. The Graph API does return a server-assigned `Message-ID` and `Conversation-ID`, but the current code:
- Generates its own `messageId` via `crypto.randomUUID()` instead of capturing Graph's
- Has no webhook or polling to check for replies in the user's mailbox

This is an architectural limitation — Microsoft Graph requires either:
- A webhook subscription (`/subscriptions`) to get notified of new messages, or
- Periodic polling of the user's inbox for messages in the same conversation

**Feasible improvement for now:**
- Capture the actual Graph `Message-ID` from the send response headers (Graph returns `202 Accepted` with no body for `sendMail`, so we'd need to use `messages` endpoint + `send` instead to get the ID). As a practical step, switch to the two-step approach: create draft via `POST /users/{email}/messages`, then send via `POST /users/{email}/messages/{id}/send`. The draft creation returns the `internetMessageId` and `conversationId`.
- Store these in `campaign_communications` for future thread correlation.
- Add a note in the UI that reply tracking requires manual logging for now, with a visible "Log Reply" button.

**However**, full reply detection requires either a Graph webhook or a polling function — this is a larger feature. For this cycle, I will:
- Add a prominent "Log Reply" action button in the outreach table for email records
- Pre-fill the log form with the original thread context (contact, account, subject with "Re:" prefix)
- Set `email_status` to "Replied" for tracked replies

**3. "manual" delivery status showing for emails**

In `handleLogCommunication` (line 180), when manually logging an email activity, `delivery_status` is set to `"manual"`. This is technically correct (it distinguishes logged-from-outside vs sent-via-CRM emails) but confusing to users.

**Fix:** Change the display label from "manual" to "Logged" in the `deliveryBadge` function. Keep the underlying value as "manual" in the database but display it more clearly.

**4. Additional bugs found:**

- **Log Activity modal shows Email fields for all channels**: The `logForm` defaults `communication_type` to "Email" and the modal always shows `email_status` field. When logging a Call, the email-specific fields should be hidden (partially handled but `email_status` still defaults).
- **"Send Email" button visible on "All" tab**: Users might click Send Email from the All tab context where no channel filter is applied — this works but could be confusing since it opens the compose modal without channel context.
- **Thread view groups by contact, not by email conversation**: The threads view groups all communications by `contact_id` rather than by actual email threads (`thread_id`). This means emails, calls, and LinkedIn messages all merge into one "thread" per contact.

### Implementation Plan

#### File: `supabase/functions/send-campaign-email/index.ts`
- After authenticating user, use `user.email` as sender email for Graph API
- Pass `user.email` (with `azureConfig.senderEmail` as fallback) to `sendEmailViaGraph`
- Update `sender_email` in `campaign_communications` and `email_history` inserts

#### File: `src/components/campaigns/CampaignCommunications.tsx`
- **deliveryBadge**: Change display of "manual" to "Logged" with a neutral style
- **Add "Log Reply" action**: For email records, add a button that opens the log modal pre-filled with the contact, account, subject ("Re: ..."), and `email_status: "Replied"`
- **Expanded row cleanup**: Don't show "Delivery: manual (via manual)" — simplify to just "Logged manually"

#### Deployment
- Redeploy `send-campaign-email` edge function after changes

