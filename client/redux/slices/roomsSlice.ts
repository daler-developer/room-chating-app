import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { normalize, NormalizedSchema } from 'normalizr'
import { IFilterObj as IRoomsFilterObj } from '../../pages/rooms'
import roomsService from '../../services/roomsService'
import { ErrorResponseType, IRoom, IUser } from '../../types'
import { RootState } from '../store'
import { authSelectors } from './authSlice'
import {
  entitiesSelectors,
  RoomEntityType,
  roomSchema,
  UserEntityType,
} from './entitiesSlice'

const createdRoom = createAsyncThunk<
  NormalizedSchema<{ room?: RoomEntityType }, string>, 
  { name: string, password?: string }, 
  { rejectValue: ErrorResponseType }
>('rooms/createdRoom', async ({ name, password }, thunkAPI) => {
  try {
    const { data } = await roomsService.createRoom({ name, password })

    const normalized = normalize(data.room, roomSchema)
    
    return { ...normalized }
  } catch (e) {
    return thunkAPI.rejectWithValue(
      (e as ErrorResponseType)
    )
  }
})

const fetchedFeedRooms = createAsyncThunk<
  NormalizedSchema<{ rooms?: RoomEntityType[] }, string[]> & { totalPages: number },
  IRoomsFilterObj, 
  { rejectValue: ErrorResponseType }
>(
  'rooms/fetchedFeedRooms',
  async (filterObj, thunkAPI) => {
    try {
      const { data } = await roomsService.getRooms(filterObj)

      const normalized = normalize<
        any,
        { users?: UserEntityType[]; rooms?: RoomEntityType[] }
      >(data.rooms, [roomSchema])

      return {
        ...normalized,
        totalPages: data.totalPages,
      }
    } catch (e) {
      return thunkAPI.rejectWithValue(e as ErrorResponseType)
    }
  }
)

const fetchedRoomsUserCreated = createAsyncThunk<
  NormalizedSchema<{ users?: UserEntityType[], rooms?: RoomEntityType[] }, string[]>,
  { userId: string },
  { rejectValue: ErrorResponseType }
>('rooms/fetchedRoomsUserCreated', async ({ userId }, thunkAPI) => {
  try {
    const { data } = await roomsService.getRoomsUserCreated({ userId })

    const normalized = normalize(data.rooms, [roomSchema])

    return { ...normalized }
  } catch (e) {
    return thunkAPI.rejectWithValue(e as ErrorResponseType)
  }
})

const fetchedRoomsUserJoined = createAsyncThunk<
  NormalizedSchema<{ users?: UserEntityType[], rooms?: RoomEntityType[] }, string[]>,
  { userId: string },
  { rejectValue: ErrorResponseType }
>('rooms/fetchedRoomsUserJoined', async ({ userId }, thunkAPI) => {
  try {
    const { data } = await roomsService.getRoomsUserJoined({ userId })

    const normalized = normalize<
      any,
      { users?: UserEntityType[]; rooms?: RoomEntityType[] }
    >(data.rooms, [roomSchema])

    return { ...normalized }
  } catch (e) {
    return thunkAPI.rejectWithValue(e as ErrorResponseType)

  }
})

const joinedRoom = createAsyncThunk(
  'rooms/joinedRoom',
  async (
    { roomId, password }: { roomId: string; password?: string },
    thunkAPI
  ) => {
    try {
      const { _id: userId } = authSelectors.selectCurrentUser(
        thunkAPI.getState() as RootState
      )!
      await roomsService.joinRoom({ roomId, password })

      return { roomId, userId }
    } catch (e) {
      return thunkAPI.rejectWithValue(e as ErrorResponseType)
    }
  }
)

const leftRoom = createAsyncThunk(
  'rooms/leftRoom',
  async (roomId: string, thunkAPI) => {
    try {
      const { _id: userId } = authSelectors.selectCurrentUser(
        thunkAPI.getState() as RootState
      )!
      await roomsService.leaveRoom({ roomId })

      return { roomId, userId }
    } catch (e) {
      return thunkAPI.rejectWithValue(e as ErrorResponseType)
    }
  }
)

