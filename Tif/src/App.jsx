import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import IntroPage from "./templates/intropage.jsx";
import FeedPage from "./templates/FeedPage.jsx";
import PostPage from "./templates/Postpage.jsx";
import LoginPage from "./templates/loginpage.jsx";
import ProfilePage from "./templates/ProfilePage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RegisterPage from "./templates/RegisterPage.jsx";
import LeaderboardPage from "./templates/LeaderboardPage.jsx";
import NeighborhoodPage from "./templates/NeighborhoodPage.jsx";
import StoriesPage from "./templates/StoriesPage.jsx";
import DemandPage from "./templates/DemandPage.jsx";
import GiftRedeemPage from "./templates/GiftRedeemPage.jsx";
import { MealProvider } from "./templates/MealContext.jsx";
import Layout from "./components/Layout.jsx";

export default function App() {
  return (
    <MealProvider>
      <Router>
        <Layout>
          <Routes>
            {/* 🌐 PUBLIC ROUTES */}
            <Route path="/" element={<IntroPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<FeedPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/demand" element={<DemandPage />} />
            <Route path="/gift/:token" element={<GiftRedeemPage />} />

            {/* 🔐 PROTECTED ROUTES */}
            <Route
              path="/postmeals"
              element={
                <ProtectedRoute>
                  <PostPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/neighborhood"
              element={
                <ProtectedRoute>
                  <NeighborhoodPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </MealProvider>
  );
}