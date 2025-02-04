import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import App from "./App";
import HomeView from "./views/HomeView";
import TestSingleView from "./views/TestSingleView";
import TestMultiView from "./views/TestMultiView";
import ReportView from "./views/ReportView";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Navigate replace to="/home" /> },
      { path: "/home", element: <HomeView /> },
      { path: "/test-single", element: <TestSingleView /> },
      { path: "/test-multi", element: <TestMultiView /> },
      { path: "/reports", element: <ReportView /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
