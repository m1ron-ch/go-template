export const getDate = (timeStamp: string): string => {
  const date = new Date(timeStamp)
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }

  return date.toLocaleString('ru-RU', options)
}
