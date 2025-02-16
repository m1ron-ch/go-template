import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = () =>
  z.object({
    login: z.string().trim().min(1, 'Имя пользователя не может быть пустым!'),
    password: z
      .string()
      .trim()
      .min(6, 'Минимальная длинна пароля 6 символов!')
      .max(20, 'Максимальная длинна пароля 20 символов!'),
  })

export type LoginFormValuesType = z.infer<ReturnType<typeof loginSchema>>

export const useLogin = () =>
  useForm<LoginFormValuesType>({
    defaultValues: {
      login: '',
      password: '',
    },
    mode: 'onSubmit',
    resolver: zodResolver(loginSchema()),
  })