const roomDeleted = createAsyncThunk(
  'rooms/roomDeleted',
  async (
    { roomId, password }: { roomId: string; password: string },
    thunkAPI
  ) => {
    try {
      await roomsService.deleteRoom({ roomId, password })

      return { roomId }
    } catch (e) {
      return thunkAPI.rejectWithValue(e as ErrorResponseType)
    }
  }
)

interface IState {
  idOfRoomUserIsJoining: string | null
  idOfRoomUserIsDeleting: string | null
  feed: {
    list: Array<string>
    isFetching: boolean
    error: string | null
    totalPages: number
  }
  profile: {
    created: {
      list: Array<string>
      isFetching: boolean
      error: string | null
    }
    joined: {
      list: Array<string>
      isFetching: boolean
      error: string | null
    }
  }
}

const initialState: IState = {
  idOfRoomUserIsJoining: null,
  idOfRoomUserIsDeleting: null,
  feed: {
    list: [],
    isFetching: false,
    error: null,
    totalPages: 0,
  },
  profile: {
    created: {
      list: [],
      error: null,
      isFetching: false,
    },
    joined: {
      list: [],
      error: null,
      isFetching: false,
    },
  },
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
        state.feed.list = payload.result
        state.feed.isFetching = false
        state.feed.totalPages = payload.totalPages
      })
      .addCase(fetchedFeedRooms.rejected, (state, { payload }) => {
        state.feed.isFetching = false
        state.feed.error = payload!.response!.data.message
      })
      .addCase(fetchedRoomsUserCreated.pending, (state, { payload }) => {
        state.profile.created.error = null
        state.profile.created.isFetching = true
      })
      .addCase(fetchedRoomsUserCreated.fulfilled, (state, { payload }) => {
        state.profile.created.list = payload.result
        state.profile.created.isFetching = false
      })
      .addCase(fetchedRoomsUserCreated.rejected, (state, { payload }) => {
        state.profile.created.isFetching = false
        state.profile.created.error = payload!.message
      })
      .addCase(fetchedRoomsUserJoined.pending, (state, { payload }) => {
        state.profile.joined.error = null
        state.profile.joined.isFetching = true
      })
      .addCase(fetchedRoomsUserJoined.fulfilled, (state, { payload }) => {
        state.profile.joined.list = payload.result
        state.profile.joined.isFetching = false
      })
      .addCase(fetchedRoomsUserJoined.rejected, (state, { payload }) => {
        state.profile.joined.isFetching = false
        state.profile.joined.error = payload!.message
      })
      .addCase(roomDeleted.fulfilled, (state, { payload }) => {
        state.feed.list = state.feed.list.filter(
          (item) => item !== payload.roomId
        )
      })
  },
})

export const roomsActions = {
  ...roomsSlice.actions,
  fetchedFeedRooms,
  joinedRoom,
  leftRoom,
  roomDeleted,
  fetchedRoomsUserCreated,
  fetchedRoomsUserJoined,
  createdRoom,
}

export const roomsSelectors = {
  selectIdOfRoomUserIsJoining(state: RootState) {
    return state.rooms.idOfRoomUserIsJoining
  },
  selectIdOfRoomUserIsDeleting(state: RootState) {
    return state.rooms.idOfRoomUserIsDeleting
  },
  selectFeedRooms(state: RootState) {
    return {
      list: entitiesSelectors.selectRoomsByIds(state, state.rooms.feed.list),
      isFetching: state.rooms.feed.isFetching,
      error: state.rooms.feed.error,
      totalPages: state.rooms.feed.totalPages,
    }
  },
  selectRoomsUserCreated(state: RootState) {
    return {
      list: entitiesSelectors.selectRoomsByIds(
        state,
        state.rooms.profile.created.list
      ),
      isFetching: state.rooms.profile.created.isFetching,
      error: state.rooms.profile.created.error,
    }
  },
  selectRoomsUserJoined(state: RootState) {
    return {
      list: entitiesSelectors.selectRoomsByIds(
        state,
        state.rooms.profile.joined.list
      ),
      isFetching: state.rooms.profile.joined.isFetching,
      error: state.rooms.profile.joined.error,
    }
  },
}

export default roomsSlice
