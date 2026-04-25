# Graph Report - platinum-elite-crm  (2026-04-25)

## Corpus Check
- 253 files · ~240,474 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 803 nodes · 769 edges · 89 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 92 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]

## God Nodes (most connected - your core abstractions)
1. `LeadsService` - 19 edges
2. `LeadsController` - 16 edges
3. `AnalyticsService` - 12 edges
4. `updateActiveFilters()` - 11 edges
5. `AnalyticsController` - 10 edges
6. `AuditService` - 10 edges
7. `DealsService` - 10 edges
8. `TasksService` - 10 edges
9. `TeamsController` - 10 edges
10. `TeamsService` - 10 edges

## Surprising Connections (you probably didn't know these)
- `DashboardLayout()` --calls--> `useAuth()`  [INFERRED]
  apps\frontend\app\(dashboard)\layout.tsx → apps\frontend\lib\auth-context.tsx
- `PipelinePage()` --calls--> `useAuth()`  [INFERRED]
  apps\frontend\app\(dashboard)\pipeline\page.tsx → apps\frontend\lib\auth-context.tsx
- `HasPermission()` --calls--> `useAuth()`  [INFERRED]
  apps\frontend\components\auth\has-permission.tsx → apps\frontend\lib\auth-context.tsx
- `handleDateChange()` --calls--> `toISOStringFromLocal()`  [INFERRED]
  apps\frontend\components\leads\lead-detail-split-view.tsx → apps\frontend\lib\date-utils.ts
