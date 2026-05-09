# Graph Report - platinum-elite-crm  (2026-05-09)

## Corpus Check
- 327 files · ~291,099 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1073 nodes · 1143 edges · 102 communities detected
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 214 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
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
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 114|Community 114]]
- [[_COMMUNITY_Community 115|Community 115]]
- [[_COMMUNITY_Community 116|Community 116]]
- [[_COMMUNITY_Community 117|Community 117]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 119|Community 119]]
- [[_COMMUNITY_Community 120|Community 120]]
- [[_COMMUNITY_Community 121|Community 121]]
- [[_COMMUNITY_Community 123|Community 123]]
- [[_COMMUNITY_Community 124|Community 124]]
- [[_COMMUNITY_Community 125|Community 125]]
- [[_COMMUNITY_Community 126|Community 126]]

## God Nodes (most connected - your core abstractions)
1. `GET()` - 35 edges
2. `getAuthHeaders()` - 25 edges
3. `LeadsService` - 19 edges
4. `LeadsController` - 17 edges
5. `POST()` - 13 edges
6. `PATCH()` - 13 edges
7. `toISOString()` - 13 edges
8. `AnalyticsService` - 12 edges
9. `updateActiveFilters()` - 12 edges
10. `AnalyticsController` - 10 edges

## Surprising Connections (you probably didn't know these)
- `handleFileUpload()` --calls--> `POST()`  [INFERRED]
  apps\frontend\app\(dashboard)\leads\import\page.tsx → apps\frontend\app\api\v1\[...path]\route.ts
- `handleStartImport()` --calls--> `POST()`  [INFERRED]
  apps\frontend\app\(dashboard)\leads\import\page.tsx → apps\frontend\app\api\v1\[...path]\route.ts
- `PipelinePage()` --calls--> `useAuth()`  [INFERRED]
  apps\frontend\app\(dashboard)\pipeline\page.tsx → apps\frontend\lib\auth-context.tsx
- `createDeal()` --calls--> `getAuthHeaders()`  [INFERRED]
  apps\frontend\app\actions\deals.ts → apps\frontend\lib\auth.ts
