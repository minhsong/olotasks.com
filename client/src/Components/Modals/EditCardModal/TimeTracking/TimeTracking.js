import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar } from "@mui/material";
import { TimeRow, TimeTable, Title, TitleWrapper, Container } from "./Styled";
import Button from "../ReUsableComponents/Button";
import { Timer } from "@mui/icons-material";
import TimeTrackingButton from "../ReUsableComponents/TimeTrackingButton";
import BasePopover from "../ReUsableComponents/BasePopover";
import {
  secondsToTimeString,
  timeStringToSeconds,
} from "../../../../Utils/estimateTimeHelper";
import EstimateTimePopover from "../Popovers/EstimateTime/EstimateTimePopover";
import AddWorkingTimePopover from "../Popovers/AddWokringTime/AddWorkingTimePopover";
import { uniq, uniqBy } from "lodash-es";
import {
  addWorkingTime,
  updateWorkingTime,
} from "../../../../Services/cardService";
import UserTimeTrackingModel from "./UserTimeTrackingModel";

const TimeTracking = () => {
  const dispatch = useDispatch();
  const timeTracking = useSelector((state) => state.card.timeTracking);
  const thisCard = useSelector((state) => state.card);
  const user = useSelector((state) => state.user);
  const [estimatePopover, setEstimatePopover] = useState(null);
  const [addTime, setAddime] = useState(null);
  const [time, setTime] = useState(null);
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const timmerStart = async (seconds) => {
    addWorkingTime(
      thisCard.cardId,
      thisCard.listId,
      thisCard.boardId,
      60,
      "",
      new Date(),
      dispatch
    ).then((data) => {
      setTime(data.userTimeTracking.at(-1));
    });
  };

  const timmerStop = (seconds) => {
    if (time) {
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

  const timeSyncToServer = (seconds) => {
    if (time) {
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
    const users = uniqBy(timeTracking.userTimeTracking, "user").filter(
      (s) => s.user != user.userInfo._id
    );

    return users.map((s) => {
      const time = timeTracking.userTimeTracking
        .filter((u) => s.user == u.user)
        .reduce((acc, time) => acc + time.loggedTime, 0);
      return (
        <TimeRow key={s.user}>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: s.color,
                fontSize: "0.875rem",
                fontWeight: "800",
              }}
            >
              {user.userInfo?.name && user.userInfo?.name[0].toUpperCase()}
            </Avatar>
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
        </TimeRow>
      );
    });
  };

  const loggedUserTimeRow = () => {
    const time = timeTracking.userTimeTracking
      .filter((s) => s.user == user.userInfo._id)
      .reduce((acc, time) => acc + time.loggedTime, 0);
    return (
      <TimeRow key={user.userInfo._id}>
        <div style={{ display: "flex", flexDirection: "row" }}>
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

        <div style={{ flexGrow: 1 }}></div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "0.5em",
          }}
        >
          <Button
            title={"Add Time"}
            clickCallback={(event) => setAddime(event.currentTarget)}
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
              clickCallback={() => setShowTimeTracking(true)}
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
              clickCallback={(event) => setEstimatePopover(event.currentTarget)}
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
          {TimeRows()}
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
