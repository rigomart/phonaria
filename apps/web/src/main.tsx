import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const el = document.getElementById("root");
if (el) {
	createRoot(el).render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
