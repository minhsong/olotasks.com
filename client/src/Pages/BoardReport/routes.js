import Dashboard from "./reports/Dashboard";
import TimeReport from "./reports/TimeReport";
import Deadline from "./reports/Deadline";

export default [
  {
    path: "/",
    name: "Time Report",
    exact: true,
    element: <TimeReport />,
  },
  // {
  //   path: "dashboard",
  //   name: "Dashboard",
  //   exact: true,
  //   element: <Dashboard />,
  // },
  {
    path: "time-report",
    name: "Time Report",
    exact: true,
    element: <TimeReport />,
  },
  {
    path: "deadline",
    name: "Deadline",
    exact: true,
    element: <Deadline />,
  },
];
