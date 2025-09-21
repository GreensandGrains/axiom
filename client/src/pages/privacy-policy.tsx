
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import backgroundImage from "@assets/generated_images/b82f28a7e9c8fcb3868d3d94652c107c.gif"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
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
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                How we collect, use, and protect your information
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm">
              <h4 className="text-blue-500">Discord Account Information</h4>
              <p className="text-muted-foreground">When you log in with Discord, we collect:</p>
              <ul className="text-muted-foreground">
                <li>Discord user ID, username, and discriminator</li>
                <li>Avatar image URL</li>
                <li>Email address (if provided)</li>
                <li>Guild (server) information for servers you have admin access to</li>
              </ul>
              
              <h4 className="text-green-500">Usage Information</h4>
              <ul className="text-muted-foreground">
                <li>Pages visited and features used</li>
                <li>Server and bot listings you create</li>
                <li>Comments, reviews, and votes</li>
                <li>Quest progress and coin earnings</li>
              </ul>

              <h4 className="text-purple-500">Technical Information</h4>
              <ul className="text-muted-foreground">
                <li>IP address and browser information</li>
                <li>Device type and operating system</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm">
              <p className="text-muted-foreground">We use the collected information to:</p>
              <ul className="text-muted-foreground">
                <li>Provide and maintain our service</li>
                <li>Authenticate your account and verify server ownership</li>
                <li>Enable features like server bumping and advertising</li>
                <li>Process payments and manage virtual currency</li>
                <li>Send important service notifications</li>
                <li>Improve our platform and develop new features</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm">
              <p className="text-muted-foreground">We do not sell your personal information. We may share information in the following circumstances:</p>
              
              <h4 className="text-orange-500">Public Information</h4>
              <ul className="text-muted-foreground">
                <li>Server and bot listings you create are publicly visible</li>
                <li>Comments and reviews you post are publicly visible</li>
                <li>Your username and avatar may be displayed with your content</li>
              </ul>

              <h4 className="text-cyan-500">Service Providers</h4>
              <p className="text-muted-foreground">We may share information with trusted third-party service providers who help us operate our platform, such as:</p>
              <ul className="text-muted-foreground">
                <li>Cloud hosting and database services</li>
                <li>Payment processing services</li>
                <li>Analytics and monitoring tools</li>
              </ul>

              <h4 className="text-red-500">Legal Requirements</h4>
              <p className="text-muted-foreground">We may disclose information if required by law or to protect our rights and users' safety.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Discord Integration</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm">
              <p className="text-muted-foreground">Our integration with Discord involves:</p>
              <ul className="text-muted-foreground">
                <li>Using Discord OAuth for authentication</li>
                <li>Accessing your Discord guilds to verify server ownership</li>
                <li>Our bot joining your servers for verification and features</li>
                <li>Tracking invite usage for reward systems</li>
              </ul>
              <p className="text-muted-foreground">
                We only access information permitted by Discord's API and your authorization. 
                Please also review Discord's Privacy Policy as their terms apply to your Discord account.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm">
              <p className="text-muted-foreground">We use cookies and similar technologies to:</p>
              <ul className="text-muted-foreground">
                <li>Keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Analyze platform usage</li>
                <li>Improve user experience</li>
              </ul>
              <p className="text-muted-foreground">
                You can control cookie settings through your browser, but some features may not work properly if cookies are disabled.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm">
              <p className="text-muted-foreground">We implement appropriate security measures to protect your information, including:</p>
              <ul className="text-muted-foreground">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure payment processing</li>
              </ul>
              <p className="text-muted-foreground">
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm">
              <p className="text-muted-foreground">We retain your information for as long as necessary to:</p>
              <ul className="text-muted-foreground">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain platform security and prevent fraud</li>
              </ul>
              <p className="text-muted-foreground">
                You may request deletion of your account and associated data by contacting our support team.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm">
              <p className="text-muted-foreground">Depending on your location, you may have the following rights:</p>
              <ul className="text-muted-foreground">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your information</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
              </ul>
              <p className="text-muted-foreground">
                To exercise these rights, please contact us through our support channels.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm">
              <p className="text-muted-foreground">
                Our service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you are a parent or guardian and believe 
                your child has provided us with personal information, please contact us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-indigo-500">10. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm">
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date. 
                Your continued use of our service after changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-teal-500">11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm">
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="text-muted-foreground">
                <li>Through our Discord support server</li>
                <li>Via the contact form in our Help Center</li>
                <li>By sending us a direct message through our platform</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
