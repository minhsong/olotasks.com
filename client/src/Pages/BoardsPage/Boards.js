import LoadingScreen from "../../Components/LoadingScreen";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBoards } from "../../Services/boardsService";
import Navbar from "../../Components/Navbar";
import { Container, Wrapper, Title, Board, AddBoard } from "./Styled";
import CreateBoard from "../../Components/Modals/CreateBoardModal/CreateBoard";
import { useNavigate } from "react-router";

const Boards = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [boardsData, pending] = useSelector((state) => [
    state.user.userInfo.boards,
    state.user.pending,
  ]);
  const user = useSelector((state) => state.user);
  const [openModal, setOpenModal] = useState(false);
  const [searchString, setSearchString] = useState("");
  const handleModalClose = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    if (!user.isAuthenticated && !user.pending)
      navigate("/login?redirect=/boards");
  }, [user]);

  const handleClick = (e) => {
    const board = boardsData.find((board) => board.shortId === e.target.id);
    navigate(`/b/${e.target.id}-${board.title}`);
  };

  useEffect(() => {
    document.title = "Boards | Olo Tasks";
  }, []);

  return (
    <>
      {pending && <LoadingScreen />}
      <Container>
        <Navbar searchString={searchString} setSearchString={setSearchString} />
        <Wrapper>
          <Title>Your Boards</Title>
          {!pending &&
            boardsData?.length > 0 &&
            boardsData
              .filter((item) =>
                searchString
                  ? item.title
                      .toLowerCase()
                      .includes(searchString.toLowerCase())
                  : true
              )
              .map((item) => {
                return (
                  <Board
                    key={item._id}
                    link={item.backgroundImageLink}
                    isImage={item.isImage}
                    id={item.shortId}
                    onClick={(e) => handleClick(e)}
                  >
                    {item.title}
                  </Board>
                );
              })}
          {!pending && (
            <AddBoard onClick={() => setOpenModal(true)}>
              Create new board
            </AddBoard>
          )}
          {openModal && <CreateBoard callback={handleModalClose} />}
        </Wrapper>
      </Container>
    </>
  );
};

export default Boards;
