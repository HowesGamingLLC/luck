import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Copy,
  ExternalLink,
  Code,
  Zap,
  Globe,
  Sparkles,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function FreeSlotsDocs() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [apiStats, setApiStats] = useState<any>(null);

  useEffect(() => {
    fetchApiStats();
  }, []);

  const fetchApiStats = async () => {
    try {
      const response = await fetch("/api/public/docs");
      const data = await response.json();
      setApiStats(data);
    } catch (error) {
      console.error("Failed to fetch API stats:", error);
    }
  };

  const copyToClipboard = async (text: string, endpoint: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(endpoint);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const baseUrl = window.location.origin;

  const endpoints = [
    {
      name: "Get Free Providers",
      method: "GET",
      url: `${baseUrl}/api/public/providers`,
      description: "Get list of available free slot providers",
      example: `${baseUrl}/api/public/providers`,
    },
    {
      name: "Get Free Games",
      method: "GET",
      url: `${baseUrl}/api/public/games`,
      description: "Get list of free slot games with filtering options",
      example: `${baseUrl}/api/public/games?search=book&limit=5`,
    },
    {
      name: "Get Game Details",
      method: "GET",
      url: `${baseUrl}/api/public/games/:providerId/:gameId`,
      description: "Get detailed information about a specific game",
      example: `${baseUrl}/api/public/games/freeslotsgames/book-of-ra`,
    },
    {
      name: "Get Embed Code",
      method: "GET",
      url: `${baseUrl}/api/public/embed/:providerId/:gameId`,
      description: "Get iframe embed code for a game",
      example: `${baseUrl}/api/public/embed/freeslotsgames/book-of-ra?width=800&height=600`,
    },
  ];

  const embedExample = `<!-- CoinKrazy.com Free Slot Game Embed -->
<div style="position: relative; width: 800px; height: 600px; max-width: 100%;">
    <iframe 
        src="https://free-slots.games/game/book-of-ra?mode=free&embed=1" 
        width="100%" 
        height="100%" 
        frameborder="0" 
        scrolling="no"
        allowfullscreen
        style="border: 1px solid #ddd; border-radius: 8px;">
        Your browser does not support iframes.
    </iframe>
    <div style="font-size: 12px; text-align: right; margin-top: 4px;">
        <a href="https://cointrazy.com" target="_blank" style="color: #666; text-decoration: none;">
            Powered by CoinKrazy.com
        </a>
    </div>
</div>
<!-- End Embed Code -->`;

  const jsExample = `// Fetch free slot games
fetch('${baseUrl}/api/public/games?limit=10')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Free games:', data.games);
      data.games.forEach(game => {
        console.log(\`\${game.name} - \${game.description}\`);
      });
    }
  })
  .catch(error => console.error('Error:', error));

// Get embed code for a specific game
fetch('${baseUrl}/api/public/embed/freeslotsgames/book-of-ra?width=600&height=400')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Insert embed code into your website
      document.getElementById('slot-container').innerHTML = data.embedCode;
    }
  });`;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/games/slots">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Slots
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">
              Free Slots & Public API
            </h1>
            <p className="text-muted-foreground">
              Access free slot games via our public API and iframe integration
            </p>
          </div>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-success" />
              <h3 className="font-semibold mb-2">100% Free</h3>
              <p className="text-sm text-muted-foreground">
                No cost, no registration, no API keys required
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <Globe className="h-8 w-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-semibold mb-2">Public API</h3>
              <p className="text-sm text-muted-foreground">
                RESTful API for external websites and applications
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <Code className="h-8 w-8 mx-auto mb-3 text-purple" />
              <h3 className="font-semibold mb-2">Easy Integration</h3>
              <p className="text-sm text-muted-foreground">
                Simple iframe embedding with responsive design
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api">API Endpoints</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gold" />
                  What's Available
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-success">
                      ✅ Free Features
                    </h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>13+ high-quality slot games</li>
                      <li>Multiple providers (Free-Slots.Games, iDev.Games)</li>
                      <li>Responsive iframe embedding</li>
                      <li>RESTful JSON API</li>
                      <li>Game thumbnails and metadata</li>
                      <li>No registration required</li>
                      <li>Rate limited to 100 requests/hour</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-warning">
                      ⚠️ Limitations
                    </h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Free games only (no real money)</li>
                      <li>Attribution required</li>
                      <li>Non-commercial use only</li>
                      <li>Rate limits apply</li>
                      <li>No advanced features</li>
                      <li>Limited customization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>License:</strong> Free for non-commercial use.
                Attribution to "Powered by CoinKrazy.com" is required. For
                commercial licensing, please contact us.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* API Endpoints Tab */}
          <TabsContent value="api" className="space-y-6">
            {apiStats && (
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rate Limit:</strong> {apiStats.rateLimit.limit}{" "}
                  requests per {apiStats.rateLimit.window}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <Card key={index} className="glass">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                      <Badge variant="outline">{endpoint.method}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {endpoint.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Endpoint URL:
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                          {endpoint.url}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(endpoint.url, endpoint.name)
                          }
                        >
                          {copiedEndpoint === endpoint.name ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Example:
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                          {endpoint.example}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(endpoint.example, "_blank")
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Embed Code Tab */}
          <TabsContent value="embed" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>iframe Embed Code</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Copy and paste this HTML code into your website to embed a
                  free slot game
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(embedExample, "embed")}
                    >
                      {copiedEndpoint === "embed" ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copy Embed Code
                    </Button>
                  </div>

                  <pre className="p-4 bg-muted rounded-lg text-sm font-mono overflow-x-auto">
                    <code>{embedExample}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Code className="h-4 w-4" />
              <AlertDescription>
                <strong>Customization:</strong> You can adjust the width and
                height parameters in the API call to customize the embed size.
                The iframe will automatically be responsive within the
                container.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>JavaScript Integration Example</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Use our API with JavaScript to dynamically load and embed slot
                  games
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(jsExample, "javascript")}
                    >
                      {copiedEndpoint === "javascript" ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copy JavaScript Code
                    </Button>
                  </div>

                  <pre className="p-4 bg-muted rounded-lg text-sm font-mono overflow-x-auto">
                    <code>{jsExample}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Live API Test</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Test our API endpoints directly from this page
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() =>
                    window.open(`${baseUrl}/api/public/games?limit=5`, "_blank")
                  }
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test: Get 5 Free Games
                </Button>

                <Button
                  onClick={() =>
                    window.open(`${baseUrl}/api/public/providers`, "_blank")
                  }
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test: Get Providers
                </Button>

                <Button
                  onClick={() =>
                    window.open(
                      `${baseUrl}/api/public/games/freeslotsgames/book-of-ra`,
                      "_blank",
                    )
                  }
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test: Get Game Details
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="glass mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Need More?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Looking for premium slot games, real money integration, or
              commercial licensing?
            </p>
            <div className="flex gap-2 justify-center">
              <Link to="/games/slots">
                <Button>View All Slots</Button>
              </Link>
              <Link to="/help">
                <Button variant="outline">Contact Support</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
