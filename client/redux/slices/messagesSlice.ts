import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { normalize, NormalizedSchema } from "normalizr";
import messagesService, { ICreateMessageData } from "../../services/messagesService";
import { ErrorResponseType, IMessage } from "../../types";
import { MessageEntityType, messageSchema, UserEntityType } from "./entitiesSlice";

interface IState {
  room: {
    list: IMessage[]
    isFetching: boolean
    error: string | null
  }
}

const fetchedRoomMessages = createAsyncThunk<
  NormalizedSchema<{ messages?: MessageEntityType[], users?: UserEntityType[] }, string[]>,
  { offset: number, roomId: string },
  { rejectValue: ErrorResponseType }
>('messages/fetchedRoomMessages', async ({ offset, roomId }, thunkAPI) => {
  try {
    const { data } = await messagesService.fetchRoomMessages({ roomId, offset })

    const normalized = normalize(data.rooms, messageSchema)

    console.log(normalized)

    return {...normalized}
  } catch (e) {
    return thunkAPI.rejectWithValue(
      (e as ErrorResponseType)
    )
  }
})

const createdMessage = createAsyncThunk<
  any,
  ICreateMessageData,
  { rejectValue: ErrorResponseType}
>('messages/createdMessage', async (arg, thunkAPI) => {
  try {
    const { data } = await messagesService.createMessage(arg)

    return { 
      ...data
    }
  } catch (e) {
    return thunkAPI.rejectWithValue(
      (e as ErrorResponseType)
    )
  }
})

const initialState: IState = {
  room: {
    list: [],
    isFetching: false,
    error: null
  }
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {

  }
})

export const messagesActions = {
  ...messagesSlice.actions,
  createdMessage,
  fetchedRoomMessages
}

export default messagesSlice
