import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  comingSoonFeatures?: string[];
}

export function PlaceholderPage({ 
  title, 
  description, 
  icon: Icon = Construction,
  comingSoonFeatures = []
}: PlaceholderPageProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12">
      <div className="container max-w-2xl">
        <Card className="glass">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-purple to-purple-dark rounded-full">
              <Icon className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-display font-bold gradient-text">
              {title}
            </CardTitle>
            <CardDescription className="text-lg mt-4">
              {description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {comingSoonFeatures.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-center">Coming Soon:</h3>
                <ul className="space-y-2">
                  {comingSoonFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple to-teal rounded-full" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                This feature is currently under development. Check back soon for updates!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="btn-primary">
                  <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/games">
                    Try Our Games
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
