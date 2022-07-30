import { createEntityAdapter, createSlice } from "@reduxjs/toolkit"
import { schema, normalize, denormalize } from 'normalizr'
import { IRoom, IUser } from "../../types"
import { RootState } from "../store"
import { authActions } from "./authSlice"
import { roomsActions } from "./roomsSlice"
import { usersActions } from "./usersSlice"

export type RoomEntityType = Omit<IRoom, 'creator' | 'participants'> & {
  creator: string
  participants: string[]
}

export type UserEntityType = IUser

export const roomsAdapter = createEntityAdapter<RoomEntityType>({
  selectId: (room) => room._id
})

const usersAdapter = createEntityAdapter<UserEntityType>({
  selectId: (user) => user._id
})

export const userSchema = new schema.Entity('users', {

}, { idAttribute: '_id' })

export const roomSchema = new schema.Entity('rooms', {
  creator: userSchema,
  participants: [userSchema]
}, { idAttribute: '_id' })

const entitiesSlice = createSlice({
  name: 'entities',
  initialState: {
    rooms: roomsAdapter.getInitialState(),
    users: usersAdapter.getInitialState(),
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(roomsActions.fetchedFeedRooms.fulfilled, (state, { payload }) => {
        if (payload.entities.rooms) {
          roomsAdapter.upsertMany(state.rooms, payload.entities.rooms)
        }
        if (payload.entities.users) {
          usersAdapter.upsertMany(state.users, payload.entities.users)
        }
      })
      .addCase(roomsActions.fetchedRoomsUserCreated.fulfilled, (state, { payload }) => {
        if (payload.entities.rooms) {
          roomsAdapter.upsertMany(state.rooms, payload.entities.rooms)
        }
        if (payload.entities.users) {
          usersAdapter.upsertMany(state.users, payload.entities.users)
        }
      })
      .addCase(roomsActions.fetchedRoomsUserJoined.fulfilled, (state, { payload }) => {
        if (payload.entities.rooms) {
          roomsAdapter.upsertMany(state.rooms, payload.entities.rooms)
        }
        if (payload.entities.users) {
          usersAdapter.upsertMany(state.users, payload.entities.users)
        }
      })
      .addCase(authActions.fetchedMe.fulfilled, (state, { payload }) => {
        usersAdapter.upsertOne(state.users, payload.user)
      })
      .addCase(authActions.login.fulfilled, (state, { payload }) => {
        usersAdapter.upsertOne(state.users, payload.user)
      })
      .addCase(authActions.register.fulfilled, (state, { payload }) => {
        usersAdapter.upsertOne(state.users, payload.user)
      })
      .addCase(usersActions.fetchedFeedUsers.fulfilled, (state, { payload }) => {
        if (payload!.entities.users) {
          usersAdapter.upsertMany(state.users, payload!.entities.users)
        }
      })
      .addCase(usersActions.fetchedUser.fulfilled, (state, { payload }) => {
        usersAdapter.upsertOne(state.users, payload.user)
      })
      .addCase(roomsActions.joinedRoom.fulfilled, (state, { payload }) => {
        const oldRoom = state.rooms.entities[payload.roomId]!
        
        roomsAdapter.updateOne(state.rooms, { id: payload.roomId, changes: {
          participants: [...oldRoom.participants, payload.userId],
          isCurrentUserJoined: true,
          totalNumParticipants: oldRoom.totalNumParticipants + 1
        }})
      })
      .addCase(roomsActions.leftRoom.fulfilled, (state, { payload }) => {
        const oldRoom = state.rooms.entities[payload.roomId]!
        
        roomsAdapter.updateOne(state.rooms, { id: payload.roomId, changes: {
          participants: oldRoom.participants.filter((_id) => _id  !== payload.userId),
          isCurrentUserJoined: false,
          totalNumParticipants: oldRoom.totalNumParticipants - 1
        }})
      })
      .addCase(roomsActions.roomDeleted.fulfilled, (state, { payload }) => {
        roomsAdapter.removeOne(state.rooms, payload.roomId)
      })
      .addCase(usersActions.userLoggedIn, (state, { payload }) => {
        usersAdapter.updateOne(state.users, { id: payload.userId, changes: { isOnline: true } })
      })
      .addCase(usersActions.userLoggedOut, (state, { payload }) => {
        usersAdapter.updateOne(state.users, { id: payload.userId, changes: { isOnline: false } })
      })
  }
})

const roomsEntitiesSelectors = roomsAdapter.getSelectors<RootState>(
  (state) => state.entities.rooms
)

const usersEntitiesSelectors = usersAdapter.getSelectors<RootState>(
  (state) => state.entities.users
)

export const entitiesSelectors = {
  selectAllEntities(state: RootState) {
    return {
      rooms: state.entities.rooms.entities,
      users: state.entities.users.entities
    }
  },
  selectRooms(state: RootState): IRoom[] {
    const denormalized = denormalize({ rooms: state.entities.rooms.ids }, { rooms: [roomSchema] }, this.selectAllEntities(state))

    return denormalized.rooms
  },
  selectUsers(state: RootState): IUser[] {
    const denormalized = denormalize({ users: state.entities.users.ids }, { users: [userSchema] }, this.selectAllEntities(state))

    return denormalized.users
  },
  selectRoomsByIds(state: RootState, ids: string[]): IRoom[] {
    return this.selectRooms(state).filter((room) => ids.includes(room._id))
  },
  selectUserById(state: RootState, id: string): IUser | undefined {
    return usersEntitiesSelectors
      .selectById(state, id)
  },
  selectUsersByIds(state: RootState, ids: string[]): IUser[] {
    return this.selectUsers(state).filter((user) => ids.includes(user._id))
  }
}

export const entitiesActions = {
  ...entitiesSlice.actions,
}

export default entitiesSlice
