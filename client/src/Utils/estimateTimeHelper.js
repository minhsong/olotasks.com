// input is a string in format "d h m",for example "1d 3h 2m"
export const timeStringToSeconds = (input) => {
  if (!validateDurationString(input)) {
    return null;
  }

  let seconds = 0;
  const units = input.split(" ");

  for (const unit of units) {
    const value = parseInt(unit.slice(0, -1), 10);
    const type = unit.slice(-1);

    switch (type) {
      case "d":
        seconds += value * 86400; // 1 day = 86400 seconds
        break;
      case "h":
        seconds += value * 3600; // 1 hour = 3600 seconds
        break;
      case "m":
        seconds += value * 60; // 1 minute = 60 seconds
        break;
    }
  }

  return seconds;
};

export const secondsToTimeString = (seconds) => {
  if (typeof seconds !== "number" || seconds < 0) {
    return null;
  }

  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  let duration = [];

  if (days > 0) duration.push(`${days}d`);
  if (hours > 0) duration.push(`${hours}h`);
  if (minutes > 0) duration.push(`${minutes}m`);

  return duration.join(" ");
};

// input is a string in format "d h m",for example "1d 3h 2m"
// valid input is a string that contains only numbers and "d", "h", "m" characters
// numbers must be greater than or equal to 0
// for example "1d 3h 2m", "1d 2m", "2h" "2h 5m" are valid, "1d 3h -2m", "1d2h" are invalid
// use regex to validate the input
// return true if input is valid, false otherwise
export const validateDurationString = (timeString) => {
  const regex =
    /^\d+d(\s\d+h)?(\s\d+m)?$|^\d+h(\s\d+m)?$|^\d+m$|^\d+d(\s\d+m)?$|^\d+d(\s\d+h)?$/gi;
  return regex.test(timeString);
};
