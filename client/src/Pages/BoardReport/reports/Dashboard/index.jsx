import { useEffect } from "react";

export default function Dashboard({ boardId }) {
  useEffect(() => {}, [boardId]);

  return (
    <div>
      <h1>Dashboard Report</h1>
      <p>Dashboard content</p>
    </div>
  );
}
