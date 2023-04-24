import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "./Spinner";
import { useGetCurrentUserQuery } from "../redux/api";
import { setCurrentUser, setIsLoadingUser } from "../redux/features/userSlice";
import { UserRootState } from "../redux/store";

const RefetchCurrentUser = () => {
  const dispatch = useDispatch();
  const {isLoading: isLoadingUser} = useSelector((state: UserRootState) => state.user);
  const currentToken = localStorage.getItem("token");

  // No realizar la consulta si no hay token
  const {data, isLoading, isError} = useGetCurrentUserQuery(undefined, {
    skip: !currentToken || currentToken === "null"
  });

  useEffect(() => {
    if (data) {
      dispatch(setIsLoadingUser(false));
      dispatch(setCurrentUser({...data, token: currentToken!}));
    };

    // Si hay error en la consulta o no hay token
    // pasar el state loading a false
    if (isError || !currentToken || currentToken === "null") {
      dispatch(setIsLoadingUser(false))
    };

  }, [data, isError, currentToken]);


  if(isLoading || isLoadingUser) {
    return (
      <Spinner size="large"/>
    )
  };

  return null;
};

export default RefetchCurrentUser;