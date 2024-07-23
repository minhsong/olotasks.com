import React, { useEffect, useState } from "react";
import { Container } from "./styled";
import ActivitySection from "./ActivitySection/ActivitySection";
import BaseDrawer from "../Drawers/BaseDrawer";
import { Notifications } from "@mui/icons-material";
import { IconButton } from "@mui/material";

const NotificationDrawer = (props) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    props.show && setShow(true);
  }, [props.show]);

  return (
    <BaseDrawer
      title={
        <>
          <IconButton
            aria-label="notifications"
            aria-controls="notification-menu"
            aria-haspopup="true"
          >
            <Notifications
              sx={{
                color: "black",
              }}
            />
          </IconButton>{" "}
          Notifications{" "}
        </>
      }
      show={show}
      closeCallback={(param) => {
        setShow(param);
        props.closeCallback();
      }}
      content={
        <Container>
          <ActivitySection />
        </Container>
      }
    />
  );
};

export default NotificationDrawer;
