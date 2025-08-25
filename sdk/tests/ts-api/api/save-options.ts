import { Request, Response } from "express";

// In-memory storage for testing purposes (replaces Vercel KV)
const optionsStore = new Map<string, { data: string; expiry: number }>();

// Helper function to clean expired entries
const cleanExpiredEntries = () => {
  const now = Date.now();
  for (const [key, value] of optionsStore.entries()) {
    if (value.expiry < now) {
      optionsStore.delete(key);
    }
  }
};

export const saveOptionsHandler = async (
  req: Request,
  res: Response
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId, options } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!options) {
      return res.status(400).json({ message: "Options are required" });
    }

    console.log("Saving options for user:", userId, options);

    // Store the options in memory with a 30-minute expiration
    const expiryTime = Date.now() + (30 * 60 * 1000); // 30 minutes from now
    optionsStore.set(userId, {
      data: JSON.stringify(options),
      expiry: expiryTime
    });

    // Clean expired entries periodically
    cleanExpiredEntries();

    return res.status(200).json({ message: "Options saved successfully" });
  } catch (error) {
    console.error("Error saving options:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Helper function to get options (used by verify handler)
export const getOptions = (userId: string): any => {
  cleanExpiredEntries();
  const stored = optionsStore.get(userId);
  if (stored && stored.expiry > Date.now()) {
    return JSON.parse(stored.data);
  }
  return null;
};
