import { LocalStorage } from './localStorageHandler'

export const useLocalStorage = () => {
  const isAuth = LocalStorage.getInfo('isAuth')

  return { isAuth }
}
