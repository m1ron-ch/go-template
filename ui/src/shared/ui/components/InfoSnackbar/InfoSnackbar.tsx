import { useEffect, useState } from 'react'

import { Alert, Snackbar } from '@mui/material'

type Props = {
  isVisible: boolean
  message: string
  severity: 'error' | 'success'
}

export const InfoSnackbar = ({ isVisible, message, severity }: Props) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setOpen(true)
    }
  }, [isVisible])

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Snackbar
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      autoHideDuration={5000}
      onClose={handleClose}
      open={open}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }} variant={'filled'}>
        {message}
      </Alert>
    </Snackbar>
  )
}
