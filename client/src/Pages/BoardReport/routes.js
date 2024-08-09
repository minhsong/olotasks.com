import Dashboard from "./reports/Dashboard";
import TimeReport from "./reports/TimeReport";
import Deadline from "./reports/Deadline";
import CalendarView from "./reports/CalendarView";

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
  {
    path: "calendar-view",
    name: "Calendar view",
    exact: true,
    element: <CalendarView />,
  },
];
