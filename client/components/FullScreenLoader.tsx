import { Box, CircularProgress } from '@mui/material'

export default () => {
  return (
    <Box
      sx={{
        zIndex: '400',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
      }}
    >
      <CircularProgress />
    </Box>
  )
}
