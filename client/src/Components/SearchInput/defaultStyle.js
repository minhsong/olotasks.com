import zIndex from "@mui/material/styles/zIndex";

export default {
  control: {
    fontSize: 14,
    fontWeight: "normal",
    width: "100%",
    zIndex: zIndex.modal,
  },

  "&multiLine": {
    control: {
      fontFamily: "monospace",
      minHeight: 63,
    },
    highlighter: {
      padding: 9,
      border: "1px solid transparent",
    },
    input: {
      padding: 9,
      border: "1px solid silver",
    },
  },

  "&singleLine": {
    display: "inline-flex",
    width: "100%",

    highlighter: {
      padding: 1,
      border: "2px inset transparent",
    },
    input: {
      boxSizing: "content-box",
      fontSize: "0.85rem",
      border: "none",
      color: "white",
      backgroundColor: "transparent",
      outline: "none",
      height: "100%",
      width: "100%",
      overflow: "hidden",
      "&::placeholder": {
        color: "white",
      },
      "&:focus": {
        fontWeight: 600,
        "&::placeholder": {
          color: "transparent",
        },
      },
    },
  },

  suggestions: {
    zIndex: 999,
    list: {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      border: "1px solid rgba(0,0,0,0.15)",
      fontSize: 14,
    },
    item: {
      padding: "5px 15px",
      borderBottom: "1px solid rgba(0,0,0,0.15)",
      "&focused": {
        backgroundColor: "#cee4e5",
      },
    },
  },
};
