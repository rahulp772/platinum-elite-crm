# Graph Report - .  (2026-04-23)

## Corpus Check
- Code-only corpus

## Summary
- 586 nodes · 498 edges · 80 communities detected
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
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
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]

## God Nodes (most connected - your core abstractions)
1. `LeadsService` - 14 edges
2. `LeadsController` - 12 edges
3. `TeamsController` - 10 edges
4. `TeamsService` - 10 edges
5. `ChatGateway` - 9 edges
6. `ChatService` - 9 edges
7. `PortalWebhooksService` - 9 edges
8. `PropertiesController` - 9 edges
9. `PropertiesService` - 9 edges
10. `SeedService` - 8 edges

## Surprising Connections (you probably didn't know these)
- `DashboardLayout()` --calls--> `useAuth()`  [INFERRED]
  C:\Users\Rahul\Documents\CRM\platinum-elite-crm\apps\frontend\app\(dashboard)\layout.tsx → C:\Users\Rahul\Documents\CRM\platinum-elite-crm\apps\frontend\lib\auth-context.tsx
- `CalendarPage()` --calls--> `useTasks()`  [INFERRED]
  C:\Users\Rahul\Documents\CRM\platinum-elite-crm\apps\frontend\app\(dashboard)\calendar\page.tsx → C:\Users\Rahul\Documents\CRM\platinum-elite-crm\apps\frontend\hooks\use-tasks.ts
- `DealsPage()` --calls--> `useDeals()`  [INFERRED]
  C:\Users\Rahul\Documents\CRM\platinum-elite-crm\apps\frontend\app\(dashboard)\deals\page.tsx → C:\Users\Rahul\Documents\CRM\platinum-elite-crm\apps\frontend\hooks\use-deals.ts
- `HasPermission()` --calls--> `useAuth()`  [INFERRED]
  C:\Users\Rahul\Documents\CRM\platinum-elite-crm\apps\frontend\components\auth\has-permission.tsx → C:\Users\Rahul\Documents\CRM\platinum-elite-crm\apps\frontend\lib\auth-context.tsx
- `AddLeadDialog()` --calls--> `useCreateLead()`  [INFERRED]
  C:\Users\Rahul\Documents\CRM\platinum-elite-crm\apps\frontend\components\leads\add-lead-dialog.tsx → C:\Users\Rahul\Documents\CRM\platinum-elite-crm\apps\frontend\hooks\use-leads.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (4): ChatGateway, ChatService, JwtStrategy, UsersService

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (4): bootstrap(), PortalWebhooksService, bootstrap(), SeedService

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (7): AddLeadDialog(), BulkActionsDialog(), EditLeadDialog(), useCreateLead(), useLeads(), useUpdateLead(), useUsers()

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (6): handleSubmit(), AuthService, NotificationsForm(), handleSubmit(), handleTenantSelect(), ProfileForm()

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (1): LeadsService

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (1): LeadsController

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (5): useAuth(), HasPermission(), DashboardLayout(), useNotifications(), SocketProvider()

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (1): TeamsService

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (1): TeamsController

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (1): PropertiesController

### Community 10 - "Community 10"
Cohesion: 0.27
Nodes (1): PropertiesService

### Community 11 - "Community 11"
Cohesion: 0.36
Nodes (1): TasksService

### Community 12 - "Community 12"
Cohesion: 0.46
Nodes (1): AnalyticsService

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (1): DealsController

### Community 14 - "Community 14"
Cohesion: 0.36
Nodes (1): DealsService

### Community 15 - "Community 15"
Cohesion: 0.25
Nodes (1): RolesController

### Community 16 - "Community 16"
Cohesion: 0.32
Nodes (1): RolesService

### Community 17 - "Community 17"
Cohesion: 0.25
Nodes (1): TasksController

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (1): UsersController

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (2): handleNewMessage(), transformMessage()

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (1): AuthController

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (1): ChatController

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (2): CalendarPage(), useTasks()

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (2): DealsPage(), useDeals()

### Community 24 - "Community 24"
Cohesion: 0.38
Nodes (3): handleKeyDown(), nextImage(), prevImage()

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (1): AnalyticsController

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (1): PortalWebhooksController

### Community 30 - "Community 30"
Cohesion: 0.4
Nodes (1): TenantsController

### Community 31 - "Community 31"
Cohesion: 0.4
Nodes (1): TenantsService

### Community 33 - "Community 33"
Cohesion: 0.5
Nodes (2): handleKeyDown(), handleSend()

### Community 34 - "Community 34"
Cohesion: 0.5
Nodes (1): AppController

### Community 35 - "Community 35"
Cohesion: 0.5
Nodes (1): PermissionsGuard

### Community 36 - "Community 36"
Cohesion: 0.5
Nodes (1): RolesGuard

