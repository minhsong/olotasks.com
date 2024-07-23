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
import React, { useState } from "react";
import { MenuItemStyled, MenuStyled } from "./styled";
import NotificationDrawer from "./NotificationDrawer";

const UserNotifications = ({}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New user registered" },
    { id: 2, message: "New order received" },
    { id: 3, message: "Server restarted" },
  ]);

  const handleClick = (event) => {
    setOpen((state) => !state);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
          <Badge badgeContent={notifications.length} color="error">
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
