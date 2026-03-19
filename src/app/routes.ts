import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { FounderDashboard } from "./pages/FounderDashboard";
import { InvestorDashboard } from "./pages/InvestorDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: LoginPage },
      { path: "signup/:role", Component: SignupPage },
      { path: "founder", Component: FounderDashboard },
      { path: "investor", Component: InvestorDashboard },
    ],
  },
]);