- `updateDeal()` --calls--> `getAuthHeaders()`  [INFERRED]
  apps\frontend\app\actions\deals.ts → apps\frontend\lib\auth.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (32): handleSubmit(), handleSubmit(), getTenantIdFromCookies(), getTokenFromCookies(), getUserFromCookies(), getCurrentTenantId(), fetchCompany(), onSubmit() (+24 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (7): ChatGateway, ChatService, JwtStrategy, handleSendMessage(), PortalWebhooksService, UsersController, UsersService

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (29): handleSubmit(), AllExceptionsFilter, formatDateInTimezone(), formatDateOnly(), formatDateTimeInTimezone(), formatRelativeTime(), formatTimeOnly(), getDateLabel() (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (13): ActivityLoggerService, AuditService, createDemoTenants(), deleteDemoTenants(), main(), refreshDemoTenants(), seedDemoData(), showStatus() (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (32): handleSubmit(), parseBudget(), handleSubmit(), authFetch(), getAuthHeaders(), getCurrentUser(), getCurrentUserId(), hasPermission() (+24 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (19): useAppRedirect(), getUserFromCookie(), isLoggedIn(), useAuth(), getCookie(), isAuthenticated(), setCookie(), AuthGuard() (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (3): DealsService, TasksController, TasksService

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (2): LeadScoringService, LeadsService

### Community 8 - "Community 8"
Cohesion: 0.1
Nodes (3): AuthController, AuthService, RolesService

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (5): BulkActionsDialog(), EditLeadDialog(), useLeads(), useUpdateLead(), useUsers()

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (1): LeadsController

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (5): handleGoToToday(), handleLimitChange(), handleNextDay(), handlePageChange(), handlePrevDay()

### Community 12 - "Community 12"
Cohesion: 0.2
Nodes (12): handleAssignedToChange(), handleBudgetMaxChange(), handleBudgetMinChange(), handleBuilderChange(), handleCreatedFromChange(), handleCreatedToChange(), handleFollowUpFromChange(), handleFollowUpToChange() (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.35
Nodes (1): AnalyticsService

### Community 14 - "Community 14"
Cohesion: 0.22
Nodes (2): LeadAssignmentService, LeadSlaCron

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (2): LeadsImportController, LeadsImportService

### Community 16 - "Community 16"
Cohesion: 0.2
Nodes (2): TenantsService, TransactionsService

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (1): AnalyticsController

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (3): handleConnect(), handleNewMessageFn(), transformMessage()

### Community 19 - "Community 19"
Cohesion: 0.2
Nodes (1): DealsController

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (1): PropertiesController

### Community 21 - "Community 21"
Cohesion: 0.31
Nodes (1): PropertiesService

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (3): CalendarPage(), useTasks(), useTasksInfinite()

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (1): BuildersController

### Community 24 - "Community 24"
Cohesion: 0.32
Nodes (1): BuildersService

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (1): ChatController

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (1): RolesController

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (2): handleKeyDown(), handleSend()

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (2): AddBuilderDialog(), useCreateBuilder()

### Community 29 - "Community 29"
Cohesion: 0.39
Nodes (6): MobileChartWrapper(), useChartAnimation(), useIsDesktop(), useIsMobile(), useIsTablet(), useMediaQuery()

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (1): AuditInterceptor

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (3): SanitizePipe, sanitizeObject(), sanitizeString()

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (2): DealsPage(), useDeals()

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (1): PortalWebhooksController

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (1): TenantsController

### Community 39 - "Community 39"
Cohesion: 0.4
Nodes (4): AttachmentDto, CreateConversationDto, GetMessagesQueryDto, SendMessageDto

### Community 40 - "Community 40"
Cohesion: 0.4
Nodes (1): PlansController

### Community 41 - "Community 41"
Cohesion: 0.4
Nodes (1): TransactionsController

### Community 43 - "Community 43"
Cohesion: 0.5
Nodes (1): AppController

### Community 44 - "Community 44"
Cohesion: 0.5
Nodes (1): PermissionsGuard

### Community 45 - "Community 45"
Cohesion: 0.5
Nodes (1): RolesGuard

### Community 46 - "Community 46"
Cohesion: 0.67
Nodes (1): CustomThrottlerGuard

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (3): CreateLeadDto, LeadLookupDto, UpdateLeadDto

### Community 48 - "Community 48"
Cohesion: 0.5
Nodes (1): PlansService

### Community 49 - "Community 49"
Cohesion: 0.5
Nodes (1): SearchController

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (1): SearchService

### Community 53 - "Community 53"
Cohesion: 0.83
Nodes (3): getQueryClient(), makeQueryClient(), QueryProvider()

### Community 58 - "Community 58"
Cohesion: 0.67
Nodes (2): formatBudgetRange(), formatINR()

### Community 59 - "Community 59"
Cohesion: 0.83
Nodes (3): handleKeyDown(), nextImage(), prevImage()

### Community 61 - "Community 61"
Cohesion: 0.67
Nodes (1): AppService

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (2): CreateBuilderDto, UpdateBuilderDto

### Community 64 - "Community 64"
Cohesion: 0.67
Nodes (1): TransformInterceptor

### Community 65 - "Community 65"
Cohesion: 0.67
Nodes (1): LeadAiEngineService

### Community 66 - "Community 66"
Cohesion: 0.67
Nodes (1): Navbar()

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (1): AppModule

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (1): AnalyticsModule

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (1): AuditModule

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (1): AuditLog

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (1): AuthModule

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (1): LoginDto

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (1): RegisterDto

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (1): JwtAuthGuard

### Community 86 - "Community 86"
Cohesion: 1.0
Nodes (1): BuildersModule

### Community 87 - "Community 87"
Cohesion: 1.0
Nodes (1): Builder

### Community 88 - "Community 88"
Cohesion: 1.0
Nodes (1): ChatModule

### Community 89 - "Community 89"
Cohesion: 1.0
Nodes (1): Conversation

### Community 90 - "Community 90"
Cohesion: 1.0
Nodes (1): Message

### Community 91 - "Community 91"
Cohesion: 1.0
Nodes (1): CommonModule

### Community 92 - "Community 92"
Cohesion: 1.0
Nodes (1): DealsModule

### Community 93 - "Community 93"
Cohesion: 1.0
Nodes (1): CreateDealDto

### Community 94 - "Community 94"
Cohesion: 1.0
Nodes (1): UpdateDealDto

### Community 95 - "Community 95"
Cohesion: 1.0
Nodes (1): DealActivity

### Community 96 - "Community 96"
Cohesion: 1.0
Nodes (1): Deal

### Community 97 - "Community 97"
Cohesion: 1.0
Nodes (1): LeadsModule

### Community 98 - "Community 98"
Cohesion: 1.0
Nodes (1): UpdateLeadDto

### Community 99 - "Community 99"
Cohesion: 1.0
Nodes (1): LeadActivity

### Community 100 - "Community 100"
Cohesion: 1.0
Nodes (1): Lead

### Community 101 - "Community 101"
Cohesion: 1.0
Nodes (1): PlansModule

### Community 102 - "Community 102"
Cohesion: 1.0
Nodes (1): PortalWebhooksModule

### Community 103 - "Community 103"
Cohesion: 1.0
Nodes (1): PropertiesModule

### Community 104 - "Community 104"
Cohesion: 1.0
Nodes (1): CreatePropertyDto

### Community 105 - "Community 105"
Cohesion: 1.0
Nodes (1): UpdatePropertyDto

### Community 106 - "Community 106"
Cohesion: 1.0
Nodes (1): Property

### Community 107 - "Community 107"
Cohesion: 1.0
Nodes (1): RolesModule

### Community 108 - "Community 108"
Cohesion: 1.0
Nodes (1): CreateRoleDto

### Community 109 - "Community 109"
Cohesion: 1.0
Nodes (1): UpdateRoleDto

### Community 110 - "Community 110"
Cohesion: 1.0
Nodes (1): Role

### Community 111 - "Community 111"
Cohesion: 1.0
Nodes (1): SearchModule

### Community 112 - "Community 112"
Cohesion: 1.0
Nodes (1): SeedsModule

### Community 113 - "Community 113"
Cohesion: 1.0
Nodes (1): TasksModule

### Community 114 - "Community 114"
Cohesion: 1.0
Nodes (1): CreateTaskDto

### Community 115 - "Community 115"
Cohesion: 1.0
Nodes (1): UpdateTaskDto

### Community 116 - "Community 116"
Cohesion: 1.0
Nodes (1): Task

### Community 117 - "Community 117"
Cohesion: 1.0
Nodes (1): TenantsModule

### Community 118 - "Community 118"
Cohesion: 1.0
Nodes (1): Tenant

### Community 119 - "Community 119"
Cohesion: 1.0
Nodes (1): TransactionsModule

### Community 120 - "Community 120"
Cohesion: 1.0
Nodes (1): Transaction

### Community 121 - "Community 121"
Cohesion: 1.0
Nodes (1): UsersModule

### Community 123 - "Community 123"
Cohesion: 1.0
Nodes (1): InviteUserDto

### Community 124 - "Community 124"
Cohesion: 1.0
Nodes (1): UpdateUserDto

### Community 125 - "Community 125"
Cohesion: 1.0
Nodes (1): AgentProfile

### Community 126 - "Community 126"
Cohesion: 1.0
Nodes (1): User

## Knowledge Gaps
- **57 isolated node(s):** `AppModule`, `AnalyticsModule`, `AuditModule`, `AuditLog`, `AuthModule` (+52 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 7`** (23 nodes): `leads.service.ts`, `lead-scoring.service.ts`, `LeadScoringService`, `.evaluateLead()`, `.logActivity()`, `LeadsService`, `.bulkAssign()`, `.checkDuplicate()`, `.constructor()`, `.create()`, `.findOne()`, `.getActivities()`, `.getMyLeads()`, `.getNewLeads()`, `.getOverdueFollowUps()`, `.getUpcomingFollowUps()`, `.logActivity()`, `.logLeadActivity()`, `.lookup()`, `.reassign()`, `.recalculateAgentClosingRate()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (17 nodes): `leads.controller.ts`, `LeadsController`, `.bulkAssign()`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.getActivities()`, `.getAiSuggestion()`, `.getMyLeads()`, `.getNewLeads()`, `.getOverdueFollowUps()`, `.getUpcomingFollowUps()`, `.lookup()`, `.reassign()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (13 nodes): `AnalyticsService`, `.applyHierarchyFilters()`, `.constructor()`, `.getDashboardStats()`, `.getLeadFunnelStats()`, `.getLeadResponseTime()`, `.getLeadStats()`, `.getPipelineValue()`, `.getPropertyStats()`, `.getRevenueTrend()`, `.getRoleLevel()`, `.getTeamPerformance()`, `analytics.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (13 nodes): `lead-sla.cron.ts`, `lead-assignment.service.ts`, `LeadAssignmentService`, `.assignAgent()`, `.constructor()`, `.filterEligibleAgents()`, `.getBalancedAgent()`, `.getBestAgent()`, `.getJuniorAgent()`, `LeadSlaCron`, `.constructor()`, `.handleMissedFollowUps()`, `.handleNewLeadSla()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (12 nodes): `leads-import.controller.ts`, `leads-import.service.ts`, `LeadsImportController`, `.confirmImport()`, `.constructor()`, `.downloadTemplate()`, `.parseFile()`, `LeadsImportService`, `.constructor()`, `.getTemplate()`, `.importLeads()`, `.parseFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (12 nodes): `tenants.service.ts`, `transactions.service.ts`, `TenantsService`, `.constructor()`, `.findAll()`, `.findOne()`, `.update()`, `TransactionsService`, `.constructor()`, `.createTransaction()`, `.findAll()`, `.findOne()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (11 nodes): `AnalyticsController`, `.constructor()`, `.getDashboardStats()`, `.getLeadFunnelStats()`, `.getLeadResponseTime()`, `.getLeadStats()`, `.getPipelineValue()`, `.getPropertyStats()`, `.getRevenueTrend()`, `.getTeamPerformance()`, `analytics.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (10 nodes): `deals.controller.ts`, `DealsController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.getActivities()`, `.reassign()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (10 nodes): `properties.controller.ts`, `PropertiesController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.findRelated()`, `.remove()`, `.toggleFavorite()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (9 nodes): `properties.service.ts`, `PropertiesService`, `.constructor()`, `.create()`, `.findOne()`, `.findRelated()`, `.remove()`, `.toggleFavorite()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (8 nodes): `builders.controller.ts`, `BuildersController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (8 nodes): `builders.service.ts`, `BuildersService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (8 nodes): `chat.controller.ts`, `ChatController`, `.constructor()`, `.createConversation()`, `.getConversations()`, `.getMessages()`, `.sendMessage()`, `.uploadFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (8 nodes): `roles.controller.ts`, `RolesController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (8 nodes): `chat-window.tsx`, `getOtherParticipant()`, `handleFileSelect()`, `handleKeyDown()`, `handleScroll()`, `handleSend()`, `openImageInGallery()`, `removeFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (8 nodes): `AddBuilderDialog()`, `add-builder-dialog.tsx`, `use-builders.ts`, `useBuilder()`, `useBuilders()`, `useCreateBuilder()`, `useDeleteBuilder()`, `useUpdateBuilder()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (7 nodes): `audit.interceptor.ts`, `AuditInterceptor`, `.constructor()`, `.getResourceFromUrl()`, `.getResourceIdFromUrl()`, `.intercept()`, `SetAuditAction()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (7 nodes): `page.tsx`, `use-deals.ts`, `DealsPage()`, `useCreateDeal()`, `useDeals()`, `useUpdateDeal()`, `useUpdateDealStage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (6 nodes): `portal-webhooks.controller.ts`, `PortalWebhooksController`, `.constructor()`, `.process99acres()`, `.processHousing()`, `.processMagicBricks()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (6 nodes): `tenants.controller.ts`, `TenantsController`, `.constructor()`, `.findAll()`, `.findOne()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (5 nodes): `plans.controller.ts`, `PlansController`, `.constructor()`, `.findAll()`, `.findOne()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (5 nodes): `transactions.controller.ts`, `TransactionsController`, `.constructor()`, `.findAll()`, `.findOne()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (4 nodes): `AppController`, `.constructor()`, `.getHello()`, `app.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (4 nodes): `permissions.guard.ts`, `PermissionsGuard`, `.canActivate()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (4 nodes): `roles.guard.ts`, `RolesGuard`, `.canActivate()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (4 nodes): `throttle.guard.ts`, `CustomThrottlerGuard`, `.canActivate()`, `.shouldSkip()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (4 nodes): `plans.service.ts`, `PlansService`, `.findAll()`, `.findOne()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (4 nodes): `search.controller.ts`, `SearchController`, `.constructor()`, `.globalSearch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (4 nodes): `search.service.ts`, `SearchService`, `.constructor()`, `.globalSearch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (4 nodes): `leads-table.tsx`, `formatBudgetRange()`, `formatINR()`, `getVisiblePages()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (3 nodes): `AppService`, `.getHello()`, `app.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (3 nodes): `create-builder.dto.ts`, `CreateBuilderDto`, `UpdateBuilderDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (3 nodes): `transform.interceptor.ts`, `TransformInterceptor`, `.intercept()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (3 nodes): `lead-ai-engine.service.ts`, `LeadAiEngineService`, `.suggestNextAction()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (3 nodes): `page.tsx`, `page.tsx`, `Navbar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (2 nodes): `AppModule`, `app.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (2 nodes): `AnalyticsModule`, `analytics.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (2 nodes): `audit.module.ts`, `AuditModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (2 nodes): `audit-log.entity.ts`, `AuditLog`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (2 nodes): `auth.module.ts`, `AuthModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (2 nodes): `login.dto.ts`, `LoginDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (2 nodes): `register.dto.ts`, `RegisterDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (2 nodes): `jwt-auth.guard.ts`, `JwtAuthGuard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (2 nodes): `builders.module.ts`, `BuildersModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (2 nodes): `builder.entity.ts`, `Builder`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (2 nodes): `chat.module.ts`, `ChatModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (2 nodes): `conversation.entity.ts`, `Conversation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (2 nodes): `message.entity.ts`, `Message`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (2 nodes): `common.module.ts`, `CommonModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (2 nodes): `deals.module.ts`, `DealsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (2 nodes): `create-deal.dto.ts`, `CreateDealDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (2 nodes): `update-deal.dto.ts`, `UpdateDealDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 95`** (2 nodes): `deal-activity.entity.ts`, `DealActivity`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 96`** (2 nodes): `deal.entity.ts`, `Deal`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (2 nodes): `leads.module.ts`, `LeadsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 98`** (2 nodes): `update-lead.dto.ts`, `UpdateLeadDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (2 nodes): `lead-activity.entity.ts`, `LeadActivity`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (2 nodes): `lead.entity.ts`, `Lead`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 101`** (2 nodes): `plans.module.ts`, `PlansModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (2 nodes): `portal-webhooks.module.ts`, `PortalWebhooksModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (2 nodes): `properties.module.ts`, `PropertiesModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (2 nodes): `create-property.dto.ts`, `CreatePropertyDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 105`** (2 nodes): `update-property.dto.ts`, `UpdatePropertyDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 106`** (2 nodes): `property.entity.ts`, `Property`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 107`** (2 nodes): `roles.module.ts`, `RolesModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (2 nodes): `create-role.dto.ts`, `CreateRoleDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (2 nodes): `update-role.dto.ts`, `UpdateRoleDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 110`** (2 nodes): `role.entity.ts`, `Role`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 111`** (2 nodes): `search.module.ts`, `SearchModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 112`** (2 nodes): `seeds.module.ts`, `SeedsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 113`** (2 nodes): `tasks.module.ts`, `TasksModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 114`** (2 nodes): `create-task.dto.ts`, `CreateTaskDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 115`** (2 nodes): `update-task.dto.ts`, `UpdateTaskDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 116`** (2 nodes): `task.entity.ts`, `Task`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 117`** (2 nodes): `tenants.module.ts`, `TenantsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 118`** (2 nodes): `tenant.entity.ts`, `Tenant`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 119`** (2 nodes): `transactions.module.ts`, `TransactionsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 120`** (2 nodes): `transaction.entity.ts`, `Transaction`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 121`** (2 nodes): `users.module.ts`, `UsersModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 123`** (2 nodes): `invite-user.dto.ts`, `InviteUserDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 124`** (2 nodes): `update-user.dto.ts`, `UpdateUserDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 125`** (2 nodes): `AgentProfile`, `agent-profile.entity.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 126`** (2 nodes): `user.entity.ts`, `User`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GET()` connect `Community 0` to `Community 1`, `Community 3`, `Community 4`, `Community 13`, `Community 30`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `toISOString()` connect `Community 2` to `Community 0`, `Community 3`, `Community 7`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `getTokenFromCookies()` connect `Community 0` to `Community 4`, `Community 5`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Are the 29 inferred relationships involving `GET()` (e.g. with `.getDashboardStats()` and `.getTeamPerformance()`) actually correct?**
  _`GET()` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 22 inferred relationships involving `getAuthHeaders()` (e.g. with `createDeal()` and `updateDeal()`) actually correct?**
  _`getAuthHeaders()` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `POST()` (e.g. with `handleFileUpload()` and `handleStartImport()`) actually correct?**
  _`POST()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AppModule`, `AnalyticsModule`, `AuditModule` to the rest of the system?**
  _57 weakly-connected nodes found - possible documentation gaps or missing edges._