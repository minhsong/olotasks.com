import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import styled from "styled-components";
import logo_white from "../Images/olotasks_white.svg";
const Icon = styled.img`
  width: 10vw;
`;

export default function LoadingScreen() {
  const [open] = React.useState(true);
  /*  const handleClose = () => {
    setOpen(false);
  }; */
  return (
    <div>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        //onClick={handleClose}
      >
        <Icon src={logo_white} />
      </Backdrop>
    </div>
  );
}
