import { Box, Container } from "@mui/material"
import Alert from "./Alert"
import DeleteRoomModal from "./DeleteRoomModal"
import Header from "./Header"
import JoinRoomModal from "./JoinRoomModal"
import UpdateProfileModal from "./UpdateProfileModal"

export default ({ children }: { children: any }) => {
  return (
    <Box sx={{ p: '80px 0', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="md">
        {children}
      </Container>
      <JoinRoomModal />
      <DeleteRoomModal />
      <UpdateProfileModal />
    </Box>
  )
}