import React, { useEffect, useState } from "react";
import {
  Container,
  IconWrapper,
  RightContainer,
  TitleInput,
  Description,
  Link,
} from "./styled";
import TitleIcon from "@mui/icons-material/ChromeReaderMode";
import { titleUpdate } from "../../../../Services/cardService";
import { useDispatch, useSelector } from "react-redux";
import BasePopover from "../../../ReUsableComponents/BasePopover";
import ListChange from "../Popovers/ListChange";
import { updateCardOrder } from "../../../../Services/dragAndDropService";

const Title = () => {
  const dispatch = useDispatch();
  const card = useSelector((state) => state.card);
  const boardId = useSelector((state) => state.board.shortId);
  const list = useSelector((state) => state.list.allLists);
  const activeList = list.find((s) => s._id == card.owner);
  const [title, setTitle] = useState("");
  const [columnPopover, setColumnPopover] = useState(null);

  useEffect(() => {
    setTitle(card.title);
  }, [card.title]);

  const handleTitleAccept = async () => {
    await titleUpdate(card.cardId, card.listId, card.boardId, title, dispatch);
  };

  const handleListChange = async (data) => {
    setColumnPopover(null);
    await updateCardOrder(
      {
        sourceId: data.sourceId,
        destinationId: data.destinationId,
        sourceIndex: 0,
        destinationIndex: 0,
        cardId: card.cardId,
        boardId: boardId,
        allLists: list,
      },
      dispatch
    );
  };

  return (
    <Container>
      <IconWrapper>
        <TitleIcon fontSize="small" />
      </IconWrapper>
      <RightContainer>
        <TitleInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleAccept}
        ></TitleInput>
        <Description>
          in list{" "}
          <Link onClick={(event) => setColumnPopover(event.currentTarget)}>
            {activeList.title}
          </Link>
        </Description>
      </RightContainer>
      {columnPopover && (
        <BasePopover
          anchorElement={columnPopover}
          closeCallback={() => {
            setColumnPopover(null);
          }}
          title="Lists"
          contents={
            <ListChange
              lists={list.map((s) => ({
                id: s._id,
                name: s.title,
              }))}
              value={card.listId}
              onChange={handleListChange}
              onClose={() => {
                setColumnPopover(null);
              }}
            />
          }
        />
      )}
    </Container>
  );
};

export default Title;
