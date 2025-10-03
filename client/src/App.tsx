import { Switch, Route, Router } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import { NavigationProvider } from "@/contexts/navigation-context";
import { Suspense, lazy } from "react";
import LoadingPage from "@/components/loading-page";
import OfflinePage from "@/components/offline-page";
import CookieConsent from "@/components/cookie-consent";

// Lazy load components for better performance and reload handling
const Home = lazy(() => import("@/pages/home"));
const AddServer = lazy(() => import("@/pages/add-server"));
const AddBot = lazy(() => import("@/pages/add-bot"));
const AdminPage = lazy(() => import("@/pages/admin"));
const Events = lazy(() => import("@/pages/events"));
const Explore = lazy(() => import("@/pages/explore"));
const JoinMembers = lazy(() => import("@/pages/join-members"));
const Store = lazy(() => import("@/pages/store"));
const Quest = lazy(() => import("@/pages/quest"));
const YourServers = lazy(() => import("@/pages/your-servers"));
const Advertise = lazy(() => import("@/pages/advertise"));
const Profile = lazy(() => import("@/pages/profile"));
const AddEvent = lazy(() => import("@/pages/add-event"));
const SearchPage = lazy(() => import("@/pages/search"));
const ServerDetail = lazy(() => import("@/pages/server-detail"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Help = lazy(() => import("@/pages/help"));
const HelpCenter = lazy(() => import("@/pages/help-center"));
const SupportTicket = lazy(() => import("@/pages/support-ticket"));
const ContactUs = lazy(() => import("@/pages/contact-us"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const AboutUs = lazy(() => import("@/pages/about-us"));
const FairUsePolicy = lazy(() => import("@/pages/fair-use-policy"));
const Blog = lazy(() => import("@/pages/blog"));
const Partnership = lazy(() => import("@/pages/partnership"));
const AddPartnership = lazy(() => import("@/pages/add-partnership"));
const ServerTemplates = lazy(() => import("@/pages/server-templates"));
const AddTemplate = lazy(() => import("@/pages/add-template"));
const Login = lazy(() => import("@/pages/login"));
const Jobs = lazy(() => import("@/pages/jobs"));
const Trade = lazy(() => import("@/pages/trade"));
const Payment = lazy(() => import("@/pages/payment"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const YourBots = lazy(() => import("@/pages/your-bots"));
const BotDetail = lazy(() => import("@/pages/bot-detail"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Moderation = lazy(() => import("@/pages/moderation"));
const Notifications = lazy(() => import("@/pages/notifications"));

function AppRouter() {
  const { user } = useAuth();
  
  return (
    <Router>
      <Suspense fallback={<LoadingPage />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/advertise" component={Advertise} />
          <Route path="/advertise-server" component={AddServer} />
          <Route path="/add-bot" component={AddBot} />
          <Route path="/add-server" component={AddServer} />
          <Route path="/add-event" component={AddEvent} />
          <Route path="/add-partnership" component={AddPartnership} />
          <Route path="/add-template" component={AddTemplate} />
          <Route path="/your-servers" component={YourServers} />
          <Route path="/events" component={Events} />
          <Route path="/explore" component={Explore} />
          <Route path="/join-members" component={JoinMembers} />
          <Route path="/store" component={Store} />
          <Route path="/quest" component={Quest} />
          <Route path="/partnership" component={Partnership} />
          <Route path="/server-templates" component={ServerTemplates} />
          <Route path="/jobs" component={Jobs} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/server/:id" component={ServerDetail} />
          <Route path="/help" component={Help} />
          <Route path="/help-center" component={HelpCenter} />
          <Route path="/support-ticket" component={SupportTicket} />
          <Route path="/contact-us" component={ContactUs} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/about-us" component={AboutUs} />
          <Route path="/fair-use-policy" component={FairUsePolicy} />
          <Route path="/blog" component={Blog} />
          <Route path="/trade" component={Trade} />
          <Route path="/payment/:type" component={Payment} />
          <Route path="/payment/success" component={PaymentSuccess} />
          <Route path="/your-bots" component={YourBots} />
          <Route path="/bot/:id" component={BotDetail} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/moderation" component={Moderation} />
          <Route path="/notifications" component={Notifications} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Router>
  );
}

function App() {
  const { isOnline, isLoading } = useAppState();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NavigationProvider>
          <Toaster />
          <>
              <AppRouter />
              {isLoading && <LoadingPage />}
            </>
          )}
        </NavigationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