- `handleSubmit()` --calls--> `toISOStringFromLocal()`  [INFERRED]
  apps\frontend\components\leads\mandatory-follow-up-modal.tsx → apps\frontend\lib\date-utils.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (7): ChatGateway, ChatService, JwtStrategy, bootstrap(), PortalWebhooksService, TasksController, UsersService

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (12): AuditService, AuthService, createDemoTenants(), deleteDemoTenants(), main(), refreshDemoTenants(), seedDemoData(), showStatus() (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (18): formatDateInTimezone(), formatDateOnly(), formatDateTimeInTimezone(), formatRelativeTime(), formatTimeOnly(), getDateLabel(), getUserTimezone(), parseDate() (+10 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (2): LeadScoringService, LeadsService

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (7): AddLeadDialog(), BulkActionsDialog(), EditLeadDialog(), useCreateLead(), useLeads(), useUpdateLead(), useUsers()

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (1): LeadsController

### Community 6 - "Community 6"
Cohesion: 0.21
Nodes (11): handleAssignedToChange(), handleBudgetMaxChange(), handleBudgetMinChange(), handleCreatedFromChange(), handleCreatedToChange(), handleFollowUpFromChange(), handleFollowUpToChange(), handlePropertyTypeChange() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (6): useAuth(), HasPermission(), DashboardLayout(), useNotifications(), PipelinePage(), SocketProvider()

### Community 8 - "Community 8"
Cohesion: 0.35
Nodes (1): AnalyticsService

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (2): LeadAssignmentService, LeadSlaCron

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (1): AnalyticsController

### Community 11 - "Community 11"
Cohesion: 0.35
Nodes (1): DealsService

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (1): TeamsController

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (1): TeamsService

### Community 14 - "Community 14"
Cohesion: 0.2
Nodes (1): DealsController

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (1): PropertiesController

### Community 16 - "Community 16"
Cohesion: 0.27
Nodes (1): PropertiesService

### Community 17 - "Community 17"
Cohesion: 0.31
Nodes (1): TasksService

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (3): handleConnect(), handleNewMessageFn(), transformMessage()

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (3): CalendarPage(), useTasks(), useTasksInfinite()

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (1): ChatController

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (1): RolesController

### Community 23 - "Community 23"
Cohesion: 0.32
Nodes (1): RolesService

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (1): UsersController

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (2): handleKeyDown(), handleSend()

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (1): AuditInterceptor

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (1): AuthController

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (2): DealsPage(), useDeals()

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (1): PortalWebhooksController

### Community 33 - "Community 33"
Cohesion: 0.4
Nodes (4): AttachmentDto, CreateConversationDto, GetMessagesQueryDto, SendMessageDto

### Community 34 - "Community 34"
Cohesion: 0.4
Nodes (1): TenantsController

### Community 35 - "Community 35"
Cohesion: 0.4
Nodes (1): TenantsService

### Community 36 - "Community 36"
Cohesion: 0.5
Nodes (1): AppController

### Community 37 - "Community 37"
Cohesion: 0.5
Nodes (1): PermissionsGuard

### Community 38 - "Community 38"
Cohesion: 0.5
Nodes (1): RolesGuard

### Community 39 - "Community 39"
Cohesion: 0.5
Nodes (3): CreateLeadDto, LeadLookupDto, UpdateLeadDto

### Community 40 - "Community 40"
Cohesion: 0.5
Nodes (1): SearchController

### Community 41 - "Community 41"
Cohesion: 0.5
Nodes (1): SearchService

### Community 50 - "Community 50"
Cohesion: 0.83
Nodes (3): handleKeyDown(), nextImage(), prevImage()

### Community 51 - "Community 51"
Cohesion: 0.5
Nodes (2): handleSubmit(), NotificationsForm()

### Community 52 - "Community 52"
Cohesion: 0.67
Nodes (1): AppService

### Community 53 - "Community 53"
Cohesion: 0.67
Nodes (1): LeadAiEngineService

### Community 54 - "Community 54"
Cohesion: 0.67
Nodes (2): CreateTeamDto, UpdateTeamDto

### Community 55 - "Community 55"
Cohesion: 0.67
Nodes (1): Navbar()

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (2): formatBudgetRange(), formatINR()

### Community 66 - "Community 66"
Cohesion: 1.0
Nodes (1): AppModule

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (1): AnalyticsModule

### Community 68 - "Community 68"
Cohesion: 1.0
Nodes (1): AuditModule

### Community 69 - "Community 69"
Cohesion: 1.0
Nodes (1): AuditLog

### Community 70 - "Community 70"
Cohesion: 1.0
Nodes (1): AuthModule

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (1): LoginDto

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (1): RegisterDto

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (1): JwtAuthGuard

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (1): ChatModule

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (1): Conversation

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (1): Message

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (1): DealsModule

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (1): CreateDealDto

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (1): UpdateDealDto

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (1): DealActivity

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (1): Deal

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (1): LeadsModule

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (1): UpdateLeadDto

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (1): LeadActivity

### Community 86 - "Community 86"
Cohesion: 1.0
Nodes (1): Lead

### Community 87 - "Community 87"
Cohesion: 1.0
Nodes (1): PortalWebhooksModule

### Community 88 - "Community 88"
Cohesion: 1.0
Nodes (1): PropertiesModule

### Community 89 - "Community 89"
Cohesion: 1.0
Nodes (1): CreatePropertyDto

### Community 90 - "Community 90"
Cohesion: 1.0
Nodes (1): UpdatePropertyDto

### Community 91 - "Community 91"
Cohesion: 1.0
Nodes (1): Property

### Community 92 - "Community 92"
Cohesion: 1.0
Nodes (1): RolesModule

### Community 93 - "Community 93"
Cohesion: 1.0
Nodes (1): CreateRoleDto

### Community 94 - "Community 94"
Cohesion: 1.0
Nodes (1): UpdateRoleDto

### Community 95 - "Community 95"
Cohesion: 1.0
Nodes (1): Role

### Community 96 - "Community 96"
Cohesion: 1.0
Nodes (1): SearchModule

### Community 97 - "Community 97"
Cohesion: 1.0
Nodes (1): SeedsModule

### Community 98 - "Community 98"
Cohesion: 1.0
Nodes (1): TasksModule

### Community 99 - "Community 99"
Cohesion: 1.0
Nodes (1): CreateTaskDto

### Community 100 - "Community 100"
Cohesion: 1.0
Nodes (1): UpdateTaskDto

### Community 101 - "Community 101"
Cohesion: 1.0
Nodes (1): Task

### Community 102 - "Community 102"
Cohesion: 1.0
Nodes (1): TeamsModule

### Community 103 - "Community 103"
Cohesion: 1.0
Nodes (1): Team

### Community 104 - "Community 104"
Cohesion: 1.0
Nodes (1): TenantsModule

### Community 105 - "Community 105"
Cohesion: 1.0
Nodes (1): Tenant

### Community 106 - "Community 106"
Cohesion: 1.0
Nodes (1): UsersModule

### Community 108 - "Community 108"
Cohesion: 1.0
Nodes (1): InviteUserDto

### Community 109 - "Community 109"
Cohesion: 1.0
Nodes (1): UpdateUserDto

### Community 110 - "Community 110"
Cohesion: 1.0
Nodes (1): AgentProfile

### Community 111 - "Community 111"
Cohesion: 1.0
Nodes (1): User

## Knowledge Gaps
- **53 isolated node(s):** `AppModule`, `AnalyticsModule`, `AuditModule`, `AuditLog`, `AuthModule` (+48 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 3`** (22 nodes): `leads.service.ts`, `lead-scoring.service.ts`, `LeadScoringService`, `.evaluateLead()`, `LeadsService`, `.bulkAssign()`, `.checkDuplicate()`, `.constructor()`, `.create()`, `.findOne()`, `.getActivities()`, `.getMyLeads()`, `.getNewLeads()`, `.getOverdueFollowUps()`, `.getUpcomingFollowUps()`, `.logActivity()`, `.logLeadActivity()`, `.lookup()`, `.reassign()`, `.recalculateAgentClosingRate()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (17 nodes): `leads.controller.ts`, `LeadsController`, `.bulkAssign()`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.getActivities()`, `.getMyLeads()`, `.getNewLeads()`, `.getOverdueFollowUps()`, `.getUpcomingFollowUps()`, `.logActivity()`, `.lookup()`, `.reassign()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (13 nodes): `AnalyticsService`, `.applyHierarchyFilters()`, `.constructor()`, `.getDashboardStats()`, `.getLeadFunnelStats()`, `.getLeadResponseTime()`, `.getLeadStats()`, `.getPipelineValue()`, `.getPropertyStats()`, `.getRevenueTrend()`, `.getRoleLevel()`, `.getTeamPerformance()`, `analytics.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (13 nodes): `lead-sla.cron.ts`, `lead-assignment.service.ts`, `LeadAssignmentService`, `.assignAgent()`, `.constructor()`, `.filterEligibleAgents()`, `.getBalancedAgent()`, `.getBestAgent()`, `.getJuniorAgent()`, `LeadSlaCron`, `.constructor()`, `.handleMissedFollowUps()`, `.handleNewLeadSla()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (11 nodes): `AnalyticsController`, `.constructor()`, `.getDashboardStats()`, `.getLeadFunnelStats()`, `.getLeadResponseTime()`, `.getLeadStats()`, `.getPipelineValue()`, `.getPropertyStats()`, `.getRevenueTrend()`, `.getTeamPerformance()`, `analytics.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (11 nodes): `deals.service.ts`, `DealsService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.getActivities()`, `.logActivity()`, `.reassign()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (11 nodes): `teams.controller.ts`, `TeamsController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.getTeamLeadMembers()`, `.getTeamMembers()`, `.getUserTeam()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (11 nodes): `teams.service.ts`, `.findAll()`, `TeamsService`, `.constructor()`, `.findAll()`, `.findOne()`, `.getTeamLeadMembers()`, `.getTeamMembers()`, `.getUserTeam()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (10 nodes): `deals.controller.ts`, `DealsController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.getActivities()`, `.reassign()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (10 nodes): `properties.controller.ts`, `PropertiesController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.findRelated()`, `.remove()`, `.toggleFavorite()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (10 nodes): `properties.service.ts`, `PropertiesService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.findRelated()`, `.remove()`, `.toggleFavorite()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (10 nodes): `tasks.service.ts`, `TasksService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.getBaseQuery()`, `.getUserWithRole()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (8 nodes): `chat.controller.ts`, `ChatController`, `.constructor()`, `.createConversation()`, `.getConversations()`, `.getMessages()`, `.sendMessage()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (8 nodes): `roles.controller.ts`, `RolesController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (8 nodes): `roles.service.ts`, `RolesService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (8 nodes): `users.controller.ts`, `UsersController`, `.constructor()`, `.findAll()`, `.findOne()`, `.invite()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (8 nodes): `chat-window.tsx`, `getOtherParticipant()`, `handleFileSelect()`, `handleKeyDown()`, `handleScroll()`, `handleSend()`, `openImageInGallery()`, `removeFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (7 nodes): `audit.interceptor.ts`, `AuditInterceptor`, `.constructor()`, `.getResourceFromUrl()`, `.getResourceIdFromUrl()`, `.intercept()`, `SetAuditAction()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (7 nodes): `auth.controller.ts`, `AuthController`, `.constructor()`, `.getProfile()`, `.login()`, `.methodNotAllowed()`, `.register()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (7 nodes): `page.tsx`, `use-deals.ts`, `DealsPage()`, `useCreateDeal()`, `useDeals()`, `useUpdateDeal()`, `useUpdateDealStage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (6 nodes): `portal-webhooks.controller.ts`, `PortalWebhooksController`, `.constructor()`, `.process99acres()`, `.processHousing()`, `.processMagicBricks()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (5 nodes): `tenants.controller.ts`, `TenantsController`, `.constructor()`, `.findAll()`, `.findOne()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (5 nodes): `tenants.service.ts`, `TenantsService`, `.constructor()`, `.findAll()`, `.findOne()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (4 nodes): `AppController`, `.constructor()`, `.getHello()`, `app.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (4 nodes): `permissions.guard.ts`, `PermissionsGuard`, `.canActivate()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (4 nodes): `roles.guard.ts`, `RolesGuard`, `.canActivate()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (4 nodes): `search.controller.ts`, `SearchController`, `.constructor()`, `.globalSearch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (4 nodes): `search.service.ts`, `SearchService`, `.constructor()`, `.globalSearch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (4 nodes): `handleSubmit()`, `notifications-form.tsx`, `add-task-dialog.tsx`, `NotificationsForm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (3 nodes): `AppService`, `.getHello()`, `app.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (3 nodes): `lead-ai-engine.service.ts`, `LeadAiEngineService`, `.suggestNextAction()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (3 nodes): `create-team.dto.ts`, `CreateTeamDto`, `UpdateTeamDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (3 nodes): `page.tsx`, `page.tsx`, `Navbar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (3 nodes): `leads-table.tsx`, `formatBudgetRange()`, `formatINR()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (2 nodes): `AppModule`, `app.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (2 nodes): `AnalyticsModule`, `analytics.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (2 nodes): `audit.module.ts`, `AuditModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (2 nodes): `audit-log.entity.ts`, `AuditLog`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (2 nodes): `auth.module.ts`, `AuthModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (2 nodes): `login.dto.ts`, `LoginDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (2 nodes): `register.dto.ts`, `RegisterDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (2 nodes): `jwt-auth.guard.ts`, `JwtAuthGuard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (2 nodes): `chat.module.ts`, `ChatModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (2 nodes): `conversation.entity.ts`, `Conversation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (2 nodes): `message.entity.ts`, `Message`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (2 nodes): `deals.module.ts`, `DealsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (2 nodes): `create-deal.dto.ts`, `CreateDealDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (2 nodes): `update-deal.dto.ts`, `UpdateDealDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (2 nodes): `deal-activity.entity.ts`, `DealActivity`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (2 nodes): `deal.entity.ts`, `Deal`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (2 nodes): `leads.module.ts`, `LeadsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (2 nodes): `update-lead.dto.ts`, `UpdateLeadDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (2 nodes): `lead-activity.entity.ts`, `LeadActivity`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (2 nodes): `lead.entity.ts`, `Lead`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (2 nodes): `portal-webhooks.module.ts`, `PortalWebhooksModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (2 nodes): `properties.module.ts`, `PropertiesModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (2 nodes): `create-property.dto.ts`, `CreatePropertyDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (2 nodes): `update-property.dto.ts`, `UpdatePropertyDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (2 nodes): `property.entity.ts`, `Property`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (2 nodes): `roles.module.ts`, `RolesModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (2 nodes): `create-role.dto.ts`, `CreateRoleDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (2 nodes): `update-role.dto.ts`, `UpdateRoleDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 95`** (2 nodes): `role.entity.ts`, `Role`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 96`** (2 nodes): `search.module.ts`, `SearchModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (2 nodes): `seeds.module.ts`, `SeedsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 98`** (2 nodes): `tasks.module.ts`, `TasksModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (2 nodes): `create-task.dto.ts`, `CreateTaskDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (2 nodes): `update-task.dto.ts`, `UpdateTaskDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 101`** (2 nodes): `task.entity.ts`, `Task`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (2 nodes): `teams.module.ts`, `TeamsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (2 nodes): `team.entity.ts`, `Team`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (2 nodes): `tenants.module.ts`, `TenantsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 105`** (2 nodes): `tenant.entity.ts`, `Tenant`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 106`** (2 nodes): `users.module.ts`, `UsersModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (2 nodes): `invite-user.dto.ts`, `InviteUserDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (2 nodes): `update-user.dto.ts`, `UpdateUserDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 110`** (2 nodes): `AgentProfile`, `agent-profile.entity.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 111`** (2 nodes): `user.entity.ts`, `User`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `toISOString()` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `LeadsService` connect `Community 3` to `Community 13`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `AppModule`, `AnalyticsModule`, `AuditModule` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._