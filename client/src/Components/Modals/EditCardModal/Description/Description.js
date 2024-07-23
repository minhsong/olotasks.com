import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  RightContainer,
  Title,
  DescriptionInput,
  DescriptionText,
} from "./styled";
import DescriptionIcon from "@mui/icons-material/TextSnippetOutlined";
import { useDispatch, useSelector } from "react-redux";
import { descriptionUpdate } from "../../../../Services/cardService";
import HTMLEditor from "../../../ReUsableComponents/HTMLEditor.js";
import BottomButtonGroup from "../../../BottomButtonGroup/BottomButtonGroup.js";
import QuillEditor from "../../../QuillEditor/index.jsx";
const Description = () => {
  const thisCard = useSelector((state) => state.card);
  const board = useSelector((state) => state.board);
  const dispatch = useDispatch();
  const [inputFocus, setInputFocus] = useState(false);
  const [description, setDescription] = useState(thisCard.description);
  const [mentions, setMentions] = useState([]);
  const ref = useRef();
  const ref2 = useRef();

  const handleSaveClick = async () => {
    setInputFocus(false);
    await descriptionUpdate(
      thisCard.cardId,
      thisCard.listId,
      thisCard.boardId,
      {
        description,
        mentions,
      },
      dispatch
    );
  };

  useEffect(() => {
    setDescription(thisCard.description);
  }, [thisCard.description]);

  useEffect(() => {
    if (inputFocus && ref.current) {
      ref.current.focus();
    }
  }, [inputFocus]);

  const handleClickOutside = (event) => {
    if (ref2.current && !ref2.current.contains(event.target)) {
      //   setInputFocus(false);
      //   setDescription(thisCard.description);
    } else {
      setInputFocus(true);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  });

  return (
    <Container ref={ref2}>
      <DescriptionIcon fontSize="small" />
      <RightContainer>
        <Title>Description</Title>
        {description && !inputFocus ? (
          <DescriptionText
            onClick={() => setInputFocus(true)}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : (
          <QuillEditor
            onChanged={(e) => setDescription(e)}
            value={description}
            placeholder="Mention with @, Add a more detailed description..."
            onMention={(e) => setMentions(e)}
            users={board.members.map((member) => ({
              id: member._id,
              value: member.name,
            }))}
          />
        )}
        <div style={{ display: inputFocus ? "block" : "none" }}>
          <BottomButtonGroup
            closeCallback={() => {
              setInputFocus(false);
              setDescription(thisCard.description);
            }}
            clickCallback={handleSaveClick}
            title="Save"
          />
        </div>
      </RightContainer>
    </Container>
  );
};

export default Description;
