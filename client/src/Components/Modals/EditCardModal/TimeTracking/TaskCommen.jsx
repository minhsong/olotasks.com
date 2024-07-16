import React, { useEffect, useRef, useState } from "react";
import { CommentContent, EditInput } from "./Styled";
import { Comment } from "@mui/icons-material";

const TaskComment = ({ text, onChanged }) => {
  const [edit, setEdit] = useState(false);
  const [comment, setComment] = useState(text);
  const ref = useRef();
  const inputRef = useRef();
  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setEdit(false);
    }
  };

  const handleCommentIconClick = () => {
    setEdit(true);
    setTimeout(() => {
      inputRef.current.focus();
    }, 100);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  });

  useEffect(() => {
    setComment((state) => text);
    console.log(text);
  }, [text]);

  const onEnterCapture = (e) => {
    if (e.key === "Enter") {
      onChanged(comment);
      setEdit(false);
    }
  };

  return (
    <div ref={ref}>
      {edit ? (
        <EditInput
          placeholder="add comment"
          ref={inputRef}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={() => onChanged(comment)}
          onKeyUpCapture={onEnterCapture}
        />
      ) : (
        <CommentContent>
          <span>{comment}</span>
          <Comment fontSize="0.5em" onClick={handleCommentIconClick} />
        </CommentContent>
      )}
    </div>
  );
};

export default TaskComment;
