import React from "react";
import { Routes, Route } from "react-router-dom";
import Lobby from "./routes/Lobby.jsx";
import Room from "./routes/room";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/room/:id" element={<Room />} />
    </Routes>
  );
}
