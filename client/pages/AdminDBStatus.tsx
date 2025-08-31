import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DbStatus {
  hasSupabaseServerConfig: boolean;
  tables?: Record<string, { count: number; error: string | null }>;
  error?: string | null;
}

export default function AdminDBStatus() {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/status/db");
        const data = await res.json();
        setStatus(data);
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    };
    load();
  }, []);

  return (
    <div className="container py-8 space-y-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Database Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {status && (
            <div className="space-y-3">
              <div className="text-sm">
                Supabase configured:{" "}
                {status.hasSupabaseServerConfig ? "Yes" : "No"}
              </div>
              {status.tables && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(status.tables).map(([name, t]) => (
                    <Card key={name}>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">
                          {name}
                        </div>
                        <div className="text-xl font-bold">{t.count}</div>
                        {t.error && (
                          <div className="text-xs text-red-500 mt-1">
                            {t.error}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {status.error && (
                <Alert variant="destructive">
                  <AlertDescription>{status.error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
