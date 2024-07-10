import React, { useState } from "react";
import {
  Container,
  SearchArea,
  ButtonContainer,
  BlueButton,
} from "../Labels/styled";
import { useDispatch, useSelector } from "react-redux";
import { estimateTimeUpdate } from "../../../../../Services/cardService";
import {
  secondsToTimeString,
  timeStringToSeconds,
  validateDurationString,
} from "../../../../../Utils/estimateTimeHelper";
const EstimateTimePopover = (props) => {
  const dispatch = useDispatch();
  const thisCard = useSelector((state) => state.card);
  const [time, setTime] = useState(
    secondsToTimeString(thisCard.timeTracking.estimateTime)
  );

  const handleSaveClick = async () => {
    props.closeCallback();
    if (validateDurationString(time)) {
      await estimateTimeUpdate(
        thisCard.cardId,
        thisCard.listId,
        thisCard.boardId,
        timeStringToSeconds(time),
        dispatch
      );
    }
  };
  return (
    <Container>
      <SearchArea
        placeholder="time format: 1d 2h 3m"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        aria-invalid={validateDurationString(time)}
      />
      <ButtonContainer>
        <BlueButton
          style={{ width: "4rem" }}
          onClick={handleSaveClick}
          disabled={!validateDurationString(time)}
        >
          Save
        </BlueButton>
      </ButtonContainer>
    </Container>
  );
};

export default EstimateTimePopover;
