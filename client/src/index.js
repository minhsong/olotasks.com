import React from "react";
import App from "./App";
import Store from "./Redux/Store";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import "@atlaskit/css-reset";
import "./Components/Modals/EditCardModal/Popovers/Date/DateRange.css";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Provider store={Store}>
    <App />
  </Provider>
);
