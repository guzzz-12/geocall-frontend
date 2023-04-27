import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DeleteAccountFormSchemaType, EmailFormSchemaType, PasswordFormSchemaType } from "../components/Account/Security";
import { User } from "./api";

export const accountApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/account",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      headers.set("authorization", token || "");
      return headers;
    }
  }),
  reducerPath: "accountApi",
  endpoints: (build) => {
    return {
      updateAvatar: build.mutation<User, {data: FormData}>({
        query: ({data}) => ({
          url: "/update-avatar",
          method: "POST",
          body: data
        }),
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        }
      }),
      changeEmail: build.mutation<User, EmailFormSchemaType>({
        query: ({newEmail, password}) => ({
          url: "/change-email",
          method: "POST",
          body: {newEmail, password},
          headers: {
            "Content-Type": "application/json"
          }
        }),
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        }
      }),
      changePassword: build.mutation<User, PasswordFormSchemaType>({
        query: ({password, newPassword}) => ({
          url: "/change-password",
          method: "POST",
          body: {password, newPassword},
          headers: {
            "Content-Type": "application/json"
          }
        }),
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        }
      }),
      deleteAccount: build.mutation<void, DeleteAccountFormSchemaType>({
        query: ({password}) => ({
          url: "/delete-account",
          method: "POST",
          body: {password},
          headers: {
            "Content-Type": "application/json"
          }
        }),
        transformErrorResponse: (response) => {
          const message = (response.data as {message: string}).message;
          throw Error(message);
        }
      })
    }
  }
});

export const {
  useUpdateAvatarMutation,
  useChangeEmailMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation
} = accountApi;