import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

// Service-role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware: verify JWT and check admin role
  const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split("Bearer ")[1];
    try {
      // Verify the JWT using Supabase admin
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) return res.status(401).json({ error: "Unauthorized" });

      // Check role in profiles table
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("uid", user.id)
        .maybeSingle();

      if (!profile || !["admin", "super_admin"].includes(profile.role)) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      (req as any).user = user;
      next();
    } catch (error) {
      console.error("Error verifying admin:", error);
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  // Create user
  app.post("/api/admin/users", verifyAdmin, async (req, res) => {
    const { email, password, fullName, role, department, phoneNumber, status, studentId, whatsapp, mustChangePassword, temporaryPassword } = req.body;

    try {
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });

      if (createError) throw createError;
      const uid = authData.user.id;

      const profileData: any = {
        uid,
        email,
        full_name: fullName,
        role: role || "student",
        department: department || "Informatique",
        phone_number: phoneNumber || "",
        status: status || "active",
        active: (status || "active") === "active",
        must_change_password: mustChangePassword || false,
        temporary_password: temporaryPassword || false,
        whatsapp: whatsapp || ""
      };

      if (role === "student" && studentId) {
        profileData.student_id = studentId;
      }

      const { error: profileError } = await supabaseAdmin.from("profiles").insert(profileData);
      if (profileError) throw profileError;

      res.status(201).json({ uid, ...profileData });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Update user
  app.put("/api/admin/users/:uid", verifyAdmin, async (req, res) => {
    const { uid } = req.params;
    const { email, fullName, role, department, phoneNumber, status, studentId } = req.body;

    try {
      const authUpdate: any = { user_metadata: { full_name: fullName } };
      if (email) authUpdate.email = email;

      await supabaseAdmin.auth.admin.updateUserById(uid, authUpdate);

      const profileUpdate: any = {
        full_name: fullName,
        role,
        department,
        phone_number: phoneNumber || "",
        status: status || "active",
        active: (status || "active") === "active",
        updated_at: new Date().toISOString()
      };
      if (email) profileUpdate.email = email;
      if (studentId) profileUpdate.student_id = studentId;

      const { error } = await supabaseAdmin.from("profiles").update(profileUpdate).eq("uid", uid);
      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete user
  app.delete("/api/admin/users/:uid", verifyAdmin, async (req, res) => {
    const { uid } = req.params;
    try {
      await supabaseAdmin.from("profiles").delete().eq("uid", uid);
      const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Reset password
  app.post("/api/admin/users/:uid/reset-password", verifyAdmin, async (req, res) => {
    const { uid } = req.params;
    const { newPassword } = req.body;

    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(uid, { password: newPassword });
      if (error) throw error;

      await supabaseAdmin.from("profiles").update({
        must_change_password: true,
        updated_at: new Date().toISOString()
      }).eq("uid", uid);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
