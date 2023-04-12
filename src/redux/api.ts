import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginFormSchemaType } from "../pages/LoginPage";
import { SignupFormSchemaType } from "../pages/SignupPage";
import { UserLocation } from "./features/mapSlice";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: Date
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include"
  }),
  reducerPath: "userApi",
  tagTypes: ["User", "SelectedUser", "SelectedUserAddress"],
  endpoints: (build) => {
    return {
      getCurrentUser: build.query<User, void>({
        query: () => "/users/me",
        providesTags: ["User"],
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        }
      }),
      loginUser: build.mutation<User, LoginFormSchemaType>({
        query: ({email, password}) => ({
          url: "/users/login",
          method: "POST",
          body: {email, password},
          headers: {
            "Content-Type": "application/json"
          }
        }),
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        },
        invalidatesTags: ["User"]
      }),
      signupUser: build.mutation<User, SignupFormSchemaType>({
        query: ({firstName, lastName, username, email, password}) => ({
          url: "/users/signup",
          method: "POST",
          body: {firstName, lastName, username, email, password},
          headers: {
            "Content-Type": "application/json"
          }
        }),
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        },
        invalidatesTags: ["User"]
      }),
      logoutUser: build.mutation<void, void>({
        query: () => ({
          url: "/users/logout",
          method: "POST",
          body: {}
        }),
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        },
        invalidatesTags: ["User"]
      }),
      getUser: build.query<{user: User, address: string}, {userId: string, location: UserLocation}>({
        query: ({userId, location: {lat, lon}}) => `/users/user/${userId}/${lat}/${lon}`,
        providesTags: ["SelectedUser"],
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        }
      })
    };
  }
});

export const {
  useGetCurrentUserQuery,
  useLoginUserMutation,
  useSignupUserMutation,
  useLogoutUserMutation,
  useGetUserQuery
} = api;