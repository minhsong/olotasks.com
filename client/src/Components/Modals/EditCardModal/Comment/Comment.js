import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Container,
  LeftContainer,
  RightContainer,
  Title,
  CommentWrapper,
  ButtonContainer,
  LinkContainer,
  Link,
  CommentEditorContainer,
  TimeAgoText,
  CommentTime,
} from "./styled";
import {
  commentDelete,
  commentUpdate,
} from "../../../../Services/cardService.js";
import { Avatar } from "@mui/material";
import moment from "moment";
import BottomButtonGroup from "../../../BottomButtonGroup/BottomButtonGroup.js";
import QuillEditor from "../../../QuillEditor/index.jsx";

const Comment = (props) => {
  const board = useSelector((state) => state.board);
  const [edit, setEdit] = useState(true);
  const [mentions, setMentions] = useState([]);
  const [comment, setComment] = useState(props.text);
  const user = useSelector((state) => state.user.userInfo);
  const card = useSelector((state) => state.card);
  const dispatch = useDispatch();
  const handleSaveClick = async () => {
    setEdit(true);
    await commentUpdate(
      card.cardId,
      card.boardId,
      {
        content: comment,
        mentions,
      },
      props._id,
      dispatch
    );
  };

  const handleDeleteClick = async () => {
    await commentDelete(card.cardId, card.boardId, props._id, dispatch);
  };
  return (
    <>
      <Container>
        <LeftContainer>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: props.color,
              fontSize: "0.875rem",
              fontWeight: "800",
            }}
          >
            {props.userName[0].toUpperCase()}
          </Avatar>
        </LeftContainer>
        <RightContainer>
          <div
            style={{ display: "flex", flexDirection: "row", alignItems: "end" }}
          >
            <Title>{props.userName}</Title>

            {Date.now() - new Date(props.createdAt) > 60 * 60 * 1000 ? (
              <CommentTime>
                {moment(props.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
              </CommentTime>
            ) : (
              <TimeAgoText date={props.createdAt} />
            )}
          </div>
          <CommentWrapper>
            {!edit ? (
              <CommentEditorContainer>
                <QuillEditor
                  onChanged={(e) => setComment(e)}
                  value={comment}
                  placeholder="Mention with @, Write a comment..."
                  onMention={(e) => setMentions(e)}
                  users={board.members.map((member) => ({
                    id: member._id,
                    value: member.name,
                  }))}
                />
              </CommentEditorContainer>
            ) : (
              //   <CommentArea
              //     value={comment}
              //     onChange={(e) => setComment(e.target.value)}
              //     readOnly={edit}
              //   />
              <div
                style={{
                  backgroundColor: "white",
                  padding: "0.5rem",
                  borderRadius: "5px",
                  boxShadow: "0 2px 2px -2px #091e4240, 0 0 0 1px #091e4214",
                  border: "1px solid lightgray",
                  marginBottom: "0.5em",
                }}
                dangerouslySetInnerHTML={{ __html: comment }}
              ></div>
              // <CommentArea value={comment} onChange={(e) => setComment(e.target.value)} readOnly={edit} />
            )}
            {/* <CommentArea value={comment} onChange={(e) => setComment(e.target.value)} readOnly={edit} /> */}
            <ButtonContainer show={!edit}>
              <BottomButtonGroup
                title="Save"
                clickCallback={handleSaveClick}
                closeCallback={() => {
                  setEdit(true);
                }}
              />
            </ButtonContainer>
            <LinkContainer show={edit && user.name === props.userName}>
              <Link onClick={() => setEdit(false)}>Edit</Link>
              <Link onClick={handleDeleteClick}>Delete</Link>
            </LinkContainer>
          </CommentWrapper>
        </RightContainer>
      </Container>
    </>
  );
};

export default Comment;
