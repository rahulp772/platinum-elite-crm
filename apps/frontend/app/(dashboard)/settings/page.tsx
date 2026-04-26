"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/settings/profile-form"
import { NotificationsForm } from "@/components/settings/notifications-form"
import { AppearanceForm } from "@/components/settings/appearance-form"
import { AddMemberDialog } from "@/components/settings/add-member-dialog"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, Shield, Plus, MoreHorizontal, Loader2, Trash2, UserCog } from "lucide-react"
import { formatDateOnly, getUserTimezone } from "@/lib/date-utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const PERMISSIONS = [
  { id: "leads:read", label: "View Leads" },
  { id: "leads:write", label: "Create/Edit Leads" },
  { id: "deals:read", label: "View Deals" },
  { id: "deals:write", label: "Create/Edit Deals" },
  { id: "properties:read", label: "View Properties" },
  { id: "properties:write", label: "Create/Edit Properties" },
  { id: "tasks:read", label: "View Tasks" },
  { id: "tasks:write", label: "Create/Edit Tasks" },
  { id: "reports:read", label: "View Reports" },
  { id: "settings:write", label: "Manage Settings" },
  { id: "users:read", label: "View Users" },
  { id: "users:write", label: "Manage Users" },
  { id: "roles:write", label: "Manage Roles" },
]

const ITEMS_PER_PAGE = 10

interface User {
  id: string
  email: string
  name: string
  roleId: string | null
  tenantId: string
  status: string
  createdAt: string
}

interface Role {
  id: string
  name: string
  description: string | null
  permissions: string[]
  isSystem: boolean
  level: number
  createdAt: string
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()
  const timezone = getUserTimezone(currentUser)

  const [teamPage, setTeamPage] = React.useState(1)
  const [addMemberOpen, setAddMemberOpen] = React.useState(false)
  const [addRoleOpen, setAddRoleOpen] = React.useState(false)
  const [deleteRole, setDeleteRole] = React.useState<Role | null>(null)
  const [editUser, setEditUser] = React.useState<User | null>(null)
  const [deleteUser, setDeleteUser] = React.useState<User | null>(null)
  const [editUserRoleId, setEditUserRoleId] = React.useState("")

