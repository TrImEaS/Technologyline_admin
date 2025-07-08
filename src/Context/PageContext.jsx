import { createContext, useContext, useEffect, useState } from 'react';

export const PageContext = createContext();
export const usePage = () => useContext(PageContext);

export const PageProvider = ({ children }) => {
  const [user, setUserState] = useState(() => localStorage.getItem('user') || '')
  const [login, setLogin] = useState(!!localStorage.getItem('user'))

  const setUser = (username) => {
    if (username) {
      localStorage.setItem('user', username)
      setUserState(username)
      setLogin(true)
    } else {
      localStorage.removeItem('user')
      setUserState('')
      setLogin(false)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      setLogin(false)
      setUserState('')
    }
  }, [])

  return (
    <PageContext.Provider value={{ user, setUser, login, setLogin }}>
      {children}
    </PageContext.Provider>
  )
}
