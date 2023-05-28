import "./app.scss";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ContentContextProvider } from "./contexts/content-context";
import ErrorPage from "./pages/error-page";
import ExplorePage from "./pages/explore-page";
import LandingPage from "./pages/landing-page";
import FoldersPage from "./pages/gallery-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/folders",
    element: <FoldersPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/explore",
    element: <ExplorePage />,
    errorElement: <ErrorPage />,
  },
]);

function App() {
  // console.table(import.meta.env)
  return (
    <ContentContextProvider>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </ContentContextProvider>
  );
}

export default App;
