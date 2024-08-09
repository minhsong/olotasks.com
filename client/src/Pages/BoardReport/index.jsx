import Navbar from "../../Components/Navbar";
import React, { useEffect, useState } from "react";
import TopBar from "../../Components/TopBar/TopBar";
import { useDispatch, useSelector } from "react-redux";
import { getBoard } from "../../Services/boardsService";
import { getLists } from "../../Services/boardService";
import {
  Container,
  LeftWrapper,
  MainContainer,
  RightContent,
  RightWrapper,
} from "./Styled";
import LoadingScreen from "../../Components/LoadingScreen";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useWebSocket } from "../../Components/Websocket/WebSocketContext";
import { isEmpty } from "lodash-es";
import ConfirmModal from "../../Components/ConfirmModal";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import _nav from "./_nav";
import routes from "./routes";
import Button from "../../Components/ReUsableComponents/Button";
import TopActionMenu from "./TopActionMenu";
import { resetFilter } from "../../Redux/Slices/reportSlice";

export default (props) => {
  /* props.match.params.id */
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ws } = useWebSocket();
  let { id, cardId } = useParams();
  const { backgroundImageLink, isImage, loading, title, shortId } = useSelector(
    (state) => state.board
  );
  const user = useSelector((state) => state.user);
  const { allLists, loadingListService } = useSelector((state) => state.list);
  const [boardId, boardTitle] = id.split("-");

  useEffect(() => {
    if (!user.isAuthenticated && !user.pending) navigate("/");
  });

  useEffect(() => {
    // prevent loading board again when data is loaded
    if (!isEmpty(title) && !loading && boardId == shortId) return;
    getBoard(boardId, dispatch);
    getLists(boardId, dispatch);
    dispatch(resetFilter());
  }, [id, dispatch, boardId]);

  useEffect(() => {
    if (!ws) return;
    ws.emit("joinRoom", boardId);
    return () => {
      ws && ws.emit("leaveRoom", boardId);
    };
  }, [ws]);
  useEffect(() => {
    document.title = title + " | Olo Tasks";
  }, [title]);

  const ActionMenu = () => {
    return (
      <>
        <Button color={"info"}>Time Report</Button>
      </>
    );
  };

  if (loading) return <LoadingScreen />;

  if (isEmpty(title))
    return (
      <>
        <Navbar />
        <Container isImage={false} color="blue">
          <ConfirmModal
            open
            title="Board Not Found!"
            closeHandle={() => {
              navigate("/boards");
            }}
          />
        </Container>
      </>
    );

  return (
    <>
      <Navbar />
      <Container
        isImage={isImage}
        bgImage={
          isImage ? backgroundImageLink.split("?")[0] : backgroundImageLink
        }
      >
        <TopBar activeMenu={"r"} />
        {loadingListService && <LoadingScreen />}
        <MainContainer>
          <LeftWrapper>
            <List sx={{ width: "100%" }}>
              {_nav.map((route, index) => {
                return (
                  <ListItem key={route.name} disablePadding>
                    <ListItemButton LinkComponent={Link} to={route.to}>
                      <ListItemIcon sx={{ minWidth: 35, color: "white" }}>
                        {route.icon}
                      </ListItemIcon>
                      <ListItemText primary={route.name} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </LeftWrapper>
          <RightWrapper>
            <TopActionMenu actionMenu={<ActionMenu />} />
            <RightContent>
              <Routes>
                {routes.map((route, index) => {
                  return (
                    <Route
                      key={index}
                      exact={route.exact}
                      path={route.path}
                      element={route.element}
                    />
                  );
                })}
              </Routes>
            </RightContent>
          </RightWrapper>
        </MainContainer>
      </Container>
    </>
  );
};
