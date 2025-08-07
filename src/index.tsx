import React, { Profiler } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

if (process.env.NODE_ENV !== "development" && window.location.protocol === "http:") {
  window.location.href = window.location.href.replace(/^http:/, "https:");
}

// console.log(process.env);

// const onRender = (id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) => {
//   console.log(`%c${id} ${phase} ${actualDuration} ${baseDuration} ${startTime} ${commitTime} ${interactions}`, "color: blue");
// };

root.render(
  <React.StrictMode>
    {/*  <Profiler
        id="App"
        onRender={onRender}
    >
        <App />
      </Profiler> */}
    <App />
  </React.StrictMode>,
);
