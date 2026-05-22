import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/home";
import Camera from "./Pages/Camera";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/camera" element={<Camera />} />
      </Routes>
    </BrowserRouter>
  );
}