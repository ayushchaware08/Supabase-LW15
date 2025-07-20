import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Palette, Users, Zap, Download } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Scribble Canvas
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create, collaborate, and share your drawings in real-time with friends and colleagues
          </p>
          
          <div className="flex gap-4 justify-center">
            {user ? (
              <Link to="/canvas">
                <Button size="lg" className="text-lg px-8">
                  Start Drawing
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Palette className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Drawing Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Brush, eraser, shapes, and color picker with adjustable sizes
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Real-time Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Draw together with multiple users simultaneously
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Instant Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                See changes instantly across all connected devices
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Download className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Export & Save</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Export drawings as PNG or save to cloud for later
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start creating?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of artists and designers using Scribble Canvas
          </p>
          {!user && (
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign Up Free
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
