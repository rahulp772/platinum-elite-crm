# Graph Report - platinum-elite-crm  (2026-04-26)

## Corpus Check
- 163 files · ~57,135 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 405 nodes · 284 edges · 55 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]

## God Nodes (most connected - your core abstractions)
1. `ChatGateway` - 9 edges
2. `PropertiesController` - 9 edges
3. `PropertiesService` - 9 edges
4. `ChatService` - 8 edges
5. `DealsController` - 7 edges
6. `DealsService` - 7 edges
7. `LeadsController` - 7 edges
8. `LeadsService` - 7 edges
9. `TasksController` - 7 edges
10. `TasksService` - 7 edges

## Surprising Connections (you probably didn't know these)
- `DashboardLayout()` --calls--> `useAuth()`  [INFERRED]
  apps\frontend\app\(dashboard)\layout.tsx → apps\frontend\lib\auth-context.tsx
- `DealsPage()` --calls--> `useDeals()`  [INFERRED]
  apps\frontend\app\(dashboard)\deals\page.tsx → apps\frontend\hooks\use-deals.ts
- `LeadsPage()` --calls--> `useLeads()`  [INFERRED]
  apps\frontend\app\(dashboard)\leads\page.tsx → apps\frontend\hooks\use-leads.ts
- `AddLeadDialog()` --calls--> `useCreateLead()`  [INFERRED]
  apps\frontend\components\leads\add-lead-dialog.tsx → apps\frontend\hooks\use-leads.ts
- `handleSubmit()` --calls--> `NotificationsForm()`  [INFERRED]
  apps\frontend\components\properties\add-property-dialog.tsx → apps\frontend\components\settings\notifications-form.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (5): ChatService, JwtStrategy, bootstrap(), bootstrap(), UsersService

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (5): handleSubmit(), AuthService, NotificationsForm(), handleSubmit(), ProfileForm()

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (1): PropertiesController

### Community 3 - "Community 3"
Cohesion: 0.27
Nodes (1): PropertiesService

### Community 4 - "Community 4"
Cohesion: 0.25
Nodes (1): ChatGateway

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (1): DealsController

### Community 6 - "Community 6"
Cohesion: 0.36
Nodes (1): DealsService

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (1): LeadsController

### Community 8 - "Community 8"
Cohesion: 0.36
Nodes (1): LeadsService

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (1): TasksController

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (1): ChatController

### Community 11 - "Community 11"
Cohesion: 0.38
Nodes (1): TasksService

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (1): UsersController

### Community 13 - "Community 13"
Cohesion: 0.38
Nodes (3): handleKeyDown(), nextImage(), prevImage()

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (2): DealsPage(), useDeals()

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (4): AddLeadDialog(), LeadsPage(), useCreateLead(), useLeads()

### Community 17 - "Community 17"
Cohesion: 0.33
Nodes (1): AnalyticsController

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (1): AnalyticsService

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (1): AuthController

### Community 23 - "Community 23"
Cohesion: 0.4
Nodes (2): useAuth(), DashboardLayout()

### Community 24 - "Community 24"
Cohesion: 0.5
Nodes (1): AppController

### Community 25 - "Community 25"
Cohesion: 0.5
Nodes (1): RolesGuard

### Community 26 - "Community 26"
Cohesion: 0.5
Nodes (1): SearchController

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (1): SearchService

### Community 31 - "Community 31"
Cohesion: 0.67
Nodes (2): handleKeyDown(), handleSend()

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (1): AppService

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (1): AppModule

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (1): AnalyticsModule

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (1): AuthModule

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (1): LoginDto

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (1): RegisterDto

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (1): JwtAuthGuard

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (1): ChatModule

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): Conversation

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): Message

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): DealsModule

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (1): CreateDealDto

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (1): UpdateDealDto

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (1): Deal

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (1): LeadsModule

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (1): CreateLeadDto

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (1): UpdateLeadDto

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (1): Lead

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (1): PropertiesModule

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (1): CreatePropertyDto

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (1): UpdatePropertyDto

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (1): Property

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (1): SearchModule

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (1): TasksModule

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (1): CreateTaskDto

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (1): UpdateTaskDto

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (1): Task

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (1): UsersModule

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (1): UpdateUserDto

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (1): User