  const [roleName, setRoleName] = React.useState("")
  const [roleDescription, setRoleDescription] = React.useState("")
  const [roleLevel, setRoleLevel] = React.useState(10)
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([])
  const [isCreatingRole, setIsCreatingRole] = React.useState(false)
  const [createRoleError, setCreateRoleError] = React.useState<string | null>(null)

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["users", teamPage],
    queryFn: async () => {
      const res = await api.get("/users")
      return res.data as User[]
    },
  })

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles", currentUser?.tenantId],
    queryFn: async () => {
      const res = await api.get("/roles")
      const allRoles = res.data as any[]
      const uniqueByName = allRoles.filter((role, index, self) => 
        index === self.findIndex((r: any) => r.name === role.name)
      )
      if (!currentUser?.isSuperAdmin) {
        return uniqueByName.filter((r: any) => r.tenantId === currentUser?.tenantId)
      }
      if (currentUser?.tenantId) {
        return uniqueByName.filter((r: any) => r.tenantId === currentUser.tenantId || !r.tenantId)
      }
      return uniqueByName
    },
  })

  const paginatedUsers = React.useMemo(() => {
    if (!usersData) return []
    const start = (teamPage - 1) * ITEMS_PER_PAGE
    return usersData.slice(start, start + ITEMS_PER_PAGE)
  }, [usersData, teamPage])

  const totalTeamPages = Math.ceil((usersData?.length || 0) / ITEMS_PER_PAGE)

  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; permissions: string[]; level: number }) => {
      const res = await api.post("/roles", data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      setAddRoleOpen(false)
      setRoleName("")
      setRoleDescription("")
      setSelectedPermissions([])
    },
    onError: (error: Error) => {
      setCreateRoleError(error.message)
    },
  })

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/roles/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      setDeleteRole(null)
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: string; roleId?: string; status?: string }) => {
      const res = await api.patch(`/users/${data.id}`, { roleId: data.roleId, status: data.status })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setEditUser(null)
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setDeleteUser(null)
    },
  })

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingRole(true)
    setCreateRoleError(null)
    createRoleMutation.mutate({ name: roleName, description: roleDescription, permissions: selectedPermissions, level: roleLevel })
  }

  const resetRoleForm = () => {
    setRoleName("")
    setRoleDescription("")
    setRoleLevel(10)
    setSelectedPermissions([])
    setCreateRoleError(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-2 h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="mr-2 h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Team Members</h2>
              <p className="text-sm text-muted-foreground">Manage your team members</p>
            </div>
            <Button onClick={() => setAddMemberOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No team members yet. Add your first team member.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.status === 'suspended' 
                            ? 'bg-red-900/30 text-red-400' 
                            : 'bg-green-900/30 text-green-400'
                        }`}>
                          {user.status === 'suspended' ? 'Suspended' : 'Active'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatDateOnly(user.createdAt, timezone)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditUser(user)
                              setEditUserRoleId(user.roleId || "")
                            }}>
                              <UserCog className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const newStatus = user.status === 'suspended' ? 'active' : 'suspended'
                              updateUserMutation.mutate({ id: user.id, status: newStatus })
                            }}>
                              {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setDeleteUser(user)}
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalTeamPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {teamPage} of {totalTeamPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTeamPage((p) => Math.max(1, p - 1))}
                  disabled={teamPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTeamPage((p) => Math.min(totalTeamPages, p + 1))}
                  disabled={teamPage === totalTeamPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          <AddMemberDialog
            open={addMemberOpen}
            onOpenChange={setAddMemberOpen}
            onSuccess={() => refetchUsers()}
          />

          <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit User Role</DialogTitle>
                <DialogDescription>
                  Change the role for {editUser?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={editUserRoleId} onValueChange={setEditUserRoleId}>
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditUser(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => editUser && updateUserMutation.mutate({ 
                    id: editUser.id, 
                    roleId: editUserRoleId 
                  })}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {deleteUser?.name} from the team? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteUser && deleteUserMutation.mutate(deleteUser.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Roles</h2>
              <p className="text-sm text-muted-foreground">Manage roles and permissions</p>
            </div>
            <Button onClick={() => setAddRoleOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolesLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : roles?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No roles yet. Create your first role.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles?.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded">
                          {role.level}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((p: string) => (
                            <span
                              key={p}
                              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs"
                            >
                              {p}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            role.isSystem
                              ? "bg-amber-900/30 text-amber-400"
                              : "bg-green-900/30 text-green-400"
                          }`}
                        >
                          {role.isSystem ? "System" : "Custom"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {!role.isSystem && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteRole(role)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Dialog open={addRoleOpen} onOpenChange={(open) => {
            if (!open) resetRoleForm()
            setAddRoleOpen(open)
          }}>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleCreateRole}>
                <DialogHeader>
                  <DialogTitle>Create Role</DialogTitle>
                  <DialogDescription>
                    Create a new role and assign permissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {createRoleError && (
                    <div className="text-sm text-red-500">{createRoleError}</div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                      id="role-name"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g., Manager, Agent"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role-description">Description</Label>
                    <Input
                      id="role-description"
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role-level">Hierarchy Level (1-200)</Label>
                    <Input
                      id="role-level"
                      type="number"
                      value={roleLevel}
                      onChange={(e) => setRoleLevel(parseInt(e.target.value))}
                      placeholder="e.g., 10, 50, 100"
                      min={1}
                      max={200}
                      required
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Higher level roles can see data from lower level roles.
                      (Admin: 100, Manager: 80, Team Lead: 50, Agent: 10)
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2 rounded-md border p-4 max-h-[200px] overflow-y-auto">
                      {PERMISSIONS.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <Label
                            htmlFor={permission.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddRoleOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingRole || createRoleMutation.isPending}>
                    {(isCreatingRole || createRoleMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Role
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog open={!!deleteRole} onOpenChange={(open) => !open && setDeleteRole(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the role "{deleteRole?.name}"? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteRole && deleteRoleMutation.mutate(deleteRole.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationsForm />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <AppearanceForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}