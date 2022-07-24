import { IUser } from "../types";
import client from "./client";

export default {
  users: client.db('messenger').collection<IUser>('users'),
  tokens: client.db('messenger').collection('tokens'),
  rooms: client.db('messenger').collection('rooms'),
  messages: client.db('messenger').collection('messages'),
}
