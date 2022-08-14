import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import entitiesSlice from './slices/entitiesSlice'
import messagesSlice from './slices/messagesSlice'
import roomsSlice from './slices/roomsSlice'
import uiSlice from './slices/uiSlice'
import usersSlice from './slices/usersSlice'

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    users: usersSlice.reducer,
    rooms: roomsSlice.reducer,
    messages: messagesSlice.reducer,
    entities: entitiesSlice.reducer,
    ui: uiSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store
