import { Box } from '@mui/material'
import { useEffect } from 'react'
import AuthProtected from '../../components/AuthProtected'
import Layout from '../../components/Layout'
import SendMessageForm, {
  IFormValues,
} from '../../components/room/SendMessageForm'
import useQueryParam from '../../hooks/useQueryParam'
import useTypedDispatch from '../../hooks/useTypedDispatch'
import { messagesActions } from '../../redux/slices/messagesSlice'

export default function Room() {
  const [roomId] = useQueryParam('_id')

  const dispatch = useTypedDispatch()

  useEffect(() => {
    dispatch(messagesActions.fetchedRoomMessages({ roomId, offset: 0 }))
  }, [])

  const handleSubmit = (data: IFormValues) => {
    dispatch(messagesActions.createdMessage({ roomId, ...data }))
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <Box sx={{ flex: '0 0 300px', bgcolor: 'black' }}></Box>
      {/* Sidebar */}

      {/* Main */}
      <Box sx={{ flex: '1 0 0', position: 'relative' }}>
        {/* Send message form */}
        <SendMessageForm onSubmit={handleSubmit} />
        {/* Send message form */}
      </Box>
      {/* Main */}
    </Box>
  )
}

Room.getLayout = (page: any) => {
  return <AuthProtected>{page}</AuthProtected>
}
