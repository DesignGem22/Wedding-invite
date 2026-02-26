import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

// =============================
// SUPABASE CONFIG
// =============================
const supabaseUrl = "https://YOUR_PROJECT_ID.supabase.co";
const supabaseAnonKey = "YOUR_PUBLIC_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const WEDDING_DATE = new Date("2026-08-22T00:00:00");

export default function WeddingWebsite() {
  const [page, setPage] = useState("home");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [timeLeft, setTimeLeft] = useState({});
  const [session, setSession] = useState(null);
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState({ bride: 0, groom: 0 });

  // =============================
  // COUNTDOWN
  // =============================
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = WEDDING_DATE - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // =============================
  // SUPABASE AUTH (JWT SECURE)
  // =============================
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const loginAdmin = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
  };

  const logoutAdmin = async () => {
    await supabase.auth.signOut();
    setGuests([]);
  };

  // =============================
  // RSVP
  // =============================
  const handleSubmit = async (side) => {
    if (!form.name) return alert("Name required");

    await supabase.from("guests").insert([
      { ...form, family_side: side },
    ]);

    alert("RSVP Submitted 💜");
    setForm({ name: "", email: "", phone: "" });
  };

  // =============================
  // FETCH GUESTS + STATS
  // =============================
  const loadGuests = async () => {
    const { data } = await supabase.from("guests").select("*");
    setGuests(data || []);

    const brideCount = data?.filter((g) => g.family_side === "bride").length || 0;
    const groomCount = data?.filter((g) => g.family_side === "groom").length || 0;

    setStats({ bride: brideCount, groom: groomCount });
  };

  // =============================
  // CSV EXPORT
  // =============================
  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Family Side"];
    const rows = guests.map((g) => [g.name, g.email, g.phone, g.family_side]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Wedding_Guest_List.csv");
    document.body.appendChild(link);
    link.click();
  };

  const Navigation = () => (
    <div className="flex flex-wrap gap-3 justify-center py-4">
      {["home", "register", "invitation", "admin"].map((p) => (
        <Button key={p} onClick={() => setPage(p)} className="bg-purple-700 text-white">
          {p.toUpperCase()}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-300 to-purple-500 p-4">
      <Navigation />

      {/* HOME */}
      {page === "home" && (
        <Card className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl">
          <CardContent className="p-6 text-center">
            <h1 className="text-3xl font-bold text-purple-800">Adunni 💜 Ola</h1>
            <p className="mb-4">August 22nd, 2026</p>
            <div className="grid grid-cols-2 gap-3 font-semibold text-purple-700">
              <div>{timeLeft.days} Days</div>
              <div>{timeLeft.hours} Hours</div>
              <div>{timeLeft.minutes} Minutes</div>
              <div>{timeLeft.seconds} Seconds</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RSVP */}
      {page === "register" && (
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {["bride", "groom"].map((side) => (
            <Card key={side} className="bg-white rounded-2xl shadow-lg">
              <CardContent className="p-4 space-y-3">
                <h2 className="text-xl font-bold text-purple-700 capitalize">
                  {side} Family RSVP
                </h2>
                <Input placeholder="Full Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input placeholder="Phone" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Button onClick={() => handleSubmit(side)} className="bg-purple-700 text-white w-full">
                  Submit RSVP
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* INVITATION DESIGN */}
      {page === "invitation" && (
        <Card className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl">
          <CardContent className="p-8 text-center bg-gradient-to-br from-purple-100 to-purple-300 rounded-2xl">
            <h2 className="text-2xl font-bold text-purple-800 mb-2">Wedding Invitation</h2>
            <p className="text-lg font-semibold text-purple-900">Adunni & Ola</p>
            <p className="mt-2">Request the pleasure of your presence</p>
            <p className="mt-4 font-bold">August 22nd, 2026</p>
            <p>Lilac & Purple Theme</p>
            <Button
              className="mt-6 bg-purple-800 text-white"
              onClick={() => window.print()}
            >
              Download / Save as PDF
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ADMIN */}
      {page === "admin" && (
        <Card className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl">
          <CardContent className="p-6">
            {!session ? (
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-purple-800">Secure Admin Login</h2>
                <Input placeholder="Admin Email" id="adminEmail" />
                <Input type="password" placeholder="Password" id="adminPassword" />
                <Button
                  className="bg-purple-800 text-white w-full"
                  onClick={() =>
                    loginAdmin(
                      document.getElementById("adminEmail").value,
                      document.getElementById("adminPassword").value
                    )
                  }
                >
                  Login
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-purple-800">Admin Dashboard</h2>
                  <Button onClick={logoutAdmin} className="bg-red-500 text-white">Logout</Button>
                </div>

                <Button onClick={loadGuests} className="bg-purple-700 text-white mb-3">
                  Load Guests
                </Button>

                <div className="flex gap-6 mb-4 font-semibold text-purple-700">
                  <div>Bride Guests: {stats.bride}</div>
                  <div>Groom Guests: {stats.groom}</div>
                </div>

                <Button onClick={exportCSV} className="bg-green-600 text-white mb-4">
                  Export CSV
                </Button>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-purple-200">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Side</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((g, i) => (
                        <tr key={i} className="border-b">
                          <td>{g.name}</td>
                          <td>{g.email}</td>
                          <td>{g.phone}</td>
                          <td>{g.family_side}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/*
IMPORTANT SETUP STEPS

1. In Supabase:
   - Enable Email Auth
   - Create an Admin user (Authentication → Users → Add User)
   - Enable Row Level Security on guests table
   - Create policy: Allow SELECT only for authenticated users

2. Install dependency:
   npm install @supabase/supabase-js

3. Replace YOUR_PROJECT_ID and YOUR_PUBLIC_ANON_KEY
*/
