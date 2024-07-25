import Navbar from "../../Components/Navbar";
import React, { useEffect, useState } from "react";
import TopBar from "../../Components/TopBar/TopBar";
import * as style from "./Styled";
import AddList from "../../Components/AddList/AddList";
import List from "../../Components/List/List";
import { useDispatch, useSelector } from "react-redux";
import { getBoard } from "../../Services/boardsService";
import { getLists } from "../../Services/boardService";
import {
  updateCardOrder,
  updateListOrder,
} from "../../Services/dragAndDropService";
import LoadingScreen from "../../Components/LoadingScreen";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useNavigate, useParams } from "react-router-dom";
import EditCard from "../../Components/Modals/EditCardModal/EditCard";
import { useWebSocket } from "../../Components/Websocket/WebSocketContext";
import { isEmpty } from "lodash-es";

const Board = (props) => {
  /* props.match.params.id */
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ws } = useWebSocket();
  let { id, cardId } = useParams();
  const { backgroundImageLink, isImage, loading, title } = useSelector(
    (state) => state.board
  );
  const user = useSelector((state) => state.user);
  const { allLists, loadingListService } = useSelector((state) => state.list);
  const [searchString, setSearchString] = useState("");
  const [boardId, boardTitle] = id.split("-");

  useEffect(() => {
    if (!user.isAuthenticated && !user.pending) navigate("/");
  });

  useEffect(() => {
    getBoard(boardId, dispatch);
    getLists(boardId, dispatch);
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

  const onDragEnd = async (result) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (result.type === "column") {
      if (source.index === destination.index) return;
      await updateListOrder(
        {
          sourceIndex: source.index,
          destinationIndex: destination.index,
          listId: draggableId,
          boardId: boardId,
          allLists: allLists,
        },
        dispatch
      );
      return;
    }
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;
    await updateCardOrder(
      {
        sourceId: source.droppableId,
        destinationId: destination.droppableId,
        sourceIndex: source.index,
        destinationIndex: destination.index,
        cardId: draggableId,
        boardId: boardId,
        allLists: allLists,
      },
      dispatch
    );
  };

  const handleOpenClose = () => {
    navigate(`/b/${id}`);
    // setOpenModal((current) => !current);
  };

  if (loading) return <LoadingScreen />;

  if (isEmpty(title))
    return (
      <>
        <Navbar />
        <style.Container isImage={false} color="blue"></style.Container>
      </>
    );

  return (
    <>
      <Navbar />
      <style.Container
        isImage={isImage}
        bgImage={
          isImage ? backgroundImageLink.split("?")[0] : backgroundImageLink
        }
      >
        <TopBar />
        {loadingListService && <LoadingScreen />}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="all-columns"
            direction="horizontal"
            type="column"
          >
            {(provided, snapshot) => {
              return (
                <style.ListContainer
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {!loading &&
                    allLists?.map((list, index) => {
                      return (
                        list && (
                          <List
                            key={list._id}
                            index={index}
                            info={list}
                            boardId={boardId}
                          />
                        )
                      );
                    })}
                  {provided.placeholder}
                  <AddList boardId={boardId} />
                </style.ListContainer>
              );
            }}
          </Droppable>
        </DragDropContext>
      </style.Container>
      {cardId && (
        <EditCard
          open={true}
          callback={handleOpenClose}
          ids={{
            cardId: cardId,
            boardId: boardId,
          }}
        />
      )}
    </>
  );
};

export default Board;