### Community 37 - "Community 37"
Cohesion: 0.5
Nodes (3): CreateConversationDto, GetMessagesQueryDto, SendMessageDto

### Community 38 - "Community 38"
Cohesion: 0.5
Nodes (3): CreateLeadDto, LeadLookupDto, UpdateLeadDto

### Community 39 - "Community 39"
Cohesion: 0.5
Nodes (1): SearchController

### Community 40 - "Community 40"
Cohesion: 0.5
Nodes (1): SearchService

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (1): AppService

### Community 46 - "Community 46"
Cohesion: 0.67
Nodes (2): CreateTeamDto, UpdateTeamDto

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (2): formatBudgetRange(), formatINR()

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (1): AppModule

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (1): AnalyticsModule

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (1): AuthModule

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (1): LoginDto

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (1): RegisterDto

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (1): JwtAuthGuard

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (1): ChatModule

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (1): Conversation

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (1): Message

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (1): DealsModule

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (1): CreateDealDto

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (1): UpdateDealDto

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (1): Deal

### Community 66 - "Community 66"
Cohesion: 1.0
Nodes (1): LeadsModule

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (1): UpdateLeadDto

### Community 68 - "Community 68"
Cohesion: 1.0
Nodes (1): LeadActivity

### Community 69 - "Community 69"
Cohesion: 1.0
Nodes (1): Lead

### Community 70 - "Community 70"
Cohesion: 1.0
Nodes (1): PortalWebhooksModule

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (1): PropertiesModule

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (1): CreatePropertyDto

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (1): UpdatePropertyDto

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (1): Property

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (1): RolesModule

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (1): CreateRoleDto

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (1): UpdateRoleDto

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (1): Role

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (1): SearchModule

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (1): SeedsModule

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (1): TasksModule

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (1): CreateTaskDto

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (1): UpdateTaskDto

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (1): Task

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (1): TeamsModule

### Community 86 - "Community 86"
Cohesion: 1.0
Nodes (1): Team

### Community 87 - "Community 87"
Cohesion: 1.0
Nodes (1): TenantsModule

### Community 88 - "Community 88"
Cohesion: 1.0
Nodes (1): Tenant

### Community 89 - "Community 89"
Cohesion: 1.0
Nodes (1): UsersModule

### Community 91 - "Community 91"
Cohesion: 1.0
Nodes (1): InviteUserDto

### Community 92 - "Community 92"
Cohesion: 1.0
Nodes (1): UpdateUserDto

### Community 93 - "Community 93"
Cohesion: 1.0
Nodes (1): User

