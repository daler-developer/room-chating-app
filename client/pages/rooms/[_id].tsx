import { Box } from "@mui/material"
import AuthProtected from "../../components/AuthProtected"
import Layout from "../../components/Layout"
import useQueryParam from "../../hooks/useQueryParam"

export default function Room() {
  const [roomId] = useQueryParam('_id')

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>

      {/* Sidebar */}
      <Box sx={{ flex: '0 0 300px', bgcolor: 'black' }}>

      </Box>
      {/* Sidebar */}

      {/* Main */}
      <Box sx={{ flex: '1 0 0', position: 'relative' }}>

        {/* Send message form */}
        <Box sx={{ position: 'absolute', bottom: 0, right: 0, left: 0 }}>
          Test
        </Box>
        {/* Send message form */}

      </Box>
      {/* Main */}
      
    </Box>
  )
}

Room.getLayout = (page: any) => {
  return (
    <AuthProtected>
      {page}
    </AuthProtected>
  )
}
