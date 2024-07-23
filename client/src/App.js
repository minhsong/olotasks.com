import React, { useEffect } from "react";
import Index from "./Pages/IndexPage/Index";
import Login from "./Pages/LoginPage/Login";
import Register from "./Pages/RegisterPage/Register";
import Alert from "./Components/AlertSnackBar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Boards from "./Pages/BoardsPage/Boards";
import { loadUser } from "./Services/userService";
import Store from "./Redux/Store";
import Board from "./Pages/BoardPage/Board";
import ProtectedArea from "./Utils/ProtectedArea";
import { WebSocketProvider } from "./Components/Websocket/WebSocketContext";
const App = () => {
  useEffect(() => {
    loadUser(Store.dispatch);
  }, []);
  return (
    <BrowserRouter>
      <Alert />
      <WebSocketProvider>
        <Routes>
          <Route
            exact
            path="/boards"
            element={
              <ProtectedArea>
                <Boards />
              </ProtectedArea>
            }
          />
          <Route
            path="/b/:id"
            element={
              <ProtectedArea>
                <Board />
              </ProtectedArea>
            }
          />
          <Route
            exact
            path="/b/:id/:cardId*"
            element={
              <ProtectedArea>
                <Board />
              </ProtectedArea>
            }
          />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/" element={<Index />} />
        </Routes>
      </WebSocketProvider>
    </BrowserRouter>
  );
};

export default App;
