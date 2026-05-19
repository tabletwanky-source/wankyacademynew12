import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import fs from "fs";

// Initialize Firebase Admin
// We try to read from the environment or the config file
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig = {};
if (fs.existsSync(firebaseConfigPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
}

if (!admin.apps.length) {
  // In AI Studio environment, we can usually just use default auth if running in GC
  // But for better compatibility we can try to use the project ID from config
  admin.initializeApp({
    projectId: (firebaseConfig as any).projectId,
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to verify admin token
  const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();

      if (userData?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      (req as any).user = decodedToken;
      next();
    } catch (error) {
      console.error("Error verifying admin:", error);
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  // User Management API
  app.post("/api/admin/users", verifyAdmin, async (req, res) => {
    const { email, password, fullName, role, department, phoneNumber, status, studentId } = req.body;

    try {
      // 1. Create Auth User
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: fullName,
        phoneNumber: phoneNumber || undefined,
      });

      // 2. Create Firestore Profile
      const userData: any = {
        uid: userRecord.uid,
        email,
        fullName,
        role,
        department,
        phoneNumber: phoneNumber || "",
        status: status || "active",
        active: status === "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (role === 'student' && studentId) {
        userData.studentId = studentId;
      }

      await db.collection("users").doc(userRecord.uid).set(userData);

      res.status(201).json(userData);
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/admin/users/:uid", verifyAdmin, async (req, res) => {
    const { uid } = req.params;
    const { email, fullName, role, department, phoneNumber, status, studentId } = req.body;

    try {
      // 1. Update Auth if email changed
      const updateData: any = {
        displayName: fullName,
        phoneNumber: phoneNumber || null,
      };
      if (email) updateData.email = email;
      
      await auth.updateUser(uid, updateData);

      // 2. Update Firestore
      const firestoreUpdate: any = {
        email,
        fullName,
        role,
        department,
        phoneNumber: phoneNumber || "",
        status: status || "active",
        active: status === "active",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (studentId) firestoreUpdate.studentId = studentId;

      await db.collection("users").doc(uid).update(firestoreUpdate);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/users/:uid", verifyAdmin, async (req, res) => {
    const { uid } = req.params;

    try {
      // Soft delete? User requested "Optional: Soft delete".
      // But they also said "Delete users" in main goal.
      // I'll do permanent delete as requested by "Main Goal" but maybe flag it?
      // "Create a professional enterprise-level User Management System where: Admins fully manage users"
      // I'll do permanent for now to keep it clean, or update status to 'disabled'.
      
      // Let's actually delete from Auth and update Firestore status to disabled first as a safety,
      // or just delete both if that's what "Delete" means.
      await auth.deleteUser(uid);
      await db.collection("users").doc(uid).delete();

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/users/:uid/reset-password", verifyAdmin, async (req, res) => {
    const { uid } = req.params;
    const { newPassword } = req.body;

    try {
      await auth.updateUser(uid, { password: newPassword });
      await db.collection("users").doc(uid).update({
        mustChangePassword: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
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
