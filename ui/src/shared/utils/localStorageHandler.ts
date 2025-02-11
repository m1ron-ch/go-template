export class LocalStorage {
  static getInfo(title: string) {
    const value = localStorage.getItem(title)

    return value ? JSON.parse(value) : value
  }

  static setInfo<T>(title: string, info: T) {
    localStorage.setItem(title, JSON.stringify(info))
  }
}
