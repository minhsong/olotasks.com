import React, { useState } from "react";
import {
  Container,
  SearchArea,
  ButtonContainer,
  BlueButton,
  RedButton,
} from "../Labels/styled";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { useDispatch, useSelector } from "react-redux";
import {
  secondsToTimeString,
  timeStringToSeconds,
  validateDurationString,
} from "../../../../../Utils/estimateTimeHelper";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { CommentArea, DatePickerStyled } from "./styled";
import { addWorkingTime } from "../../../../../Services/cardService";

const AddWorkingTimePopover = (props) => {
  const dispatch = useDispatch();
  const thisCard = useSelector((state) => state.card);
  const [time, setTime] = useState("");
  const [workDate, setWorkDate] = useState(dayjs(new Date()));
  const [comment, setComment] = useState("");

  const handleSaveClick = async () => {
    props.closeCallback();

    if (validateDurationString(time)) {
      await addWorkingTime(
        thisCard.cardId,
        thisCard.listId,
        thisCard.boardId,
        timeStringToSeconds(time),
        comment,
        workDate,
        dispatch
      );
    }
  };
  return (
    <Container>
      <div
        style={{
          display: "grid",
          gridTemplateRows: "1fr",
          gridTemplateColumns: "repeat(2, 1fr)",
          maxWidth: "400px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginRight: "10px",
          }}
        >
          <label
            style={{ fontSize: "12px", fontWeight: "bold", color: "#5e6c84" }}
          >
            Time
          </label>
          <SearchArea
            placeholder="time format: 1d 2h 3m"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-invalid={validateDurationString(time)}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginRight: "10px",
          }}
        >
          <label
            style={{ fontSize: "12px", fontWeight: "bold", color: "#5e6c84" }}
          >
            Time
          </label>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePickerStyled
              value={workDate}
              onChange={(newValue) => setWorkDate(newValue)}
            />
          </LocalizationProvider>
        </div>
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", marginTop: "10px" }}
      >
        <label
          style={{ fontSize: "12px", fontWeight: "bold", color: "#5e6c84" }}
        >
          Comment
        </label>
        <CommentArea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
        />
      </div>
      <ButtonContainer>
        <BlueButton
          style={{ width: "4rem" }}
          onClick={handleSaveClick}
          disabled={!validateDurationString(time)}
        >
          Save
        </BlueButton>
        <RedButton
          style={{ width: "4rem" }}
          onClick={() => props.closeCallback()}
        >
          Cancel
        </RedButton>
      </ButtonContainer>
    </Container>
  );
};

export default AddWorkingTimePopover;
