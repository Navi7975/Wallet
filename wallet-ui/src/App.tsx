import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import WalletDashboard from "./pages/WalletDashboard";

function App() {
 

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<WalletDashboard />} />
        
        </Routes>
      </Router>
    </>
  )
}

export default App
