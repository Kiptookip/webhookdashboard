"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  username: string
  role: string
  email: string
}

// Update the AuthContextType interface to include a method for adding passwords
interface AuthContextType {
  user: User | null
  users: User[]
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  addUser: (user: User, password: string) => void
  updateUser: (user: User) => void
  deleteUser: (userId: string) => void
  currentUser: User | null
}

// Update the passwordMap to be a state variable
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default users
const defaultUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    username: "admin",
    role: "admin",
    email: "admin@example.com",
  },
  {
    id: "2",
    name: "Test User",
    username: "user",
    role: "user",
    email: "user@example.com",
  },
]

// Simple password map (in a real app, you'd use hashed passwords)
const defaultPasswordMap: Record<string, string> = {
  admin: "password",
  user: "password",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(defaultUsers)
  const [passwordMap, setPasswordMap] = useState<Record<string, string>>(defaultPasswordMap)

  // Load users and passwords from localStorage on initial render
  useEffect(() => {
    const storedUsers = localStorage.getItem("users")
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers))
      } catch (error) {
        console.error("Failed to parse stored users", error)
      }
    }

    const storedPasswords = localStorage.getItem("passwords")
    if (storedPasswords) {
      try {
        setPasswordMap(JSON.parse(storedPasswords))
      } catch (error) {
        console.error("Failed to parse stored passwords", error)
      }
    }

    // Check for existing session
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user", error)
      }
    }
  }, [])

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users))
  }, [users])

  // Save passwords to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("passwords", JSON.stringify(passwordMap))
  }, [passwordMap])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const foundUser = users.find((u) => u.username === username)
    if (foundUser && passwordMap[username] === password) {
      setUser(foundUser)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  const addUser = (newUser: User, password: string) => {
    setUsers((prev) => [...prev, newUser])
    setPasswordMap((prev) => ({ ...prev, [newUser.username]: password }))
  }

  const updateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))

    // If the updated user is the current user, update the current user state
    if (user && user.id === updatedUser.id) {
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
  }

  const deleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId)
    if (userToDelete) {
      // Remove the user's password from passwordMap
      setPasswordMap((prev) => {
        const newMap = { ...prev }
        delete newMap[userToDelete.username]
        return newMap
      })
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        currentUser: user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
