import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/public/Home";
import Ministry from "./pages/public/Ministry";
import News from "./pages/public/News";
import Announcements from "./pages/public/Announcements";
import Legislation from "./pages/public/Legislation";
import Contact from "./pages/public/Contact";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Ministers from "./pages/admin/Ministers";
import MinisterForm from "./pages/admin/MinisterForm";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import NewsAdmin from "./pages/admin/News";
import NewsForm from "./pages/admin/NewsForm";
import NewsCategories from "./pages/admin/NewsCategories";
import CategorieForm from "./pages/admin/CategorieForm";
import AnnouncementsAdmin from "./pages/admin/Announcements";
import AnnouncementForm from "./pages/admin/AnnouncementForm";
import LegislationsAdmin from "./pages/admin/Legislations";
import LegislationForm from "./pages/admin/LegislationForm";
import NewsDetail from "./pages/public/NewsDetail";
import InformationAdmin from "./pages/admin/Information";
import MessagesAdmin from "./pages/admin/Messages";
import SliderList from "./pages/admin/SliderList";
import SliderForm from "./pages/admin/SliderForm";
import BibliothequeCategories from "./pages/admin/bibliotheque/BibliothequeCategories";
import BibliothequeCategorieForm from "./pages/admin/bibliotheque/CategorieForm";
import BibliothequeList from "./pages/admin/bibliotheque/BibliothequeList";
import BibliothequeForm from "./pages/admin/bibliotheque/BibliothequeForm";
import MinisterPage from "./pages/public/MinisterPage";
import AnnouncementDetail from "./pages/public/AnnouncementDetail";
import { useEffect } from "react";

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly when route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <ScrollToTop /> {/* Add the ScrollToTop component here */}
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/ministry" element={<Ministry />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route
                  path="/announcements/:id"
                  element={<AnnouncementDetail />}
                />
                <Route path="/legislation" element={<Legislation />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/minister" element={<MinisterPage />} />
                <Route path="/minister/:id" element={<MinisterPage />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route
                    path="/admin/information"
                    element={<InformationAdmin />}
                  />
                  <Route path="/admin/messages" element={<MessagesAdmin />} />
                  <Route
                    path="/admin/news/categories"
                    element={<NewsCategories />}
                  />
                  <Route
                    path="/admin/news/categories/new"
                    element={<CategorieForm />}
                  />
                  <Route
                    path="/admin/news/categories/edit/:id"
                    element={<CategorieForm />}
                  />
                  <Route path="/admin/news" element={<NewsAdmin />} />
                  <Route path="/admin/news/new" element={<NewsForm />} />
                  <Route path="/admin/news/edit/:id" element={<NewsForm />} />
                  <Route
                    path="/admin/bibliotheque/categories"
                    element={<BibliothequeCategories />}
                  />
                  <Route
                    path="/admin/bibliotheque/categories/new"
                    element={<BibliothequeCategorieForm />}
                  />
                  <Route
                    path="/admin/bibliotheque/categories/edit/:id"
                    element={<BibliothequeCategorieForm />}
                  />
                  <Route
                    path="/admin/bibliotheque"
                    element={<BibliothequeList />}
                  />
                  <Route
                    path="/admin/bibliotheque/new"
                    element={<BibliothequeForm />}
                  />
                  <Route
                    path="/admin/bibliotheque/edit/:id"
                    element={<BibliothequeForm />}
                  />
                  <Route path="/admin/sliders" element={<SliderList />} />
                  <Route path="/admin/sliders/new" element={<SliderForm />} />
                  <Route
                    path="/admin/sliders/edit/:id"
                    element={<SliderForm />}
                  />
                  <Route path="/admin/ministers" element={<Ministers />} />
                  <Route
                    path="/admin/ministers/new"
                    element={<MinisterForm />}
                  />
                  <Route
                    path="/admin/ministers/edit/:id"
                    element={<MinisterForm />}
                  />
                  <Route
                    path="/admin/announcements"
                    element={<AnnouncementsAdmin />}
                  />
                  <Route
                    path="/admin/announcements/new"
                    element={<AnnouncementForm />}
                  />
                  <Route
                    path="/admin/announcements/edit/:id"
                    element={<AnnouncementForm />}
                  />
                  <Route
                    path="/admin/legislations"
                    element={<LegislationsAdmin />}
                  />
                  <Route
                    path="/admin/legislations/new"
                    element={<LegislationForm />}
                  />
                  <Route
                    path="/admin/legislations/edit/:id"
                    element={<LegislationForm />}
                  />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={true}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
