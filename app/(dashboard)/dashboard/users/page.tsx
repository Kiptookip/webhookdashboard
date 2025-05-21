"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Users, UserPlus, Trash2, Edit, Save, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"

interface User {
  id: string
  name: string
  username: string
  role: string
  email: string
}

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser, currentUser } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newUser, setNewUser] = useState<Omit<User, "id"> & { password: string }>({
    name: "",
    username: "",
    role: "user",
    email: "",
    password: "",
  })
  const [editUser, setEditUser] = useState<User | null>(null)
  const { toast } = useToast()

  const handleAddUser = () => {
    if (!newUser.name || !newUser.username || !newUser.email || !newUser.password) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const userToAdd = {
      id: Date.now().toString(),
      name: newUser.name,
      username: newUser.username,
      role: newUser.role,
      email: newUser.email,
    }

    addUser(userToAdd, newUser.password)

    toast({
      title: "User Added",
      description: `${newUser.name} has been added successfully`,
    })

    setNewUser({
      name: "",
      username: "",
      role: "user",
      email: "",
      password: "",
    })
    setIsAdding(false)
  }

  const handleEditUser = (user: User) => {
    setEditingId(user.id)
    setEditUser({ ...user })
  }

  const handleSaveEdit = () => {
    if (!editUser) return

    updateUser(editUser)

    toast({
      title: "User Updated",
      description: `${editUser.name}'s information has been updated`,
    })

    setEditingId(null)
    setEditUser(null)
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account",
        variant: "destructive",
      })
      return
    }

    const user = users.find((u) => u.id === userId)

    if (window.confirm(`Are you sure you want to delete ${user?.name}?`)) {
      deleteUser(userId)

      toast({
        title: "User Deleted",
        description: `${user?.name} has been deleted`,
      })
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ocean-800 mb-2">User Management</h1>
        <p className="text-ocean-600">Manage users and their permissions.</p>
      </div>

      <Card className="ocean-card bg-white/80 backdrop-blur-sm mb-6">
        <CardHeader className="bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-t-lg border-b border-ocean-200">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center text-ocean-700">
                <Users className="h-5 w-5 mr-2 text-ocean-500" />
                Users
              </CardTitle>
              <CardDescription className="text-ocean-500">Manage user accounts and permissions</CardDescription>
            </div>
            <Button onClick={() => setIsAdding(!isAdding)} className="bg-ocean-500 hover:bg-ocean-600 text-white">
              {isAdding ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isAdding && (
            <div className="p-4 bg-ocean-50 border-b border-ocean-200">
              <h3 className="text-lg font-medium text-ocean-700 mb-4">Add New User</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name" className="text-ocean-700">
                    Full Name
                  </Label>
                  <Input
                    id="new-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-username" className="text-ocean-700">
                    Username
                  </Label>
                  <Input
                    id="new-username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email" className="text-ocean-700">
                    Email
                  </Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-ocean-700">
                    Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-role" className="text-ocean-700">
                    Role
                  </Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger
                      id="new-role"
                      className="border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300"
                    >
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleAddUser} className="bg-ocean-500 hover:bg-ocean-600 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow className="bg-ocean-50">
                <TableHead className="text-ocean-700">Name</TableHead>
                <TableHead className="text-ocean-700">Username</TableHead>
                <TableHead className="text-ocean-700">Email</TableHead>
                <TableHead className="text-ocean-700">Role</TableHead>
                <TableHead className="text-ocean-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-ocean-50/50">
                  {editingId === user.id && editUser ? (
                    <>
                      <TableCell>
                        <Input
                          value={editUser.name}
                          onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                          className="border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editUser.username}
                          onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                          className="border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editUser.email}
                          onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                          className="border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={editUser.role}
                          onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                        >
                          <SelectTrigger className="border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-ocean-200 hover:bg-ocean-100 text-ocean-700"
                            onClick={handleSaveEdit}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-ocean-200 hover:bg-ocean-100 text-ocean-700"
                            onClick={() => {
                              setEditingId(null)
                              setEditUser(null)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium text-ocean-700">{user.name}</TableCell>
                      <TableCell className="text-ocean-600">{user.username}</TableCell>
                      <TableCell className="text-ocean-600">{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin" ? "bg-ocean-100 text-ocean-700" : "bg-ocean-50 text-ocean-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-ocean-200 hover:bg-ocean-100 text-ocean-700"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-ocean-200 hover:bg-red-100 text-red-600"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="text-ocean-700">User Roles</CardTitle>
          <CardDescription className="text-ocean-500">Understanding user permissions in the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-ocean-50 p-4 rounded-lg">
            <h3 className="font-medium text-ocean-700 mb-2">Admin</h3>
            <p className="text-sm text-ocean-600">
              Administrators have full access to all features, including user management, settings, and data processing.
            </p>
          </div>

          <div className="bg-ocean-50 p-4 rounded-lg">
            <h3 className="font-medium text-ocean-700 mb-2">User</h3>
            <p className="text-sm text-ocean-600">
              Regular users can upload and process CSV data, view responses, but cannot manage other users or change
              system settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
