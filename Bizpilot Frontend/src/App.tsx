import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import AddYourBusiness from "./pages/Forms/AddYourBusiness";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import CategoryData from "./pages/Business/CategoryData"; // apna actual import path check kar lena
import PublishWebsite from "./pages/Business/PublishWebsite"; // apna actual path check kar lena
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ChooseTemplate from "./pages/Business/ChooseTemplate";



export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={
                <ProtectedRoute><Home /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><UserProfiles /></ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute><Calendar /></ProtectedRoute>
              } />
              <Route path="/form-elements" element={
                <ProtectedRoute><FormElements /></ProtectedRoute>
              } />
              <Route path="/add-your-business" element={
                <ProtectedRoute><AddYourBusiness /></ProtectedRoute>
              } />
              <Route path="/manage-menu" element={
                <ProtectedRoute><CategoryData /></ProtectedRoute>
              } />
              <Route path="/choose-template" element={
                <ProtectedRoute><ChooseTemplate /></ProtectedRoute>
              } />
              <Route path="/publish-website" element={
                <ProtectedRoute><PublishWebsite /></ProtectedRoute>
              } />

              {/* Tables, UI Elements, Charts — waise hi rahenge jo public hain */}
              <Route path="/basic-tables" element={<BasicTables />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>

            {/* Auth Layout — ab PublicRoute se guarded */}
            <Route path="/" element={
              <PublicRoute><SignIn /></PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute><SignUp /></PublicRoute>
            } />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}
