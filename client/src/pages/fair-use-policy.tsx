import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import backgroundImage from "@assets/generated_images/b7f788e000ffb2854a98d937b8a46593.gif"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";

export default function FairUsePolicy() {
  usePageTitle("Fair Use Policy");

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
                <Scale className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                Fair Use Policy
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Guidelines for responsible and fair usage of our services and resources
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white ">
        <div className="space-y-8 text-white">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <p>
                This Fair Use Policy outlines the acceptable use of Axiom's services, including our
                Discord server advertising platform, community features, and related services. This policy
                is designed to ensure that all users can enjoy our services fairly and without disruption.
              </p>
              <p>
                By using Axiom's services, you agree to comply with this Fair Use Policy in addition to
                our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Acceptable Use
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <h4 className="text-green-500">Server Advertising</h4>
              <ul>
                <li>Advertise legitimate Discord servers that comply with Discord's Terms of Service</li>
                <li>Provide accurate and truthful information about your server</li>
                <li>Use appropriate categories and tags for your server listings</li>
                <li>Maintain active and engaging communities</li>
                <li>Respond to user inquiries and feedback in a timely manner</li>
              </ul>

              <h4 className="text-green-500">Community Interaction</h4>
              <ul>
                <li>Engage respectfully with other users and communities</li>
                <li>Provide constructive feedback and reviews</li>
                <li>Use voting and rating systems honestly</li>
                <li>Report inappropriate content or behavior</li>
                <li>Respect intellectual property rights</li>
              </ul>

              <h4 className="text-green-500">Platform Features</h4>
              <ul>
                <li>Use quest and reward systems as intended</li>
                <li>Participate in events and activities legitimately</li>
                <li>Share and create content that adds value to the community</li>
                <li>Use search and discovery features appropriately</li>
              </ul>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <h4 className="text-red-500">Spam and Abuse</h4>
              <ul>
                <li>Creating multiple accounts to circumvent restrictions or gain unfair advantages</li>
                <li>Repeatedly posting the same server or content across multiple categories</li>
                <li>Using automated tools or bots to manipulate votes, views, or rankings</li>
                <li>Sending unsolicited messages or advertisements to other users</li>
                <li>Flooding our platform with excessive content submissions</li>
              </ul>

              <h4 className="text-red-500">Fraudulent Content</h4>
              <ul>
                <li>Advertising servers that don't exist or are permanently inaccessible</li>
                <li>Misrepresenting server content, member count, or activities</li>
                <li>Using misleading titles, descriptions, or images</li>
                <li>Impersonating other servers, brands, or individuals</li>
                <li>Creating fake reviews or manipulating rating systems</li>
              </ul>

              <h4 className="text-red-500">Harmful Activities</h4>
              <ul>
                <li>Advertising servers that promote illegal activities</li>
                <li>Sharing malicious links, viruses, or harmful software</li>
                <li>Attempting to hack, exploit, or damage our platform</li>
                <li>Harassing, threatening, or intimidating other users</li>
                <li>Violating Discord's Terms of Service or Community Guidelines</li>
              </ul>

              <h4 className="text-red-500">Resource Abuse</h4>
              <ul>
                <li>Excessive use of our API or services that impacts performance</li>
                <li>Attempting to scrape or download large amounts of data</li>
                <li>Using our platform to redirect traffic for unrelated purposes</li>
                <li>Overloading our servers with automated requests</li>
              </ul>
            </CardContent>
          </Card>

          {/* Resource Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-500">Resource Limits and Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <h4 className="text-yellow-500">Server Listings</h4>
              <ul>
                <li>Maximum of 3 active server listings per user account</li>
                <li>Server bumping limited to once every 6 hours per server</li>
                <li>Maximum of 10 images per server listing</li>
                <li>Description length limited to 2000 characters</li>
              </ul>

              <h4 className="text-yellow-500">API Usage</h4>
              <ul>
                <li>API requests limited to 1000 per hour per user</li>
                <li>Bulk operations limited to 100 items per request</li>
                <li>File uploads limited to 10MB per file</li>
              </ul>

              <h4 className="text-yellow-500">Community Features</h4>
              <ul>
                <li>Maximum of 50 comments or reviews per day</li>
                <li>Event submissions limited to 5 per month per user</li>
                <li>Partnership applications limited to 3 per month</li>
              </ul>
            </CardContent>
          </Card>

          {/* Monitoring and Enforcement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-500">Monitoring and Enforcement</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm text-white">
              <h4 className="text-blue-500">Monitoring</h4>
              <p>
                We actively monitor our platform for violations of this Fair Use Policy through:
              </p>
              <ul>
                <li>Automated systems that detect unusual activity patterns</li>
                <li>Community reporting and moderation</li>
                <li>Regular reviews of high-traffic content and users</li>
                <li>Analysis of user behavior and resource usage</li>
              </ul>

              <h4 className="text-blue-500">Enforcement Actions</h4>
              <p>
                Violations of this policy may result in the following actions:
              </p>
              <ul>
                <li ><strong className="text-red-500">Warning:</strong> First-time minor violations may receive a warning</li>
                <li ><strong className="text-red-500">Content Removal:</strong> Violating content will be removed from our platform</li>
                <li><strong className="text-red-500">Temporary Suspension:</strong> Account access may be temporarily restricted</li>
                <li ><strong className="text-red-500">Permanent Ban:</strong> Severe or repeated violations may result in permanent account termination</li>
                <li ><strong className="text-red-500">Legal Action:</strong> Illegal activities may be reported to appropriate authorities</li>
              </ul>
            </CardContent>
          </Card>

          {/* Reporting Violations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Reporting Violations</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <p>
                If you encounter content or behavior that violates this Fair Use Policy, please report it through:
              </p>
              <ul>
                <li>The report button available on all content pages</li>
                <li>Our Discord support server</li>
                <li>The contact form in our Help Center</li>
                <li>Direct message to our moderation team</li>
              </ul>
              <p>
                When reporting, please provide:
              </p>
              <ul>
                <li>Specific details about the violation</li>
                <li>Links or screenshots as evidence</li>
                <li>The username or server involved</li>
                <li>Any additional context that may be helpful</li>
              </ul>
            </CardContent>
          </Card>

          {/* Appeals Process */}
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-500">Appeals Process</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm text-white">
              <p>
                If you believe your account or content was unfairly penalized, you may appeal the decision:
              </p>
              <ul>
                <li>Submit an appeal through our support ticket system</li>
                <li>Provide a detailed explanation of why you believe the action was incorrect</li>
                <li>Include any evidence that supports your appeal</li>
                <li>Appeals will be reviewed within 7 business days</li>
              </ul>
              <p>
                Please note that repeated appeals for the same violation may not be considered.
              </p>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm text-white">
              <p>
                We may update this Fair Use Policy from time to time to reflect changes in our services,
                legal requirements, or community needs. When we make changes:
              </p>
              <ul>
                <li>We will update the "Last updated" date at the top of this page</li>
                <li>Significant changes will be announced through our platform</li>
                <li>Users will be notified via email or in-app notifications</li>
                <li>Continued use of our services constitutes acceptance of the updated policy</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <p>
                If you have questions about this Fair Use Policy or need clarification on any aspect,
                please contact us:
              </p>
              <ul>
                <li>Through our Discord support server</li>
                <li>Via the contact form in our Help Center</li>
                <li>By submitting a support ticket</li>
                <li>Through our community forums</li>
              </ul>
              <p>
                We're committed to maintaining a fair and enjoyable platform for all users.
              </p>
            </CardContent>
          </Card>

          {/* Bot Review Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-500">
                <Scale className="w-5 h-5 mr-2 text-blue-500" />
                Bot Review Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-white text-sm">
              <p>
                Discord bots submitted to Axiom undergo a thorough review process (up to 2 days) to ensure quality and safety:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Uptime Requirement:</strong> Bot must be online and responsive 24/7</li>
                <li><strong>No Self-Bots:</strong> Automated user accounts are strictly prohibited</li>
                <li><strong>Functional Commands:</strong> All advertised commands must work properly</li>
                <li><strong>Appropriate Content:</strong> Bot responses must be family-friendly</li>
                <li><strong>No Token Logging:</strong> Bots must not log or steal user tokens</li>
                <li><strong>Privacy Compliance:</strong> Must follow Discord's Terms of Service</li>
                <li><strong>Accurate Information:</strong> Bot description and features must be truthful</li>
                <li><strong>No Malicious Code:</strong> Bots must not contain harmful or destructive code</li>
              </ul>
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mt-4">
                <p className="text-blue-200">
                  <strong className="text-red-500">Review Process:</strong> Our team checks bot functionality, uptime, and compliance.
                  Approved bots are made available immediately. Declined submissions receive detailed feedback for improvement.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}