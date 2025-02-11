import { FieldValues, UseControllerProps, useController } from 'react-hook-form'

import { FormControl, FormHelperText, InputLabel, Select, SelectProps } from '@mui/material'

type ControlledSelectProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<SelectProps, 'error'>

export const ControlledSelect = <T extends FieldValues>({
  children,
  control,
  name,
  ...restProps
}: ControlledSelectProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name })

  return (
    <FormControl fullWidth>
      <InputLabel id={'demo-simple-select-label'}>{restProps.label}</InputLabel>
      <Select size={'small'} {...restProps} {...field} error={!!error}>
        {children}
      </Select>
      <FormHelperText>{error?.message}</FormHelperText>
    </FormControl>
  )
}
