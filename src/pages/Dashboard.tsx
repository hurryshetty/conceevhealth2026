import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Users, CalendarCheck, ListTodo, CreditCard, LogOut } from "lucide-react";

interface Stats {
  leads: number;
  appointments: number;
  tasks: number;
  transactions: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ leads: 0, appointments: 0, tasks: 0, transactions: 0 });
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setUserName(user.user_metadata?.name || user.email || "User");

      const [leads, appointments, tasks, transactions] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id", { count: "exact", head: true }),
        supabase.from("tasks").select("id", { count: "exact", head: true }),
        supabase.from("wallet_transactions").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        leads: leads.count || 0,
        appointments: appointments.count || 0,
        tasks: tasks.count || 0,
        transactions: transactions.count || 0,
      });
    }
    loadData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const statCards = [
    { title: "Total Leads", value: stats.leads, icon: Users, color: "text-blue-600" },
    { title: "Appointments", value: stats.appointments, icon: CalendarCheck, color: "text-green-600" },
    { title: "Tasks", value: stats.tasks, icon: ListTodo, color: "text-purple-600" },
    { title: "Transactions", value: stats.transactions, icon: CreditCard, color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="font-serif text-xl font-bold text-navy">Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Hello, {userName}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <h1 className="text-3xl font-bold font-serif mb-8">Overview</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline">Add New Lead</Button>
            <Button variant="outline">Schedule Appointment</Button>
            <Button variant="outline">Create Task</Button>
            <Button variant="outline">View Reports</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
