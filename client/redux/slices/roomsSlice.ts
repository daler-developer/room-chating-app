import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AxiosError } from "axios"
import { normalize } from "normalizr"
import { IRoom, IRoomsFilterObj, IUser } from "../../models"
import roomsService from "../../services/roomsService"
import { RootState } from "../store"
import { authSelectors } from "./authSlice"
import { entitiesSelectors, RoomEntityType, roomsAdapter, roomSchema, UserEntityType } from "./entitiesSlice"

const fetchedFeedRooms = createAsyncThunk('rooms/fetchedFeedRooms', async (filterObj: IRoomsFilterObj, thunkAPI) => {
  try {
    const { data } = await roomsService.getRooms(filterObj)

    const normalized = normalize<any, { users?: UserEntityType[], rooms?: RoomEntityType[] }>(data.rooms, [roomSchema])

    return {
      ...normalized,
      totalPages: data.totalPages
    }
  } catch (e) {
    if (e instanceof AxiosError) {
      return thunkAPI.rejectWithValue(e.response!.data)
    } else {
      return thunkAPI.rejectWithValue({ message: 'error' })
    }
  }
})

const joinedRoom = createAsyncThunk('rooms/joinedRoom', async ({ roomId, password }: { roomId: string, password?: string }, thunkAPI) => {
  try {
    const { _id: userId } = authSelectors.selectCurrentUser(thunkAPI.getState() as RootState)!
    await roomsService.joinRoom({ roomId, password })
    
    return { roomId, userId }
  } catch (e) {
    return thunkAPI.rejectWithValue('test')
  }
})

const leftRoom = createAsyncThunk('rooms/leftRoom', async (roomId: string, thunkAPI) => {
  try {
    const { _id: userId } = authSelectors.selectCurrentUser(thunkAPI.getState() as RootState)!
    await roomsService.leaveRoom({ roomId })

    return { roomId, userId }
  } catch {
    return thunkAPI.rejectWithValue('test')
  }
})

const roomDeleted = createAsyncThunk('rooms/roomDeleted', async ({ roomId, password }: { roomId: string, password: string }, thunkAPI) => {
  try {
    const { data } = await roomsService.deleteRoom({ roomId, password })

    return { roomId }
  } catch (e) {
    return thunkAPI.rejectWithValue('test')
  }
})

interface IState {
  idOfRoomUserIsJoining: string | null
  idOfRoomUserIsDeleting: string | null
  feed: {
    list: Array<string>
    isFetching: boolean
    error: string | null
    totalPages: number
  }
}

const initialState: IState = {
  idOfRoomUserIsJoining: null,
  idOfRoomUserIsDeleting: null,
  feed: {
    list: [],
    isFetching: false,
    error: null,
    totalPages: 0
  }
}

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    changedIdOfRoomUserIsJoining(state, { payload }: PayloadAction<string>) {
      state.idOfRoomUserIsJoining = payload
    },
    changedIdOfRoomUserIsDeleting(state, { payload }: PayloadAction<string>) {
      state.idOfRoomUserIsDeleting = payload
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchedFeedRooms.pending, (state, { payload }) => {
        state.feed.isFetching = true
      })
      .addCase(fetchedFeedRooms.fulfilled, (state, { payload }) => {
        state.feed.list = payload!.result
        state.feed.isFetching = false
        state.feed.totalPages = payload.totalPages
      })
      .addCase(fetchedFeedRooms.rejected, (state, { payload }) => {
        state.feed.isFetching = false
        state.feed.error = (payload as { message: string }).message
      })
      .addCase(roomDeleted.fulfilled, (state, { payload }) => {
        state.feed.list = state.feed.list.filter((item) => item !== payload.roomId)
      })
  }
})

export const roomsActions = {
  ...roomsSlice.actions,
  fetchedFeedRooms,
  joinedRoom,
  leftRoom,
  roomDeleted
}

export const roomsSelectors = {
  selectIdOfRoomUserIsJoining(state: RootState) {
    return state.rooms.idOfRoomUserIsJoining
  },
  selectIdOfRoomUserIsDeleting(state: RootState) {
    return state.rooms.idOfRoomUserIsDeleting
  },
}

export const selectFeedRooms = (state: RootState) => {
  return {
    list: entitiesSelectors.selectRoomsByIds(state, state.rooms.feed.list),
    isFetching: state.rooms.feed.isFetching,
    error: state.rooms.feed.error,
    totalPages: state.rooms.feed.totalPages
  }
}

export default roomsSlice
