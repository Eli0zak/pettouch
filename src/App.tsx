import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/components/PageGuard';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Layout Components
import Layout from '@/components/Layout';
import DashboardLayout from '@/components/DashboardLayout';
import AdminLayout from '@/pages/admin/AdminLayout';
import PageGuard from '@/components/PageGuard';

// Home Pages
const Index = lazy(() => import('@/pages/Index'));
const About = lazy(() => import('@/pages/About'));
const FeaturesPage = lazy(() => import('@/pages/FeaturesPage'));
const LearnMore = lazy(() => import('@/pages/LearnMore'));
const GetStarted = lazy(() => import('@/pages/GetStarted'));
const Store = lazy(() => import('@/pages/Store'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const CommunityReports = lazy(() => import('@/pages/CommunityReports'));

// Auth Pages
const Auth = lazy(() => import('@/pages/Auth'));

// Dashboard Pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const MyPets = lazy(() => import('@/pages/dashboard/MyPets'));
const LostFound = lazy(() => import('@/pages/dashboard/LostFound'));
const ScanActivity = lazy(() => import('@/pages/dashboard/ScanActivity'));
const Settings = lazy(() => import('@/pages/dashboard/Settings'));
const PetCareTips = lazy(() => import('@/pages/dashboard/PetCareTips'));
const Subscription = lazy(() => import('@/pages/dashboard/Subscription'));
const Orders = lazy(() => import('@/pages/dashboard/Orders'));
const ManageTags = lazy(() => import('@/pages/dashboard/ManageTags'));
// صفحات جديدة للTags والمسح
const TagsManagement = lazy(() => import('@/pages/dashboard/TagsManagement'));
const ScanRecords = lazy(() => import('@/pages/dashboard/ScanRecords'));
const ScanDetails = lazy(() => import('@/pages/dashboard/ScanDetails'));

// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminPets = lazy(() => import('@/pages/admin/AdminPets'));
const AdminLostFound = lazy(() => import('@/pages/admin/AdminLostFound'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminUpgradeRequests = lazy(() => import('@/pages/admin/AdminUpgradeRequests'));
const AdminTags = lazy(() => import('@/pages/admin/AdminTags'));

// Other Pages
const PetProfile = lazy(() => import('@/pages/PetProfile'));
const TagPage = lazy(() => import('@/pages/TagPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function AppContent() {
  const { setLanguage } = useLanguage();
  
  useEffect(() => {
    // Check browser language preference if no stored preference exists
    if (!localStorage.getItem('preferred-language')) {
      const browserLang = navigator.language.toLowerCase();
      const preferredLang = browserLang.startsWith('ar') ? 'ar' : 'en';
      setLanguage(preferredLang);
    }
  }, [setLanguage]);

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Outlet /></Layout>}>
          <Route index element={<Index />} />
          <Route path="about" element={<About />} />
          <Route path="features" element={<FeaturesPage />} />
          <Route path="learn-more" element={<LearnMore />} />
          <Route path="get-started" element={<GetStarted />} />
          <Route path="store" element={<Store />} />
          <Route path="store/product/:id" element={<ProductDetail />} />
          <Route path="community-reports" element={<CommunityReports />} />
        </Route>

        {/* Checkout Route */}
        <Route path="/checkout" element={
          <PageGuard requireAuth={true}>
            <Layout>
              <Checkout />
            </Layout>
          </PageGuard>
        } />

        {/* Authentication Routes */}
        <Route path="/auth" element={<Auth />} />

        {/* Dashboard Routes - Protected */}
        <Route path="/dashboard" element={
          <PageGuard requireAuth={true}>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </PageGuard>
        } />
        <Route path="/dashboard/pets" element={
          <PageGuard requireAuth={true}>
            <DashboardLayout>
              <MyPets />
            </DashboardLayout>
          </PageGuard>
        } />
        <Route path="/dashboard/lost-found" element={
          <PageGuard requireAuth={true}>
            <DashboardLayout>
              <LostFound />
            </DashboardLayout>
          </PageGuard>
        } />
        <Route path="/dashboard/scans" element={
          <PageGuard requireAuth={true}>
            <DashboardLayout>
              <ScanActivity />
            </DashboardLayout>
          </PageGuard>
        } />
        <Route path="/dashboard/tags" element={
          <PageGuard requireAuth={true}>
            <DashboardLayout>
              <ManageTags />
            </DashboardLayout>
          </PageGuard>
        } />
        
        {/* صفحات جديدة للTags والمسح */}
        <Route path="/dashboard/tags-management" element={
          <PageGuard requireAuth={true}>
            <DashboardLayout>
              <TagsManagement />
            </DashboardLayout>
          </PageGuard>
        } />
        <Route path="/dashboard/scan-records" element={
          <PageGuard requireAuth={true}>
            <DashboardLayout>
              <ScanRecords />
            </DashboardLayout>
          </PageGuard>
        } />
        <Route path="/dashboard/scan-details/:id" element={
          <PageGuard requireAuth={true}>
            <DashboardLayout>
              <ScanDetails />
            </DashboardLayout>
          </PageGuard>
        } />
        
        <Route path="/dashboard/settings" element={
          <PageGuard requireAuth={true}>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </PageGuard>
        } />
        <Route path="/dashboard/tips" element={
          <PageGuard requireAuth={true}>
            <DashboardLayout>
              <PetCareTips />
            </DashboardLayout>
          </PageGuard>
        } />
        <Route path="/dashboard/subscription" element={
          <PageGuard requireAuth={true}>
            <DashboardLayout>
              <Subscription />
            </DashboardLayout>
          </PageGuard>
        } />
        <Route path="/dashboard/orders" element={
          <PageGuard requireAuth={true}>
            <DashboardLayout>
              <Orders />
            </DashboardLayout>
          </PageGuard>
        } />
        <Route path="/pet/:id" element={<PetProfile />} />
        <Route path="/tag/:tagCode" element={<TagPage />} />

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={
          <PageGuard requireAuth={true} requireAdmin={true}>
            <AdminLayout />
          </PageGuard>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="pets" element={<AdminPets />} />
          <Route path="lost-found" element={<AdminLostFound />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="tags" element={<AdminTags />} />
          <Route path="upgrade-requests" element={<AdminUpgradeRequests />} />
        </Route>

        {/* Fallback Routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <CartProvider>
            <BrowserRouter>
              <AuthProvider>
                <AppContent />
                <Toaster />
              </AuthProvider>
            </BrowserRouter>
          </CartProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
