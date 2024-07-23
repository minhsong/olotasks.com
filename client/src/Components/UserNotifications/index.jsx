import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Notifications } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import NotificationDrawer from "./NotificationDrawer";
import { getNotifications } from "../../Services/notificationService";
import { useDispatch, useSelector } from "react-redux";

const UserNotifications = ({}) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  const handleClick = (event) => {
    setOpen((state) => !state);
  };

  useEffect(() => {
    // Fetch notifications
    getNotifications(dispatch);
  }, []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <IconButton
          aria-label="notifications"
          aria-controls="notification-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <Badge badgeContent={unreadCount} color="error">
            <Notifications
              sx={{
                color: "white",
                ":hover": {
                  color: "#ccc",
                },
              }}
            />
          </Badge>
        </IconButton>
      </Box>
      <NotificationDrawer show={open} closeCallback={handleClick} />
    </>
  );
};

export default UserNotifications;
