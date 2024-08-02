import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingScreen from "../Components/LoadingScreen";

export default function ProtectedArea({ children }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const location = useLocation();
  useEffect(() => {
    if (!user.isAuthenticated && !user.pending)
      navigate(`/login?redirect=${location.pathname}`);
  });

  if (user.isAuthenticated && !user.pending) {
    return children;
  } else {
    return <LoadingScreen />;
  }
}
