
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import backgroundImage from "@assets/generated_images/745cc90fcc688569610f84bc5d2b2fd6.gif"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 w-full h-full z-0">
          <img
            src={backgroundImage}
            alt="Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="inline-block p-3 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                Terms of Service
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Legal terms and conditions for using our platform
              </p>
            </div>
            <div className="mt-6">
              <div className="inline-block bg-card border border-border rounded-xl px-6 py-3">
                <p className="text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <p>
                By accessing and using Smart Serve ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-500">2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <p>
                Smart Serve is a Discord directory platform that allows users to discover and list Discord servers and bots. 
                The service includes features such as server listings, bot directory, community events, and advertising tools.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-500">3. User Accounts and Registration</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm text-white">
              <ul>
                <li>You must provide accurate and complete registration information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must be at least 13 years old to use this service</li>
                <li>One account per person is allowed</li>
                <li>You agree to notify us immediately of any unauthorized use of your account</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-500">4. User Content and Conduct</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm text-white">
              <p>You agree not to:</p>
              <ul>
                <li>Post content that is illegal, harmful, threatening, abusive, or discriminatory</li>
                <li>Impersonate any person or entity</li>
                <li>Spam or flood the platform with unwanted content</li>
                <li>Share or promote servers that violate Discord's Terms of Service</li>
                <li>Use automated tools to manipulate votes or rankings</li>
                <li>Attempt to gain unauthorized access to the service</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-500">5. Discord Integration</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm text-white">
              <p>
                Our service integrates with Discord through official APIs. By using our Discord features, you acknowledge that:
              </p>
              <ul>
                <li>You must comply with Discord's Terms of Service</li>
                <li>We may access limited Discord data as permitted by their API</li>
                <li>Server verification requires our bot to be present in your Discord server</li>
                <li>We are not responsible for Discord service outages or changes to their platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-500">6. Virtual Currency and Purchases</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm text-white">
              <p>
                Smart Serve uses a virtual currency system ("coins") for certain features:
              </p>
              <ul>
                <li>Coins have no real-world monetary value</li>
                <li>Coins cannot be exchanged for real money</li>
                <li>We reserve the right to adjust coin values and earning rates</li>
                <li>Fraudulent activity may result in coin balance adjustment or account termination</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">7. Privacy and Data Collection</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                use, and protect your information. By using our service, you consent to the collection and use 
                of information in accordance with our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-500">8. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <p>
                The Smart Serve platform, including its design, features, and content, is owned by us and protected by copyright 
                and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <p>
                Smart Serve is provided "as is" without any warranties. We are not liable for any damages arising from 
                your use of the service, including but not limited to direct, indirect, incidental, or consequential damages.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-500">10. Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <p>
                We reserve the right to terminate or suspend your account at any time for violation of these terms. 
                You may also terminate your account at any time by contacting our support team.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-500">11. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
                Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <p>
                If you have any questions about these Terms of Service, please contact us through our Discord support server 
                or use the contact form in our Help Center.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
