import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage, SelectTypePage, AppPage, NotesPage, ConvertPage } from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<SelectTypePage />} />
        <Route path="/app/table" element={<AppPage />} />
        <Route path="/app/notes" element={<NotesPage />} />
        <Route path="/app/convert" element={<ConvertPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;