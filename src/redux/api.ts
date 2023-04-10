import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginFormSchemaType } from "../pages/LoginPage";
import { SignupFormSchemaType } from "../pages/SignupPage";

export interface User {
  _id: string;
  name: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: Date
};

interface AuthResponse {
  user: User;
  token: string;
};

export const api = createApi({
  baseQuery: fetchBaseQuery({baseUrl: "http://localhost:5000/api", credentials: "include"}),
  reducerPath: "userApi",
  tagTypes: ["User"],
  endpoints: (build) => {
    return {
      getUser: build.query<User, void>({
        query: () => "/users/me",
        providesTags: ["User"]
      }),
      loginUser: build.mutation<AuthResponse, LoginFormSchemaType>({
        query: ({email, password}) => ({
          url: "/auth/login",
          method: "POST",
          body: {email, password},
          headers: {
            "Content-Type": "application/json"
          }
        }),
        transformErrorResponse: (response) => {
          return (response.data as {message: string}).message
        },
        invalidatesTags: ["User"]
      }),
      signupUser: build.mutation<AuthResponse, SignupFormSchemaType>({
        query: ({firstName, lastName, username, email, password}) => ({
          url: "/auth/signup",
          method: "POST",
          body: {firstName, lastName, username, email, password},
          headers: {
            "Content-Type": "application/json"
          }
        }),
        transformErrorResponse: (response) => {
          return (response.data as {message: string}).message
        },
        invalidatesTags: ["User"]
      }),
    };
  }
});

export const {useGetUserQuery, useLoginUserMutation, useSignupUserMutation} = api;