import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  LeftContainer,
  RightContainer,
  Title,
  CommentWrapper,
  SaveButton,
  CommentArea,
  TitleWrapper,
} from "./styled";
import MessageIcon from "@mui/icons-material/MessageOutlined";
import Comment from "../Comment/Comment";
import ActivityLog from "../ActivityLog/ActivityLog";
import Button from "../../../ReUsableComponents/Button";
import { useDispatch, useSelector } from "react-redux";
import { comment } from "../../../../Services/cardService";
import { Avatar } from "@mui/material";
import { CommentEditorContainer } from "../Comment/styled";
import HTMLEditor from "../../../ReUsableComponents/HTMLEditor";
import QuillEditor from "../../../QuillEditor";

const Activity = () => {
  const dispatch = useDispatch();
  const ref = useRef();
  const card = useSelector((state) => state.card);
  const user = useSelector((state) => state.user);
  const board = useSelector((state) => state.board);
  const [focusComment, setFocusComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [details, setDetails] = useState(false);
  const [mentions, setMentions] = useState([]);

  const handleSaveClick = async () => {
    await comment(
      card.cardId,
      card.boardId,
      {
        content: newComment,
        mentions,
      },
      dispatch
    );
    setNewComment("");
  };

  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setFocusComment(false);
    } else {
      setFocusComment(true);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  });
  return (
    <>
      <Container>
        <LeftContainer>
          <MessageIcon fontSize="small" />
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: user.userInfo.color,
              fontSize: "0.875rem",
              fontWeight: "800",
            }}
          >
            {user.userInfo?.name && user.userInfo?.name[0].toUpperCase()}
          </Avatar>
        </LeftContainer>
        <RightContainer>
          <TitleWrapper>
            <Title>Activity</Title>
            <Button
              onClick={() => setDetails((prev) => !prev)}
              title={details ? "Hide details" : "Show details"}
            />
          </TitleWrapper>
          <CommentWrapper ref={ref}>
            <SaveButton
              disabled={!newComment}
              onClick={handleSaveClick}
              show={focusComment}
            >
              Save
            </SaveButton>
            <CommentEditorContainer>
              <QuillEditor
                onChanged={(e) => setNewComment(e)}
                value={newComment}
                onFocus={focusComment}
                placeholder="Mention with @, Write a comment..."
                onMention={(e) => setMentions(e)}
                users={board.members
                  .filter((u) => u.user != user._id)
                  .map((member) => ({
                    id: member.user,
                    value: member.name,
                  }))}
              />
            </CommentEditorContainer>
          </CommentWrapper>
        </RightContainer>
      </Container>
      {card.comments?.map((comment) => {
        return <Comment key={comment._id} {...comment} />;
      })}

      {details && <ActivityLog />}
    </>
  );
};

export default Activity;
