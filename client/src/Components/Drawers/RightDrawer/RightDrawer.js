import React, { useEffect, useState } from "react";
import BaseDrawer from "../BaseDrawer";
import AboutMenu from "./AboutMenu/AboutMenu";
import MainMenu from "./MainMenu/MainMenu";
import BackgroundMenu from "./BackgroundMenu/BackgroundMenu";
import BoardMembers from "./BoardMembers";
const RightDrawer = (props) => {
  const [show, setShow] = useState(false);
  const [sectionName, setSectionName] = useState("Menu");
  useEffect(() => {
    props.show && setShow(true);
  }, [props.show]);

  const handleBackClick = () => {
    if (
      sectionName === "About this board" ||
      sectionName === "Change background" ||
      sectionName === "Members"
    )
      setSectionName("Menu");
    else setSectionName("Change background");
  };

  const SubMenu = () => {
    switch (sectionName) {
      case "Menu":
        return <MainMenu menuCallback={(param) => setSectionName(param)} />;
      case "About this board":
        return <AboutMenu />;
      case "Members":
        return <BoardMembers menuCallback={(param) => setSectionName(param)} />;
      default:
        return (
          <BackgroundMenu
            {...props}
            sectionName={sectionName}
            menuCallback={(param) => setSectionName(param)}
          />
        );
    }
  };

  return (
    <BaseDrawer
      title={sectionName}
      show={show}
      closeCallback={(param) => {
        setShow(param);
        setSectionName("Menu");
        props.closeCallback();
      }}
      backClickCallback={handleBackClick}
      showBackIcon={sectionName !== "Menu"}
      content={<SubMenu />}
    />
  );
};

export default RightDrawer;
