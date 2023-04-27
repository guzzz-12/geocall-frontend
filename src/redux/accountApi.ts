import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EmailFormSchemaType, PasswordFormSchemaType } from "../components/Account/Security";
import { User } from "./api";

export const accountApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      headers.set("authorization", token || "");
      return headers;
    }
  }),
  reducerPath: "accountApi",
  endpoints: (build) => {
    return {
      changeEmail: build.mutation<User, EmailFormSchemaType>({
        query: ({newEmail, password}) => ({
          url: "/account/change-email",
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
          url: "/account/change-password",
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
    }
  }
});

export const {
  useChangeEmailMutation,
  useChangePasswordMutation
} = accountApi;