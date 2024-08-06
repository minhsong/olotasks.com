import "react-date-range/dist/styles.css"; // main style file
import React, { useEffect, useState } from "react";
import { DateRangePicker } from "react-date-range";

export default ({ value, onChange }) => {
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    if (value) {
      setState([
        {
          startDate: new Date(value.startDate),
          endDate: new Date(value.endDate),
          key: "selection",
        },
      ]);
    }
  }, [value]);

  const handleSelect = (ranges) => {
    onChange && onChange(ranges.selection);
    setState([ranges.selection]);
  };

  return (
    <DateRangePicker
      showSelectionPreview={true}
      moveRangeOnFirstSelection={false}
      onChange={handleSelect}
      ranges={state}
    />
  );
};
