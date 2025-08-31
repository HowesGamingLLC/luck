import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, TrendingUp } from "lucide-react";

interface OrderRow {
  id: string;
  user_id: string;
  package_id: string;
  quantity: number;
  amount_cents: number;
  gc_awarded: number;
  sc_bonus: number;
  payment_id?: string;
  status: string;
  created_at?: string;
}

interface StatsResp {
  success: boolean;
  perPackage: { id: string; name: string; count: number; grossCents: number }[];
  totalSalesCents: number;
  totalOrders: number;
}

export default function AdminSales() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [stats, setStats] = useState<StatsResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sRes, oRes] = await Promise.all([
          fetch("/api/payments/stats"),
          fetch("/api/payments/orders?limit=100"),
        ]);
        const sJson = await sRes.json();
        const oJson = await oRes.json();
        if (!sRes.ok || !sJson?.success)
          throw new Error(sJson?.error || "Failed to load stats");
        if (!oRes.ok || !oJson?.success)
          throw new Error(oJson?.error || "Failed to load orders");
        setStats(sJson as StatsResp);
        setOrders(oJson.orders || []);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const currency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text">
            Sales Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time package sales and revenue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" /> Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats ? currency(stats.totalSalesCents) : "—"}
              </div>
              <CardDescription>From package sales</CardDescription>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" /> Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalOrders ?? "—"}
              </div>
              <CardDescription>All-time</CardDescription>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" /> Packages Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.perPackage.length ?? "—"}
              </div>
              <CardDescription>From catalog</CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="glass mb-8">
          <CardHeader>
            <CardTitle>Sales by Package</CardTitle>
            <CardDescription>
              Counts and gross revenue per package
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stats?.perPackage || []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right">
                        {currency(row.grossCents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 100 orders</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-sm text-destructive mb-2">{error}</div>
            )}
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>GC/SC</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <div className="text-sm">{o.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {o.user_id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{o.package_id}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            {o.gc_awarded.toLocaleString()} GC
                          </div>
                          <div className="text-xs">+{o.sc_bonus} SC</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              o.status === "COMPLETED"
                                ? "bg-green-600"
                                : "bg-muted"
                            }
                          >
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {currency(o.amount_cents)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!orders.length && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-sm text-muted-foreground"
                        >
                          No orders yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
