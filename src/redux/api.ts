import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginFormSchemaType } from "../pages/LoginPage";
import { SignupFormSchemaType } from "../pages/SignupPage";
import { UserLocation } from "./features/mapSlice";
import { ChatMember } from "./features/chatsSlice";
import { DeleteChatsFormSchemaType } from "../components/Account/Security";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  emailVerified: boolean;
  avatar: string;
  avatarPublicId: string;
  socialLinks: [{
    _id: string;
    name: "instagram" | "facebook" | "twitter";
    link: string;
  }];
  token: string;
  createdAt: Date
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      headers.set("authorization", token || "");
      return headers;
    }
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
      getUser: build.query<User, {userId: string}>({
        query: ({userId}) => `/users/user/${userId}`,
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        }
      }),
      getUsers: build.mutation<{users: ChatMember[]}, {ids: string[]}>({
        query: ({ids}) => ({
          method: "POST",
          url: "/users/get-users",
          body: {users: ids}
        })
      }),
      getUserWithLocation: build.query<{user: User, address: string}, {userId: string, location: UserLocation}>({
        query: ({userId, location: {lat, lon}}) => `/users/user/${userId}/${lat}/${lon}`,
        providesTags: ["SelectedUser"],
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        }
      }),
      forgotPassword: build.mutation<void, {email: string}>({
        query: ({email}) => ({
          method: "POST",
          url: "/account/forgot-password",
          body: {email}
        }),
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        }
      }),
      resetPassword: build.mutation<void, {newPassword: string, token: string}>({
        query: ({newPassword, token}) => ({
          method: "POST",
          url: "/account/reset-password",
          body: {newPassword, token}
        }),
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        }
      }),
      getVerificationCode: build.query<void, void>({
        query: () => "/account/get-verification-code",
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        }
      }),
      verifyAccount: build.mutation<User, {code: string}>({
        query: ({code}) => ({
          method: "POST",
          url: "/account/verify-email",
          body: {code}
        }),
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        }
      }),
      checkPassword: build.mutation<void, DeleteChatsFormSchemaType>({
        query: ({password}) => ({
          url: "/users/check-password",
          method: "POST",
          body: {password}
        }),
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
  useGetUserQuery,
  useGetUsersMutation,
  useGetUserWithLocationQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetVerificationCodeQuery,
  useVerifyAccountMutation,
  useCheckPasswordMutation
} = api;