import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar } from "@mui/material";
import {
  TimeRow,
  TimeTable,
  Title,
  TitleWrapper,
  Container,
  TimeSum,
  TimeSumContainer,
} from "./Styled";
import Button from "../../../ReUsableComponents/Button";
import { Timer } from "@mui/icons-material";
import TimeTrackingButton from "../../../ReUsableComponents/TimeTrackingButton";
import BasePopover from "../../../ReUsableComponents/BasePopover";
import {
  secondsToTimeString,
  timeStringToSeconds,
} from "../../../../Utils/estimateTimeHelper";
import EstimateTimePopover from "../Popovers/EstimateTime/EstimateTimePopover";
import AddWorkingTimePopover from "../Popovers/AddWokringTime/AddWorkingTimePopover";
import { uniq, uniqBy } from "lodash-es";
import {
  addWorkingTime,
  comment,
  updateWorkingTime,
} from "../../../../Services/cardService";
import UserTimeTrackingModel from "./UserTimeTrackingModel";
import TaskComment from "./TaskCommen";
import AvatarIcon from "../../../AvatarIcon";

const TimeTracking = () => {
  const dispatch = useDispatch();
  const timeTracking = useSelector((state) => state.card.timeTracking || {});
  const thisCard = useSelector((state) => state.card);
  const user = useSelector((state) => state.user);
  const [estimatePopover, setEstimatePopover] = useState(null);
  const [addTime, setAddime] = useState(null);
  const [time, setTime] = useState({});
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const timmerStart = async (seconds) => {
    addWorkingTime(
      thisCard.cardId,
      thisCard.listId,
      thisCard.boardId,
      60,
      time.comment,
      new Date(),
      dispatch
    ).then((data) => {
      setTime(data.userTimeTracking.at(-1));
    });
  };

  const timmerStop = (seconds) => {
    if (time && time._id) {
      updateWorkingTime(
        thisCard.cardId,
        thisCard.listId,
        thisCard.boardId,
        time._id,
        seconds,
        time.comment,
        null,
        dispatch
      );
      setTime((state) => ({ comment: "", _id: undefined }));
    }
  };

  const timeSyncToServer = (seconds) => {
    if (time && time._id) {
      updateWorkingTime(
        thisCard.cardId,
        thisCard.listId,
        thisCard.boardId,
        time._id,
        seconds,
        time.comment,
        null,
        dispatch
      );
    }
  };

  const TimeRows = () => {
    if (!timeTracking || !timeTracking.userTimeTracking) return null;

    const users = uniqBy(timeTracking.userTimeTracking || [], "user").filter(
      (s) => s.user != user.userInfo._id
    );

    return users.map((s) => {
      const time = timeTracking.userTimeTracking
        .filter((u) => s.user == u.user)
        .reduce((acc, time) => acc + time.loggedTime, 0);
      return (
        <TimeSum>
          <div key={s.user} style={{ display: "flex", flexDirection: "row" }}>
            <AvatarIcon id={s.user} {...s} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: "0.5em",
              }}
            >
              <span style={{ fontWeight: "bold" }}>{s.userName}</span>
              <span style={{ fontSize: "0.75em", color: "#5e6c84" }}>
                {secondsToTimeString(time)}
              </span>
            </div>
          </div>
        </TimeSum>
      );
    });
  };

  const loggedUserTimeRow = () => {
    const time =
      timeTracking && timeTracking.userTimeTracking
        ? timeTracking.userTimeTracking
            .filter((s) => s.user == user.userInfo._id)
            .reduce((acc, time) => acc + time.loggedTime, 0)
        : 0;
    return (
      <TimeRow key={user.userInfo._id}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <AvatarIcon {...user.userInfo} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "0.5em",
            }}
          >
            <span style={{ fontWeight: "bold" }}>{user.userInfo.name}</span>
            <span style={{ fontSize: "0.75em", color: "#5e6c84" }}>
              {secondsToTimeString(time)}
            </span>
          </div>
        </div>

        <div style={{ flexGrow: 1 }}>
          <TaskComment
            text={time?.comment}
            onChanged={(text) =>
              setTime((state) => ({ ...state, comment: text }))
            }
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "0.5em",
          }}
        >
          <Button
            title={"Add Time"}
            onClick={(event) => setAddime(event.currentTarget)}
          />
          <TimeTrackingButton
            timeUpdate={timeSyncToServer}
            onStart={timmerStart}
            onStop={timmerStop}
          />
          {addTime && (
            <BasePopover
              anchorElement={addTime}
              closeCallback={() => {
                setAddime(null);
              }}
              title="Add Time"
              contents={
                <AddWorkingTimePopover
                  closeCallback={() => {
                    setAddime(null);
                  }}
                />
              }
            />
          )}
        </div>
      </TimeRow>
    );
  };
  return (
    <>
      <Container>
        <TitleWrapper>
          <Timer fontSize="small" />
          <Title>Time Tracking</Title>
        </TitleWrapper>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
          }}
        >
          <div style={{ marginRight: "1em" }}>
            <span style={{ marginRight: "0.5em" }}>Time:</span>
            <Button
              onClick={() => setShowTimeTracking(true)}
              title={
                timeTracking?.spentTime
                  ? secondsToTimeString(timeTracking.spentTime)
                  : "-"
              }
            />
          </div>
          <div style={{}}>
            <span style={{ marginRight: "0.5em" }}>Estimated:</span>
            <Button
              title={
                timeTracking?.estimateTime
                  ? secondsToTimeString(timeTracking.estimateTime)
                  : "-"
              }
              onClick={(event) => setEstimatePopover(event.currentTarget)}
            />
            {estimatePopover && (
              <BasePopover
                anchorElement={estimatePopover}
                closeCallback={() => {
                  setEstimatePopover(null);
                }}
                title="Estimate Time"
                contents={
                  <EstimateTimePopover
                    closeCallback={() => {
                      setEstimatePopover(null);
                    }}
                  />
                }
              />
            )}
          </div>
        </div>
        <TimeTable>
          <TimeSumContainer> {TimeRows()}</TimeSumContainer>
          {loggedUserTimeRow()}
        </TimeTable>
      </Container>
      {showTimeTracking && (
        <UserTimeTrackingModel
          open={showTimeTracking}
          callback={() => setShowTimeTracking(false)}
        />
      )}
    </>
  );
};

export default TimeTracking;