## Knowledge Gaps
- **29 isolated node(s):** `AppModule`, `AnalyticsModule`, `AuthModule`, `LoginDto`, `RegisterDto` (+24 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 2`** (10 nodes): `properties.controller.ts`, `PropertiesController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.findRelated()`, `.remove()`, `.toggleFavorite()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (10 nodes): `properties.service.ts`, `PropertiesService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.findRelated()`, `.remove()`, `.toggleFavorite()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (8 nodes): `chat.gateway.ts`, `ChatGateway`, `.constructor()`, `.handleConnection()`, `.handleDisconnect()`, `.handleJoinConversation()`, `.handleLeaveConversation()`, `.sendMessageToUser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (8 nodes): `deals.controller.ts`, `DealsController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (8 nodes): `deals.service.ts`, `DealsService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (8 nodes): `leads.controller.ts`, `LeadsController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (8 nodes): `leads.service.ts`, `LeadsService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (8 nodes): `tasks.controller.ts`, `TasksController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (7 nodes): `chat.controller.ts`, `ChatController`, `.constructor()`, `.createConversation()`, `.getConversations()`, `.getMessages()`, `.sendMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (7 nodes): `tasks.service.ts`, `TasksService`, `.constructor()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (7 nodes): `users.controller.ts`, `UsersController`, `.constructor()`, `.findAll()`, `.findOne()`, `.remove()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (7 nodes): `page.tsx`, `use-deals.ts`, `DealsPage()`, `useCreateDeal()`, `useDeals()`, `useUpdateDeal()`, `useUpdateDealStage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (6 nodes): `AnalyticsController`, `.constructor()`, `.getDashboardStats()`, `.getLeadStats()`, `.getPropertyStats()`, `analytics.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (6 nodes): `AnalyticsService`, `.constructor()`, `.getDashboardStats()`, `.getLeadStats()`, `.getPropertyStats()`, `analytics.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (6 nodes): `AuthController`, `.constructor()`, `.getProfile()`, `.login()`, `.register()`, `auth.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (5 nodes): `AuthProvider()`, `useAuth()`, `layout.tsx`, `auth-context.tsx`, `DashboardLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (4 nodes): `AppController`, `.constructor()`, `.getHello()`, `app.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (4 nodes): `roles.guard.ts`, `RolesGuard`, `.canActivate()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (4 nodes): `search.controller.ts`, `SearchController`, `.constructor()`, `.globalSearch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (4 nodes): `search.service.ts`, `SearchService`, `.constructor()`, `.globalSearch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (4 nodes): `getOtherParticipant()`, `handleKeyDown()`, `handleSend()`, `chat-window.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (3 nodes): `AppService`, `.getHello()`, `app.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `AppModule`, `app.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `AnalyticsModule`, `analytics.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (2 nodes): `AuthModule`, `auth.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (2 nodes): `login.dto.ts`, `LoginDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (2 nodes): `register.dto.ts`, `RegisterDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (2 nodes): `jwt-auth.guard.ts`, `JwtAuthGuard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (2 nodes): `chat.module.ts`, `ChatModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (2 nodes): `conversation.entity.ts`, `Conversation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (2 nodes): `message.entity.ts`, `Message`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (2 nodes): `deals.module.ts`, `DealsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (2 nodes): `create-deal.dto.ts`, `CreateDealDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (2 nodes): `update-deal.dto.ts`, `UpdateDealDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (2 nodes): `deal.entity.ts`, `Deal`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (2 nodes): `leads.module.ts`, `LeadsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (2 nodes): `create-lead.dto.ts`, `CreateLeadDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (2 nodes): `update-lead.dto.ts`, `UpdateLeadDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (2 nodes): `lead.entity.ts`, `Lead`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (2 nodes): `properties.module.ts`, `PropertiesModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (2 nodes): `create-property.dto.ts`, `CreatePropertyDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (2 nodes): `update-property.dto.ts`, `UpdatePropertyDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (2 nodes): `property.entity.ts`, `Property`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (2 nodes): `search.module.ts`, `SearchModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (2 nodes): `tasks.module.ts`, `TasksModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (2 nodes): `create-task.dto.ts`, `CreateTaskDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (2 nodes): `update-task.dto.ts`, `UpdateTaskDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (2 nodes): `task.entity.ts`, `Task`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (2 nodes): `users.module.ts`, `UsersModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (2 nodes): `update-user.dto.ts`, `UpdateUserDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (2 nodes): `user.entity.ts`, `User`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ChatGateway` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `AppModule`, `AnalyticsModule`, `AuthModule` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._