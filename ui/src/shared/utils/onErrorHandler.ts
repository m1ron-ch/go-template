import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError => {
  return typeof error === 'object' && error != null && 'status' in error
}

const isErrorWithMessage = (error: unknown): error is { message: string } => {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}

export const onErrorHandler = (error: unknown) => {
  if (isErrorWithMessage(error)) {
    return error.message
  }

  if (isFetchBaseQueryError(error)) {
    if (typeof error.data === 'string') {
      return error.data
    }

    return 'error' in error ? error.error : JSON.stringify(error.data)
  }

  return 'Произошла ошибка при работе с сервером, попробуйте еще раз!'
}
