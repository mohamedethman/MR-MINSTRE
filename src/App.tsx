import React, { lazy, Suspense } from "react";
import Spinner from "./components/Spinner";
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
import AdminHeader from "./components/AdminHeader";
import Home from "./pages/public/Home";
import Ministry from "./pages/public/Ministry";
import Projects from "./pages/public/Projects";
import ProjectDetail from "./pages/public/ProjectDetail";
import News from "./pages/public/News";
import Announcements from "./pages/public/Announcements";
import Legislation from "./pages/public/Legislation";
import Contact from "./pages/public/Contact";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ConfirmProvider } from "./components/ConfirmDialog";
import { useT } from "./i18n";
import NewsDetail from "./pages/public/NewsDetail";
import MinisterPage from "./pages/public/MinisterPage";
import AnnouncementDetail from "./pages/public/AnnouncementDetail";
import { useEffect } from "react";

// The admin area (editors, forms, tables) is loaded only when an /admin page is opened,
// so public visitors download a much smaller bundle.
const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Ministers = lazy(() => import("./pages/admin/Ministers"));
const MinisterForm = lazy(() => import("./pages/admin/MinisterForm"));
const NewsAdmin = lazy(() => import("./pages/admin/News"));
const NewsForm = lazy(() => import("./pages/admin/NewsForm"));
const NewsCategories = lazy(() => import("./pages/admin/NewsCategories"));
const CategorieForm = lazy(() => import("./pages/admin/CategorieForm"));
const AnnouncementsAdmin = lazy(() => import("./pages/admin/Announcements"));
const AnnouncementForm = lazy(() => import("./pages/admin/AnnouncementForm"));
const LegislationsAdmin = lazy(() => import("./pages/admin/Legislations"));
const LegislationForm = lazy(() => import("./pages/admin/LegislationForm"));
const InformationAdmin = lazy(() => import("./pages/admin/Information"));
const HomeLayoutAdmin = lazy(() => import("./pages/admin/HomeLayout"));
const MessagesAdmin = lazy(() => import("./pages/admin/Messages"));
const SliderList = lazy(() => import("./pages/admin/SliderList"));
const SliderForm = lazy(() => import("./pages/admin/SliderForm"));
const BibliothequeCategories = lazy(() => import("./pages/admin/bibliotheque/BibliothequeCategories"));
const BibliothequeCategorieForm = lazy(() => import("./pages/admin/bibliotheque/CategorieForm"));
const BibliothequeList = lazy(() => import("./pages/admin/bibliotheque/BibliothequeList"));
const BibliothequeForm = lazy(() => import("./pages/admin/bibliotheque/BibliothequeForm"));
const CrudList = lazy(() => import("./pages/admin/crud/CrudList"));
const CrudForm = lazy(() => import("./pages/admin/crud/CrudForm"));

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly when route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Pages shown on their own, without any header or footer
const STANDALONE_ROUTES = ["/admin/login"];
const isAdminPath = (pathname: string) => pathname === "/admin" || pathname.startsWith("/admin/");

// Public pages: full header + footer. Admin pages: slim admin header only.
const SiteHeader: React.FC = () => {
  const { pathname } = useLocation();
  if (STANDALONE_ROUTES.includes(pathname)) return null;
  return isAdminPath(pathname) ? <AdminHeader /> : <Header />;
};

const PublicChrome: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { pathname } = useLocation();
  return isAdminPath(pathname) ? null : children;
};

/** Toasts follow the interface language: right-to-left in Arabic, left-to-right in French. */
const LocalizedToasts: React.FC = () => {
  const { isArabic } = useT();
  return (
    <ToastContainer
      position={isArabic ? "top-left" : "top-right"}
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={isArabic}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ConfirmProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-grow">
              <ScrollToTop /> {/* Add the ScrollToTop component here */}
              <Suspense fallback={<Spinner variant="page" />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/ministry" element={<Ministry />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route
                  path="/procedures"
                  element={<Ministry initialSection="procedures" />}
                />
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
                  <Route path="/admin/home-layout" element={<HomeLayoutAdmin />} />
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
                  {/* Generic sections (pages/admin/crud/sections.ts). Static routes above take precedence. */}
                  <Route path="/admin/:section" element={<CrudList />} />
                  <Route path="/admin/:section/new" element={<CrudForm />} />
                  <Route path="/admin/:section/edit/:id" element={<CrudForm />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
              </Suspense>
            </main>
            <PublicChrome>
              <Footer />
            </PublicChrome>
            <LocalizedToasts />
          </div>
        </Router>
      </AuthProvider>
      </ConfirmProvider>
    </LanguageProvider>
  );
};

export default App;
