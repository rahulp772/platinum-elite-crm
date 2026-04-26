# Best Lead Experience Implementation Plan

This plan translates the brainstorming notes into a robust architectural blueprint for the Platinum Elite CRM. The goal is to build an intelligent, high-velocity sales engine that enforces strict lead lifecycles, smart assignment, mandatory follow-ups, and a frictionless UI/UX for agents.

## Proposed Changes

---

### Backend: Core & Assignment Algorithm

This layer will enforce the "No lead sits idle" rule and ensure leads are routed to the best possible closer.

#### [MODIFY] `package.json`
- Install `@nestjs/schedule` for background cron jobs since no job queue is currently configured.

#### [MODIFY] `backend-real-estate-crm/src/leads/entities/lead.entity.ts`
- Add `score` (0-100) and `tier` (HIGH, MEDIUM, LOW) fields.
- Add `nextFollowUpDate`, `slaBreachedAt`, and `lastActivityAt`.
- Enforce strict allowed stages: `New`, `Contacted`, `Qualified`, `Site_Visit`, `Negotiation`, `Won`, `Lost`.

#### [NEW] `backend-real-estate-crm/src/users/entities/agent-profile.entity.ts`
- Create an extension of the User entity to store agent metrics.
- Fields: `experienceLevel`, `closingRate`, `activeLeadCount`, `locationSpecializations`, `budgetSpecializations`.

#### [NEW] `backend-real-estate-crm/src/leads/services/lead-scoring.service.ts`
- Implement logic to grade leads immediately upon creation based on source, intent, budget, and location match.
- *Budget Thresholds:* For the MVP, thresholds (HIGH/MEDIUM/LOW) will be inferred dynamically based on existing data averages. (Admin settings will be added in a future phase).

#### [NEW] `backend-real-estate-crm/src/leads/services/lead-assignment.service.ts`
- Implements the hybrid assignment algorithm:
  - **HIGH Tier:** Routes to top-performing agents with lowest active load.
  - **MEDIUM Tier:** Weighted round-robin based on agent performance and availability.
  - **LOW Tier:** Routes to junior agents.
- Applies matching filters (Location, Language, Budget).

#### [NEW] `backend-real-estate-crm/src/leads/services/lead-ai-engine.service.ts`
- A rule-based engine to suggest the "Next Best Action" (e.g., if stage is 'Contacted', suggest 'Schedule Visit') to guide agents effectively.

#### [NEW] `backend-real-estate-crm/src/leads/cron/lead-sla.cron.ts`
- Implement a `@nestjs/schedule` Cron job to monitor SLAs in the background.
- **5-Min Rule:** Identifies leads without first contact and triggers reassignment.
- **Follow-up Missed:** Triggers Team Lead notifications.
- **24-Hour Idle:** Marks leads at risk and notifies Managers.
- *Real-Time Escalations:* Integrates with the existing `@nestjs/websockets` (Socket.io) implementation to push real-time alerts to Managers and Team Leads when SLAs are breached.

---

### Frontend: Action-Oriented UI/UX

The frontend will be redesigned around the principle: "Speed > Beauty. Minimum clicks."

#### [MODIFY] `crm/src/app/(dashboard)/dashboard/page.tsx`
- Implement the "Agent View" dashboard.
- Top Action Zone: Overdue follow-ups (🔴), Today's follow-ups (🟡), New leads (🟢).
- Remove data-heavy graphs from the agent view, replacing them with action queues.

#### [MODIFY] `crm/src/app/(dashboard)/leads/page.tsx`
- Refactor the leads list to be highly interactive without opening details.
- Add "Quick Actions" on each row: `[Call]` `[WhatsApp]` `[Add Note]` `[Quick Status]`.
- Implement visual urgency with color-coded badges based on SLA and follow-up time.

#### [NEW] `crm/src/components/leads/LeadDetailSplitView.tsx`
- Replace standard forms with the high-conversion split view.
- **Left Panel (70%):** Activity Timeline (chronological history of calls, notes, WA logs, status changes) behaving like a chat interface.
- **Right Panel (30%):** Control Center (Big Call/WhatsApp buttons, mandatory next follow-up scheduler, one-click status transitions).
- *WhatsApp Integration:* Include the button in the design, but leave it as a visual placeholder for future API integration.

#### [NEW] `crm/src/app/(dashboard)/pipeline/page.tsx`
- Build the Kanban Board view specifically for Managers and Team Leads.
- Columns based on strictly enforced stages.
- Drag-and-drop functionality to move leads, which will force the "Log Outcome" and "Set Follow-up" modals to appear.

#### [NEW] `crm/src/components/leads/MandatoryFollowUpModal.tsx`
- A modal that intercepts specific actions (like a completed call or stage change) and forces the agent to log an outcome and pick a new follow-up date before continuing.

## Verification Plan

### Automated Tests
- Unit tests for `lead-scoring.service` to verify High/Med/Low assignments based on mock data.
- Unit tests for `lead-assignment.service` to ensure top agents get High tier leads, and workload (availability score) properly penalizes overloaded agents.

### Manual Verification
1. **Flow Test:** Create a lead via API -> Verify Score/Tier -> Verify Agent Assignment -> Wait 5 mins without action -> Verify Reassignment logic via `@nestjs/schedule`.
2. **WebSockets Test:** Ensure Managers receive real-time Socket.io alerts when an SLA breaches.
3. **UI Test:** Log in as an Agent. Ensure the dashboard forces attention to "Overdue" and "Today". Click "Call" on a lead and verify the forced follow-up prompt appears.
4. **Manager View:** Log in as a Manager. Verify the Kanban pipeline view displays the leads correctly and allows drag-and-drop stage updates.
