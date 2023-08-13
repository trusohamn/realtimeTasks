const isDev = process.env.NODE_ENV === "development";

export const apiService = isDev ? 'http://localhost:8000/api' : 'https://trusohamn-real-time-07344ac8fd63.herokuapp.com/api'
export const wsService = isDev ? 'ws://localhost:8000/socket' : 'wss://trusohamn-real-time-07344ac8fd63.herokuapp.com/socket'
