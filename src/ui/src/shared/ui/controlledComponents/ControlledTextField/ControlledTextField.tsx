import { FieldValues, UseControllerProps, useController } from 'react-hook-form'

import { TextField } from '@mui/material'
import { TextFieldProps } from '@mui/material/TextField/TextField'

type ControlledTextFieldProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<TextFieldProps, 'error'>

export const ControlledTextField = <T extends FieldValues>({
  control,
  name,
  ...restProps
}: ControlledTextFieldProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name })

  return (
    <TextField
      autoComplete={'off'}
      fullWidth
      size={'small'}
      {...restProps}
      {...field}
      error={!!error}
      helperText={error?.message}
    />
  )
}
