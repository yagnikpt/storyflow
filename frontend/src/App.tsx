import { Route, Routes } from "react-router";
import AnalyzePage from "@/pages/analyze";
import HomePage from "@/pages/home";

function App() {
	return (
		<Routes>
			<Route index element={<HomePage />} />
			<Route path="/analyze" element={<AnalyzePage />} />
		</Routes>
	);
}

export default App;
