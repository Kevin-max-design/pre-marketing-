import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { FounderDashboard } from "./pages/FounderDashboard";
import { InvestorDashboard } from "./pages/InvestorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";

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
      { path: "admin", Component: AdminDashboard },
      { path: "privacy", Component: PrivacyPolicy },
      { path: "terms", Component: TermsOfService },
    ],
  },
]);
