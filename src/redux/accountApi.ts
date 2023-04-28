import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DeleteAccountFormSchemaType, EmailFormSchemaType, PasswordFormSchemaType } from "../components/Account/Security";
import { ProfileFormSchemaType } from "../components/Account/ProfileForm";
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
      updateProfile: build.mutation<User, ProfileFormSchemaType>({
        query: ({firstName, lastName, username, facebook, instagram, twitter}) => {
          const ig = {name: "instagram", link: instagram || null};
          const fb = {name: "facebook", link: facebook || null};
          const tw = {name: "twitter", link: twitter || null};

          const socialLinks = [ig, fb, tw];

          return {
            url: "/update-profile",
            method: "POST",
            body: {
              firstName,
              lastName,
              username,
              socialLinks
            }
          }
        },
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
  useUpdateProfileMutation,
  useChangeEmailMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation
} = accountApi;