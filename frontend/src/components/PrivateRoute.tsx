import React, { useContext, useEffect, useState } from 'react';
import LoginPage from './LoginPage';
import { MyBlogContext } from '../MyBlogContext';
import AdminPage from './AdminPage'


interface PrivateRouteProps {
  children: any
}

export function PrivateRoute(props:PrivateRouteProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const context = useContext(MyBlogContext)

  useEffect(() => {
    setIsLoggedIn(context.user !== null)
  }, [context.user])

  const login  = (<LoginPage></LoginPage>);
  const Admin =  (<AdminPage></AdminPage>);


  if (context.user?.id_equipe === "Admin") {
    console.log("ok")
    return Admin;
  } else {

    if (props.children.type  === AdminPage) {
      return login
    }
    return isLoggedIn ? props.children : login
  }

}

export default PrivateRoute;
