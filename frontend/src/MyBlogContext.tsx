import React from "react"
import { User } from "./dto/User"
import { Admin } from "./dto/Admin"

export interface MyBlogContextProps {
    user:User|null
    setUser: (user:User|null) => void
    // username: string|null
    // setUsername: (username:string|null) => void

    admin:Admin|null
    setAdmin: (admin:Admin|null) => void

}

export const MyBlogContext = React.createContext<MyBlogContextProps>({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    setUser: (user) => {
      localStorage.setItem('user', JSON.stringify(user));
      // Mettez à jour l'état de l'utilisateur ici
    },
    admin: JSON.parse(localStorage.getItem('admin') || 'null'),
    setAdmin: (admin) => {
      localStorage.setItem('admin', JSON.stringify(admin));
      // Mettez à jour l'état de l'admin ici
    },
  });