## Knowledge Gaps
- **48 isolated node(s):** `AppModule`, `AnalyticsModule`, `AuthModule`, `LoginDto`, `RegisterDto` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 4`** (14 nodes): `leads.service.ts`, `LeadsService`, `.bulkAssign()`, `.checkDuplicate()`, `.constructor()`, `.create()`, `.findOne()`, `.getActivities()`, `.getMyLeads()`, `.getUpcomingFollowUps()`, `.logActivity()`, `.lookup()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (13 nodes): `leads.controller.ts`, `LeadsController`, `.bulkAssign()`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.getActivities()`, `.getMyLeads()`, `.getUpcomingFollowUps()`, `.lookup()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (11 nodes): `teams.service.ts`, `.findAll()`, `TeamsService`, `.constructor()`, `.findAll()`, `.findOne()`, `.getTeamLeadMembers()`, `.getTeamMembers()`, `.getUserTeam()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (11 nodes): `teams.controller.ts`, `TeamsController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.getTeamLeadMembers()`, `.getTeamMembers()`, `.getUserTeam()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (10 nodes): `properties.controller.ts`, `PropertiesController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.findRelated()`, `.remove()`, `.toggleFavorite()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (10 nodes): `properties.service.ts`, `PropertiesService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.findRelated()`, `.remove()`, `.toggleFavorite()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (9 nodes): `tasks.service.ts`, `TasksService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.getUserWithRole()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (8 nodes): `AnalyticsService`, `.applyHierarchyFilters()`, `.constructor()`, `.getDashboardStats()`, `.getLeadStats()`, `.getPropertyStats()`, `.getRoleLevel()`, `analytics.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (8 nodes): `deals.controller.ts`, `DealsController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (8 nodes): `deals.service.ts`, `DealsService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (8 nodes): `roles.controller.ts`, `RolesController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (8 nodes): `roles.service.ts`, `RolesService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (8 nodes): `tasks.controller.ts`, `TasksController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (8 nodes): `users.controller.ts`, `UsersController`, `.constructor()`, `.findAll()`, `.findOne()`, `.invite()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (8 nodes): `page.tsx`, `handleConnect()`, `handleConnectError()`, `handleConversationSelect()`, `handleNewMessage()`, `handleSendMessage()`, `transformConversation()`, `transformMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (7 nodes): `auth.controller.ts`, `AuthController`, `.constructor()`, `.getProfile()`, `.login()`, `.methodNotAllowed()`, `.register()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (7 nodes): `chat.controller.ts`, `ChatController`, `.constructor()`, `.createConversation()`, `.getConversations()`, `.getMessages()`, `.sendMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (7 nodes): `page.tsx`, `use-tasks.ts`, `CalendarPage()`, `useCreateTask()`, `useDeleteTask()`, `useTasks()`, `useUpdateTask()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (7 nodes): `page.tsx`, `use-deals.ts`, `DealsPage()`, `useCreateDeal()`, `useDeals()`, `useUpdateDeal()`, `useUpdateDealStage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (6 nodes): `AnalyticsController`, `.constructor()`, `.getDashboardStats()`, `.getLeadStats()`, `.getPropertyStats()`, `analytics.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (6 nodes): `portal-webhooks.controller.ts`, `PortalWebhooksController`, `.constructor()`, `.process99acres()`, `.processHousing()`, `.processMagicBricks()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (5 nodes): `tenants.controller.ts`, `TenantsController`, `.constructor()`, `.findAll()`, `.findOne()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (5 nodes): `tenants.service.ts`, `TenantsService`, `.constructor()`, `.findAll()`, `.findOne()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (5 nodes): `chat-window.tsx`, `getOtherParticipant()`, `handleKeyDown()`, `handleScroll()`, `handleSend()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (4 nodes): `AppController`, `.constructor()`, `.getHello()`, `app.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (4 nodes): `permissions.guard.ts`, `PermissionsGuard`, `.canActivate()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (4 nodes): `roles.guard.ts`, `RolesGuard`, `.canActivate()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (4 nodes): `search.controller.ts`, `SearchController`, `.constructor()`, `.globalSearch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (4 nodes): `search.service.ts`, `SearchService`, `.constructor()`, `.globalSearch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (3 nodes): `AppService`, `.getHello()`, `app.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (3 nodes): `create-team.dto.ts`, `CreateTeamDto`, `UpdateTeamDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (3 nodes): `leads-table.tsx`, `formatBudgetRange()`, `formatINR()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (2 nodes): `AppModule`, `app.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (2 nodes): `AnalyticsModule`, `analytics.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (2 nodes): `auth.module.ts`, `AuthModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (2 nodes): `login.dto.ts`, `LoginDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (2 nodes): `register.dto.ts`, `RegisterDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (2 nodes): `jwt-auth.guard.ts`, `JwtAuthGuard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (2 nodes): `chat.module.ts`, `ChatModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (2 nodes): `conversation.entity.ts`, `Conversation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (2 nodes): `message.entity.ts`, `Message`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (2 nodes): `deals.module.ts`, `DealsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (2 nodes): `create-deal.dto.ts`, `CreateDealDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (2 nodes): `update-deal.dto.ts`, `UpdateDealDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (2 nodes): `deal.entity.ts`, `Deal`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (2 nodes): `leads.module.ts`, `LeadsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (2 nodes): `update-lead.dto.ts`, `UpdateLeadDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (2 nodes): `lead-activity.entity.ts`, `LeadActivity`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (2 nodes): `lead.entity.ts`, `Lead`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (2 nodes): `portal-webhooks.module.ts`, `PortalWebhooksModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (2 nodes): `properties.module.ts`, `PropertiesModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (2 nodes): `create-property.dto.ts`, `CreatePropertyDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (2 nodes): `update-property.dto.ts`, `UpdatePropertyDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (2 nodes): `property.entity.ts`, `Property`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (2 nodes): `roles.module.ts`, `RolesModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (2 nodes): `create-role.dto.ts`, `CreateRoleDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (2 nodes): `update-role.dto.ts`, `UpdateRoleDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (2 nodes): `role.entity.ts`, `Role`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (2 nodes): `search.module.ts`, `SearchModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (2 nodes): `seeds.module.ts`, `SeedsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (2 nodes): `tasks.module.ts`, `TasksModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (2 nodes): `create-task.dto.ts`, `CreateTaskDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (2 nodes): `update-task.dto.ts`, `UpdateTaskDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (2 nodes): `task.entity.ts`, `Task`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (2 nodes): `teams.module.ts`, `TeamsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (2 nodes): `team.entity.ts`, `Team`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (2 nodes): `tenants.module.ts`, `TenantsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (2 nodes): `tenant.entity.ts`, `Tenant`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (2 nodes): `users.module.ts`, `UsersModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (2 nodes): `invite-user.dto.ts`, `InviteUserDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (2 nodes): `update-user.dto.ts`, `UpdateUserDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (2 nodes): `user.entity.ts`, `User`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TeamsService` connect `Community 7` to `Community 1`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `LeadsService` connect `Community 4` to `Community 7`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `AppModule`, `AnalyticsModule`, `AuthModule` to the rest of the system?**
  _48 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._