import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Stop } from "@mui/icons-material";
import Button from "./Button";
import { useStopwatch } from "react-timer-hook";

const TimeTrackingButton = ({ onStart, onStop, timeUpdate }) => {
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    reset,
  } = useStopwatch({ autoStart: false });

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    timeUpdate && timeUpdate(totalSeconds);
  }, [minutes]);

  const startTracking = () => {
    start();
    onStart && onStart(totalSeconds);
  };

  const stopTracking = () => {
    reset(Date.now(), false);
    onStop && onStop(totalSeconds);
  };

  return (
    <Button
      clickCallback={isRunning ? stopTracking : startTracking}
      active={isRunning}
      title={
        isRunning ? (
          <>
            <Stop fontSize="small" />
            {`${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}
          </>
        ) : (
          "Start Timer"
        )
      }
    />
  );
};

TimeTrackingButton.propTypes = {
  onStart: PropTypes.func,
  onStop: PropTypes.func,
};

export default TimeTrackingButton;
