import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "./Spinner";
import { useGetCurrentUserQuery } from "../redux/api";
import { setCurrentUser } from "../redux/features/userSlice";
import { UserRootState } from "../redux/store";

const RefetchCurrentUser = () => {
  const dispatch = useDispatch();
  const {isLoading: isLoadingUser} = useSelector((state: UserRootState) => state.user);

  const {data} = useGetCurrentUserQuery();

  useEffect(() => {
    if (data) {
      const currentToken = localStorage.getItem("token");
      dispatch(setCurrentUser({...data, token: currentToken!}));
    }
  }, [data]);

  if(isLoadingUser) {
    return (
      <Spinner size="large"/>
    )
  };

  return null;
};

export default RefetchCurrentUser;