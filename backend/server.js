require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

/* ---------------- FILE UPLOAD CONFIG ---------------- */

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return cb(new Error("Access denied"));
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, "secretkey");

      pool.query(
        `
        SELECT username
        FROM users
        WHERE id = $1
        `,
        [decoded.user]
      )
        .then((result) => {
          if (result.rows.length === 0) {
            return cb(new Error("User not found"));
          }

          const username = result.rows[0].username || "unknown";
          const now = new Date();
          const year = now.getFullYear().toString();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const statusFolder = "Pending";

          const uploadPath = path.join(
            __dirname,
            "uploads",
            username,
            year,
            month,
            statusFolder
          );

          fs.mkdirSync(uploadPath, {
            recursive: true,
          });

          cb(null, uploadPath);
        })
        .catch((err) => {
          cb(err);
        });
    } catch (err) {
      cb(err);
    }
  },

  filename: function (req, file, cb) {

    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(
      null,
      Date.now() + "-" + safeName
    );

  },

});

const upload = multer({

  storage: storage,

  limits: {
    fileSize: 20 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "image/vnd.adobe.photoshop",
      "application/postscript",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "application/zip",
      "application/x-zip-compressed"
    ];

    if (
      allowedTypes.includes(file.mimetype)
    ) {

      cb(null, true);

    } else {

      cb(
        new Error(
          "Only JPG, PNG, WEBP, SVG, PSD, video, and ZIP template files are allowed"
        )
      );

    }

  }

});
/* ---------------- MIDDLEWARE ---------------- */

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/uploads", express.static("uploads"));

const DEFAULT_CATEGORY_NAMES = [
  "Images",
  "Vector/illustrations",
  "PSD",
  "Videos",
  "Templates"
];

const getCategoriesList = async () => {
  try {
    const existing = await pool.query(`
      SELECT id, name
      FROM categories
      ORDER BY name
    `);

    if (existing.rows.length > 0) {
      return existing.rows;
    }

    const inserted = [];

    for (const categoryName of DEFAULT_CATEGORY_NAMES) {
      const created = await pool.query(
        `
        INSERT INTO categories (name)
        VALUES ($1)
        ON CONFLICT (name) DO NOTHING
        RETURNING id, name
        `,
        [categoryName]
      );

      if (created.rows[0]) {
        inserted.push(created.rows[0]);
      }
    }

    return inserted;
  } catch (err) {
    console.error("Failed to load categories", err.message || err);
    return [];
  }
};

// Ensure credits_history and image metadata columns exist
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS credits_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        credits INTEGER NOT NULL,
        payment_method TEXT,
        transaction_id TEXT,
        amount_paid NUMERIC,
        currency TEXT DEFAULT 'INR',
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await pool.query(`
      ALTER TABLE images
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS type TEXT
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
  } catch (err) {
    console.error('Failed to ensure database schema exists:', err.message || err);
  }
})();
/* ---------------- ADMIN MIDDLEWARE ---------------- */

const verifyAdmin = async (
  req,
  res,
  next
) => {

  try {

    const authHeader =
      req.headers["authorization"];

    if (!authHeader) {

      return res
        .status(401)
        .json("Access denied");

    }

    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        "secretkey"
      );

    console.log("========== VERIFY ADMIN ==========");
    console.log("Decoded Token:", decoded);

    const user =
      await pool.query(

        `
        SELECT role
        FROM users
        WHERE id = $1
        `,

        [decoded.user]

      );

    console.log("Database User:", user.rows);

    if (
      user.rows.length === 0
    ) {

      return res
        .status(404)
        .json("User not found");

    }

    console.log("User Role:", user.rows[0].role);

    if (
      user.rows[0].role !==
      "admin"
    ) {

      return res
        .status(403)
        .json(
          "Admin access only"
        );

    }

    req.user =
      decoded.user;

    next();

  } catch (err) {

    console.error(err);

    res
      .status(401)
      .json("Invalid token");

  }

};
/* ---------------- HEALTH CHECK ---------------- */

app.get("/", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT NOW()"
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).send(
      "Database connection error"
    );

  }

});

/* ---------------- REGISTER ---------------- */

app.post("/register", async (req, res) => {

  try {

    const {
  fullName,
  username,
  email,
  password,
  accountType,
  identityNumber
} = req.body;

const existingUser = await pool.query(
  `
  SELECT *
  FROM users
  WHERE username = $1
     OR email = $2
  `,
  [username, email]
);


if (existingUser.rows.length > 0) {
  return res
    .status(400)
    .json("Username or email already exists.");
}

    const saltRounds = 10;

    const hashedPassword =
      await bcrypt.hash(
        password,
        saltRounds
      );

    const newUser = await pool.query(

      `
      INSERT INTO users
(
  full_name,
  username,
  email,
  password,
  role,
  identity_number,
  status
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *
      `,

      [
  fullName,
  username,
  email,
  hashedPassword,
  accountType,
  identityNumber || null,
  accountType === "contributor"
    ? "pending"
    : "active"
]

    );

    res.json(newUser.rows[0]);

  } catch (err) {

    console.error(err.message);

    res.status(500).send(
      "Server error"
    );

  }

});

/* ---------------- LOGIN ---------------- */

app.post("/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    const user = await pool.query(

      `
      SELECT *
      FROM users
      WHERE email = $1
      `,

      [email]

    );

    if (user.rows.length === 0) {

      return res.status(401).json(
        "Invalid email"
      );

    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.rows[0].password
      );

    if (!validPassword) {

      return res.status(401).json(
        "Invalid password"
      );

    }
    // Contributor approval check
if (
  user.rows[0].role === "contributor" &&
  user.rows[0].status !== "active"
) {
  return res.status(403).json(
    "Your contributor account is awaiting admin approval."
  );
}

    const token = jwt.sign(

      {
        user: user.rows[0].id
      },

      "secretkey"

    );

   res.json({
  token,
  userId: user.rows[0].id,
  username: user.rows[0].username,
  role: user.rows[0].role
});

  } catch (err) {

    console.error(err.message);

    res.status(500).send(
      "Server error"
    );

  }

});

/* ---------------- DASHBOARD ---------------- */

app.get("/dashboard", (req, res) => {

  try {

    const authHeader =
      req.headers["authorization"];

    if (!authHeader) {

      return res.status(401).json(
        "Access denied"
      );

    }

    const token =
      authHeader.split(" ")[1];

    const verified = jwt.verify(
      token,
      "secretkey"
    );

    res.json({

      message:
        "Welcome to dashboard",

      user: verified,

    });

  } catch (err) {

    console.error(err.message);

    res.status(401).json(
      "Invalid token"
    );

  }

});

/* ---------------- UPLOAD IMAGE ---------------- */

app.post(
  "/upload",
  upload.single("image"),
  async (req, res) => {

    try {

      const authHeader = req.headers["authorization"];

      if (!authHeader) {
        return res.status(401).json("Access denied");
      }

      const token = authHeader.split(" ")[1];

      console.log("TOKEN RECEIVED:", token);

      const decoded = jwt.verify(
        token,
        "secretkey"
      );

      console.log("DECODED:", decoded);

      const {
  title,
  category,
  collection,
  keywords,
  description,
  type
} = req.body;

      if (!req.file) {
        return res.status(400).json(
          "No image uploaded"
        );
      }

      if (
  !title ||
  !category ||
  !collection ||
  !keywords
) {
        return res.status(400).json(
          "All fields are required"
        );
      }

      const currentUser = await pool.query(
  `
  SELECT role, status
  FROM users
  WHERE id = $1
  `,
  [decoded.user]
);

if (currentUser.rows.length === 0) {
  return res.status(404).json("User not found");
}

const user = currentUser.rows[0];

if (
  user.role !== "contributor" &&
  user.role !== "admin"
) {
  return res
    .status(403)
    .json("Only contributors can upload assets.");
}

if (
  user.role === "contributor" &&
  user.status !== "active"
) {
  return res
    .status(403)
    .json(
      "Contributor account is awaiting approval."
    );
}
      const uploaded_by = decoded.user;

      console.log(
        "DECODED USER:",
        decoded.user
      );

      console.log("TITLE:", title);
      console.log("CATEGORY:", category);
      console.log("KEYWORDS:", keywords);
      console.log("DESCRIPTION:", description);
      console.log("TYPE:", type);
      console.log("FILE:", req.file);

      const uploadRelativeDir = path.relative(
        path.join(__dirname, "uploads"),
        path.resolve(req.file.destination)
      ).replace(/\\/g, "/");

      const storedFilename = path.posix.join(
        uploadRelativeDir === "." ? "" : uploadRelativeDir,
        req.file.filename
      );

      const newImage = await pool.query(
        `
        INSERT INTO images
        (
          title,
          filename,
          category,
          collection,
          keywords,
          description,
          type,
          uploaded_by,
          created_at,
          downloads,
          views,
          likes,
          status
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          NOW(),
          0,
          0,
          0,
          'pending'
        )
        RETURNING *
        `,
        [
          title,
          storedFilename,
          category,
          collection,
          keywords,
          description,
          type,
          uploaded_by,
        ]
      );

      res.json(newImage.rows[0]);

    } catch (err) {

      console.error(
        "UPLOAD ERROR:"
      );

      console.error(err);

      res.status(500).json(
        err.message
      );

    }

  }
);
/* ---------------- CREDITS HISTORY ---------------- */

app.get(
  "/credits/history",
  async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];

      // If ?all=true and no auth header, return global latest 50 (public view)
      if (req.query.all === 'true' && !authHeader) {
        const history = await pool.query(
          `
          SELECT ch.id, ch.credits, ch.payment_method, ch.transaction_id, ch.amount_paid, ch.currency, ch.created_at, u.username, u.email
          FROM credits_history ch
          LEFT JOIN users u ON ch.user_id = u.id
          ORDER BY ch.created_at DESC
          LIMIT 50
          `
        );
        return res.json(history.rows || []);
      }

      if (!authHeader) {
        return res.status(401).json("Access denied");
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, "secretkey");

      // If authenticated and ?all=true, only allow admins to fetch global view
      if (req.query.all === 'true') {
        const u = await pool.query(`SELECT role FROM users WHERE id = $1`, [decoded.user]);
        if (u.rows.length > 0 && u.rows[0].role === 'admin') {
          const history = await pool.query(
            `
            SELECT ch.id, ch.credits, ch.payment_method, ch.transaction_id, ch.amount_paid, ch.currency, ch.created_at, u.username, u.email
            FROM credits_history ch
            LEFT JOIN users u ON ch.user_id = u.id
            ORDER BY ch.created_at DESC
            LIMIT 50
            `
          );
          return res.json(history.rows || []);
        }
        // Non-admins fall through to per-user view
      }

      const history = await pool.query(
        `
        SELECT ch.id, ch.credits, ch.payment_method, ch.transaction_id, ch.amount_paid, ch.currency, ch.created_at, u.username, u.email
        FROM credits_history ch
        LEFT JOIN users u ON ch.user_id = u.id
        WHERE ch.user_id = $1
        ORDER BY ch.created_at DESC
        LIMIT 50
        `,
        [decoded.user]
      );

      res.json(history.rows || []);
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to fetch credit history");
    }
  }
);

/* ---------------- TRACK KEYWORD SEARCH ---------------- */

app.post("/search-keyword", async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword || keyword.trim() === "") {
      return res.json({
        success: false,
      });
    }

    const cleanKeyword = keyword.trim().toLowerCase();

    const existing = await pool.query(
      `
      SELECT id
      FROM keyword_searches
      WHERE keyword = $1
      `,
      [cleanKeyword]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        `
        INSERT INTO keyword_searches
        (
          keyword,
          search_count,
          created_at,
          updated_at
        )
        VALUES
        (
          $1,
          1,
          NOW(),
          NOW()
        )
        `,
        [cleanKeyword]
      );
    } else {
      await pool.query(
        `
        UPDATE keyword_searches
        SET
          search_count = search_count + 1,
          updated_at = NOW()
        WHERE keyword = $1
        `,
        [cleanKeyword]
      );
    }

    res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
    });

  }
});
/* ---------------- GET ALL IMAGES ---------------- */

app.get("/images", async (req, res) => {

  try {

    const page =
      parseInt(req.query.page) || 1;

    const limit =
      parseInt(req.query.limit) || 12;

    const offset =
      (page - 1) * limit;

    const images =
      await pool.query(

        `
        SELECT
  images.*,
  users.username
FROM images
LEFT JOIN users
ON images.uploaded_by = users.id
WHERE images.status = 'approved'
ORDER BY
  images.created_at DESC,
  images.id DESC
LIMIT $1
OFFSET $2
        `,
        [limit, offset]

      );

    const totalCount =
      await pool.query(

        `
        SELECT COUNT(*)
        FROM images
        WHERE status = 'approved'
        `

      );
      const stats =
  await pool.query(
    `
    SELECT
      COALESCE(SUM(likes),0) AS total_likes,
      COALESCE(SUM(downloads),0) AS total_downloads,
      COALESCE(SUM(views),0) AS total_views
    FROM images
    WHERE status = 'approved'
    `
  );

    res.json({
  images: images.rows,

  totalImages:
    parseInt(
      totalCount.rows[0].count
    ),

  totalLikes:
    parseInt(
      stats.rows[0].total_likes
    ),

  totalDownloads:
    parseInt(
      stats.rows[0].total_downloads
    ),

  totalViews:
    parseInt(
      stats.rows[0].total_views
    )
});

  } catch (err) {

    console.error(err.message);

    res.status(500).send(
      "Server error"
    );

  }

});

/* ---------------- GET TRENDING IMAGES (TOP DOWNLOADS) ---------------- */

app.get("/images/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const result = await pool.query(
      `
      SELECT id, title, filename, downloads, views, likes, uploaded_by
      FROM images
      WHERE status = 'approved'
      ORDER BY downloads DESC, id DESC
      LIMIT $1
      `,
      [limit]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch trending images");
  }

});
/* ---------------- MONTHLY DOWNLOAD CHART ---------------- */

app.get("/api/monthly-downloads/:userId", async (req, res) => {

  const { userId } = req.params;

  try {

    const result = await pool.query(
      `
      SELECT
        TO_CHAR(downloaded_at, 'Mon') AS month,
        COUNT(*) AS downloads
      FROM downloads
      WHERE user_id = $1
      GROUP BY month,
               DATE_TRUNC('month', downloaded_at)
      ORDER BY DATE_TRUNC('month', downloaded_at)
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to load chart"
    });

  }

});
/* ---------------- GET SINGLE IMAGE ---------------- */

app.get(
  "/images/:id",
  async (req, res) => {

    try {

      const { id } = req.params;

      const image =
        await pool.query(

          `
          SELECT *
          FROM images
          WHERE id = $1
          `,

          [id]

        );

      if (
        image.rows.length === 0
      ) {

        return res.status(404).json(
          "Image not found"
        );

      }

      res.json(
        image.rows[0]
      );

    } catch (err) {

      console.error(err.message);

      res.status(500).send(
        "Fetch image error"
      );

    }

  }
);

/* ---------------- INCREASE VIEW COUNT ---------------- */

app.put(
  "/images/:id/view",
  async (req, res) => {

    try {

      const { id } = req.params;

      const updatedImage =
        await pool.query(

          `
          UPDATE images
          SET views = COALESCE(views, 0) + 1
          WHERE id = $1
          RETURNING *
          `,

          [id]

        );

      if (
        updatedImage.rows.length === 0
      ) {

        return res.status(404).json(
          "Image not found"
        );

      }

      res.json(
        updatedImage.rows[0]
      );

    } catch (err) {

      console.error(err.message);

      res.status(500).send(
        "View update error"
      );

    }

  }
);

/* ---------------- LIKE IMAGE ---------------- */

app.put(
  "/images/:id/like",
  async (req, res) => {

    try {

      const { id } = req.params;

      const updatedImage =
        await pool.query(

          `
          UPDATE images
          SET likes = COALESCE(likes, 0) + 1
          WHERE id = $1
          RETURNING *
          `,

          [id]

        );

      if (
        updatedImage.rows.length === 0
      ) {

        return res.status(404).json(
          "Image not found"
        );

      }
      const image =
  updatedImage.rows[0];
  const owner =
  await pool.query(
    `
    SELECT username
    FROM users
    WHERE id = $1
    `,
    [image.uploaded_by]
  );

await pool.query(
  `
  INSERT INTO notifications
(
  username,
  message,
  is_read
)
VALUES
(
  $1,
  $2,
  FALSE
)
  `,
  [
  owner.rows[0].username,
  `❤️ Someone liked your image "${image.title}"`
]
);

      res.json(
        updatedImage.rows[0]
      );

    } catch (err) {

      console.error(err.message);

      res.status(500).send(
        "Like error"
      );

    }

  }
);

/* ---------------- DOWNLOAD IMAGE ---------------- */

app.put(
  "/images/:id/download",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const userId =
        decoded.user;

      /* CHECK USER CREDITS */

      const user =
        await pool.query(

          `
          SELECT credits
          FROM users
          WHERE id = $1
          `,

          [userId]

        );

      if (
        Number(
          user.rows[0].credits
        ) < 1
      ) {

        return res.status(400).json(
          "Not enough credits"
        );

      }

      /* DEDUCT 1 CREDIT */

      await pool.query(

        `
        UPDATE users
        SET credits = credits - 1
        WHERE id = $1
        `,

        [userId]

      );

      const { id } = req.params;
      await pool.query(

  `
  INSERT INTO downloads
  (
    user_id,
    image_id
  )
  VALUES
  (
    $1,
    $2
  )
  `,

  [
    userId,
    id
  ]

);

      const updatedImage =
        await pool.query(

          `
          UPDATE images
          SET
            downloads = COALESCE(downloads,0) + 1,
            earnings = COALESCE(earnings,0) + 0.25
          WHERE id = $1
          RETURNING *
          `,

          [id]

        );

      if (
        updatedImage.rows.length === 0
      ) {

        return res.status(404).json(
          "Image not found"
        );

      }
      const image =
  updatedImage.rows[0];
  const owner =
  await pool.query(
    `
    SELECT username
    FROM users
    WHERE id = $1
    `,
    [image.uploaded_by]
  );

await pool.query(
  `
  INSERT INTO notifications
(
  username,
  message,
  is_read
)
VALUES
(
  $1,
  $2,
  FALSE
)
  `,
  [
  owner.rows[0].username,
  `⬇ Someone downloaded your image "${image.title}"`
]
);

      res.json(
        updatedImage.rows[0]
      );

    } catch (err) {

      console.error(err.message);

      res.status(500).send(
        "Download count error"
      );

    }

  }
);

/* ---------------- DELETE IMAGE ---------------- */

app.delete(
  "/images/:id",
  async (req, res) => {

    try {

      const { id } = req.params;

      // Get image filename first

      const image =
        await pool.query(
          `
          SELECT filename
          FROM images
          WHERE id = $1
          `,
          [id]
        );

      if (
        image.rows.length === 0
      ) {

        return res
          .status(404)
          .json("Image not found");

      }

      const filename =
        image.rows[0].filename;

      // Delete favorites

      await pool.query(
        `
        DELETE FROM favorites
        WHERE image_id = $1
        `,
        [id]
      );

      // Delete downloads

      await pool.query(
        `
        DELETE FROM downloads
        WHERE image_id = $1
        `,
        [id]
      );

      // Delete image record

      await pool.query(
        `
        DELETE FROM images
        WHERE id = $1
        `,
        [id]
      );

      // Delete physical file

      const filePath =
        path.join(
          __dirname,
          "uploads",
          filename
        );

      if (
        fs.existsSync(filePath)
      ) {

        fs.unlinkSync(filePath);

      }

      res.json(
        "Image deleted successfully"
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Delete error"
      );

    }

  }
);
/* ---------------- UPDATE IMAGE ---------------- */

app.put(
  "/images/:id",
  async (req, res) => {

    try {

      const { id } = req.params;

      const {
        title,
        category,
        keywords,
        description,
        type
      } = req.body;

      const updatedImage =
        await pool.query(

          `
          UPDATE images
          SET
            title = $1,
            category = $2,
            keywords = $3,
            description = $4,
            type = $5
          WHERE id = $6
          RETURNING *
          `,

          [
            title,
            category,
            keywords,
            description,
            type,
            id
          ]

        );

      res.json(
        updatedImage.rows[0]
      );

    } catch (err) {

      console.error(err.message);

      res.status(500).send(
        "Update error"
      );

    }

  }
);
const authenticateToken = (
  req,
  res,
  next
) => {

  const authHeader =
    req.headers["authorization"];

  if (!authHeader) {

    return res.status(401).json(
      "Access denied"
    );

  }

  const token =
    authHeader.split(" ")[1];

  try {

    const decoded =
      jwt.verify(
        token,
        "secretkey"
      );

    req.user = {
      id: decoded.user
    };

    next();

  } catch (err) {

    return res.status(403).json(
      "Invalid token"
    );

  }

};
/* ---------------- USER PROFILE ---------------- */

app.get("/profile", async (req, res) => {

  try {

    console.log("PROFILE ROUTE HIT");

    const authHeader =
      req.headers["authorization"];

    console.log(
      "AUTH HEADER:",
      authHeader
    );

    if (!authHeader) {

      return res.status(401).json(
        "Access denied"
      );

    }

    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        "secretkey"
      );

    const user =
      await pool.query(

        `
        SELECT
id,
username,
email,
role,
credits
FROM users
WHERE id = $1
        `,

        [decoded.user]

      );

    if (
      user.rows.length === 0
    ) {

      return res.status(404).json(
        "User not found"
      );

    }

    res.json(
      user.rows[0]
    );

  } catch (err) {

    console.error(err);

    res.status(500).send(
      "Profile error"
    );

  }

});

    /* ---------------- CHANGE PASSWORD ---------------- */

    app.post(
      "/profile/change-password",
      authenticateToken,
      async (req, res) => {
        try {
          const userId = req.user.id;
          const { currentPassword, newPassword } = req.body;

          if (!currentPassword || !newPassword) {
            return res.status(400).json("Missing required fields");
          }

          const user = await pool.query(
            `
            SELECT password
            FROM users
            WHERE id = $1
            `,
            [userId]
          );

          if (user.rows.length === 0) {
            return res.status(404).json("User not found");
          }

          const valid = await bcrypt.compare(
            currentPassword,
            user.rows[0].password
          );

          if (!valid) {
            return res.status(401).json("Invalid current password");
          }

          const saltRounds = 10;
          const hashed = await bcrypt.hash(newPassword, saltRounds);

          await pool.query(
            `
            UPDATE users
            SET password = $1
            WHERE id = $2
            `,
            [hashed, userId]
          );

          res.json("Password changed successfully");
        } catch (err) {
          console.error(err);
          res.status(500).send("Change password error");
        }
      }
    );

app.get(
  "/dashboard-stats",
  authenticateToken,
  async (req, res) => {
    try {

      const userId = req.user.id;
      console.log(
  "DASHBOARD USER ID:",
  userId
);

      const uploads = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM images
        WHERE uploaded_by = $1
        `,
        [userId]
      );

      const downloads = await pool.query(
        `
        SELECT COALESCE(SUM(downloads),0) AS total
        FROM images
        WHERE uploaded_by = $1
        `,
        [userId]
      );

      const views = await pool.query(
        `
        SELECT COALESCE(SUM(views),0) AS total
        FROM images
        WHERE uploaded_by = $1
        `,
        [userId]
      );

      const likes = await pool.query(
        `
        SELECT COALESCE(SUM(likes),0) AS total
        FROM images
        WHERE uploaded_by = $1
        `,
        [userId]
      );
      const userInfo = await pool.query(
  `
  SELECT created_at
  FROM users
  WHERE id = $1
  `,
  [userId]
);

const uploadsCount =
  Number(
    uploads.rows[0].total
  );

const downloadsCount =
  Number(
    downloads.rows[0].total
  );

const viewsCount =
  Number(
    views.rows[0].total
  );

const likesCount =
  Number(
    likes.rows[0].total
  );

const rawScore =
  uploadsCount +
  downloadsCount +
  viewsCount +
  likesCount;

const createdAt =
  new Date(
    userInfo.rows[0].created_at
  );

const monthsOld =
  Math.max(
    1,
    Math.floor(
      (
        new Date() -
        createdAt
      ) /
      (
        1000 *
        60 *
        60 *
        24 *
        30
      )
    )
  );

const reputationScore =
  Math.round(
    rawScore / monthsOld
  );      
res.json({
  uploads: uploadsCount,
  downloads: downloadsCount,
  views: viewsCount,
  likes: likesCount,

  rawScore,
  monthsOld,
  reputationScore
});

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: "Server error"
      });

    }
  }
);
/* ---------------- PROFILE STATS ---------------- */

app.get(
  "/profile/stats",
  async (req, res) => {
    console.log("STATS ROUTE HIT");

const authHeader =
  req.headers["authorization"];

console.log(
  "STATS AUTH:",
  authHeader
);

    try {

      const authHeader =
        req.headers["authorization"];
        console.log(
        "PROFILE STATS AUTH:",
        authHeader
      );

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const stats =
        await pool.query(

          `
          SELECT

COUNT(*) AS total_uploads,

COUNT(*) FILTER
(
  WHERE status = 'approved'
)
AS approved_images,

COUNT(*) FILTER
(
  WHERE status = 'pending'
)
AS pending_images,

COUNT(*) FILTER
(
  WHERE status = 'rejected'
)
AS rejected_images,

COALESCE(
  SUM(likes),
  0
)
AS total_likes,

COALESCE(
  SUM(views),
  0
)
AS total_views,

COALESCE(
  SUM(downloads),
  0
)
AS total_downloads,

COALESCE(
  SUM(earnings),
  0
)
AS total_earnings,

COALESCE(
  MAX(downloads),
  0
)
AS top_downloads,

COALESCE(
  MAX(views),
  0
)
AS top_views,

COALESCE(
  MAX(likes),
  0
)
AS top_likes

FROM images

WHERE uploaded_by = $1
          `,

          [decoded.user]

        );

      res.json(
        stats.rows[0]
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Stats error"
      );

    }

  }
);

/* ---------------- MY UPLOADS ---------------- */

app.get(
  "/my-uploads",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const images =
        await pool.query(

          `
          SELECT *
          FROM images
          WHERE uploaded_by = $1
          ORDER BY
          created_at DESC
          `,

          [decoded.user]

        );

      res.json(
        images.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "My uploads error"
      );

    }

  }
);
/* ---------------- ADMIN ALL IMAGES ---------------- */

app.get(
  "/admin/images",
  verifyAdmin,
  async (req, res) => {

    try {

      const images =
        await pool.query(

          `
          SELECT *
          FROM images
          ORDER BY created_at DESC
          `

        );

      res.json(
        images.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Admin fetch error"
      );

    }

  }
);
/* ---------------- APPROVE IMAGE ---------------- */

const moveImageFile = async (currentFilename, newStatus) => {
  if (!currentFilename) {
    return null;
  }

  const normalized = currentFilename.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const fileName = parts.pop();
  const statusFolders = ["Pending", "Approved", "Rejected"];
  let targetParts = parts;

  if (statusFolders.includes(parts[parts.length - 1])) {
    targetParts = [...parts.slice(0, -1), newStatus];
  } else {
    targetParts = [...parts, newStatus];
  }

  const newRelativePath = [...targetParts, fileName].join("/");
  const oldPath = path.join(__dirname, "uploads", ...normalized.split("/"));
  const newPath = path.join(__dirname, "uploads", ...newRelativePath.split("/"));

  fs.mkdirSync(path.dirname(newPath), { recursive: true });

  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
  }

  return newRelativePath;
};

app.put(
  "/admin/approve/:id",
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const imageResult = await pool.query(
        `
        SELECT filename
        FROM images
        WHERE id = $1
        `,
        [id]
      );

      if (imageResult.rows.length === 0) {
        return res.status(404).json("Image not found");
      }

      const newFilename = await moveImageFile(
        imageResult.rows[0].filename,
        "Approved"
      );

      const image = await pool.query(
        `
        UPDATE images
        SET status = 'approved', filename = $1
        WHERE id = $2
        RETURNING *
        `,
        [newFilename, id]
      );

      res.json(image.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Approve error");
    }
  }
);
/* ---------------- REJECT IMAGE ---------------- */

app.put(
  "/admin/reject/:id",
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const imageResult = await pool.query(
        `
        SELECT filename
        FROM images
        WHERE id = $1
        `,
        [id]
      );

      if (imageResult.rows.length === 0) {
        return res.status(404).json("Image not found");
      }

      const newFilename = await moveImageFile(
        imageResult.rows[0].filename,
        "Rejected"
      );

      const image = await pool.query(
        `
        UPDATE images
        SET status = 'rejected', filename = $1
        WHERE id = $2
        RETURNING *
        `,
        [newFilename, id]
      );

      res.json(image.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Reject error");
    }
  }
);
/* ---------------- LIST PUBLIC CATEGORIES ---------------- */

app.get("/categories", async (req, res) => {
  try {
    const categories = await getCategoriesList();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch categories");
  }
});

/* ---------------- ADMIN CATEGORY MANAGEMENT ---------------- */

app.get("/admin/categories", verifyAdmin, async (req, res) => {
  try {
    const categories = await getCategoriesList();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch admin categories");
  }
});

app.post("/admin/categories", verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json("Category name is required");
    }

    const newCategory = await pool.query(
      `
      INSERT INTO categories (name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING
      RETURNING *
      `,
      [name.trim()]
    );

    if (newCategory.rows.length === 0) {
      return res.status(400).json("Category already exists");
    }

    res.json(newCategory.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add category");
  }
});

app.delete("/admin/categories/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await pool.query(
      `
      DELETE FROM categories
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json("Category not found");
    }

    res.json(deleted.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to delete category");
  }
});

/* ---------------- ADD CREDITS ---------------- */

app.put(
  "/credits/add",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const { credits } =
        req.body;

      const user =
        await pool.query(

          `
          UPDATE users
          SET credits =
            COALESCE(credits,0) + $1
          WHERE id = $2
          RETURNING *
          `,

          [
            credits,
            decoded.user
          ]

        );

      // record this credit addition in credits_history for audit
      try {
        const { payment_method, transaction_id, amount_paid, currency } = req.body || {};
        await pool.query(
          `
          INSERT INTO credits_history
          (
            user_id,
            credits,
            payment_method,
            transaction_id,
            amount_paid,
            currency
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            COALESCE($6, 'INR')
          )
          `,
          [decoded.user, credits, payment_method || null, transaction_id || null, amount_paid || null, currency || null]
        );
      } catch (err) {
        console.error('Failed to insert credits_history record', err.message || err);
        // continue — do not block credit update on history logging failure
      }

      res.json(
        user.rows[0]
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Credit update error"
      );

    }

  }
);
/* ---------------- ADD FAVORITE ---------------- */

app.post(
  "/favorites/:imageId",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const { imageId } =
        req.params;

      await pool.query(

        `
        INSERT INTO favorites
        (
          user_id,
          image_id
        )
        VALUES
        (
          $1,
          $2
        )
        `,

        [
          decoded.user,
          imageId
        ]

      );
      const imageResult =
  await pool.query(
    `
    SELECT
      title,
      uploaded_by
    FROM images
    WHERE id = $1
    `,
    [imageId]
  );

const image =
  imageResult.rows[0];
  const owner =
  await pool.query(
    `
    SELECT username
    FROM users
    WHERE id = $1
    `,
    [image.uploaded_by]
  );

await pool.query(
  `
  INSERT INTO notifications
(
  username,
  message,
  is_read
)
VALUES
(
  $1,
  $2,
  FALSE
)
  `,
  [
  owner.rows[0].username,
  `⭐ Someone favorited your image "${image.title}"`
]
);

      res.json(
        "Added to favorites"
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Favorite error"
      );

    }

  }
);
/* ---------------- REMOVE FAVORITE ---------------- */

app.delete(
  "/favorites/:imageId",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const { imageId } =
        req.params;

      await pool.query(

        `
        DELETE FROM favorites
WHERE user_id = $1
AND image_id = $2
        `,

        [
          decoded.user,
          imageId
        ]

      );

      res.json(
        "Favorite removed"
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Remove favorite error"
      );

    }

  }
);
/* ---------------- MY FAVORITES ---------------- */

app.get(
  "/favorites",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const favorites =
        await pool.query(

          `
          SELECT
            images.*
          FROM favorites
          JOIN images
            ON favorites.image_id = images.id
          WHERE favorites.user_id = $1
          ORDER BY images.created_at DESC
          `,

          [decoded.user]

        );

      res.json(
        favorites.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Favorites fetch error"
      );

    }

  }
);
/* ---------------- MY DOWNLOADS ---------------- */

app.get(
  "/my-downloads",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const downloads =
        await pool.query(

          `
          SELECT
            images.*,
            downloads.downloaded_at
          FROM downloads
          JOIN images
            ON downloads.image_id = images.id
          WHERE downloads.user_id = $1
          ORDER BY downloads.downloaded_at DESC
          `,

          [decoded.user]

        );

      res.json(
        downloads.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Downloads fetch error"
      );

    }

  }
);
/* ---------------- LEADERBOARD ---------------- */

app.get(
  "/leaderboard",
  async (req, res) => {

    try {

      const result =
        await pool.query(

          `
          SELECT

u.username AS name,

COUNT(*) AS uploads,

COALESCE(
  SUM(i.likes),
  0
) AS likes,

COALESCE(
  SUM(i.views),
  0
) AS views,

COALESCE(
  SUM(i.downloads),
  0
) AS downloads,

COALESCE(
  SUM(i.earnings),
  0
) AS earnings

FROM images i

JOIN users u
ON i.uploaded_by = u.id

GROUP BY
u.username

ORDER BY
SUM(i.downloads) DESC

LIMIT 10
          `

        );

      res.json(
        result.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Leaderboard error"
      );

    }

  }
);
/* ---------------- GET NOTIFICATIONS ---------------- */

app.get(
  "/notifications/:username",
  async (req, res) => {

    try {

      const { username } =
  req.params;

      const notifications =
        await pool.query(

          `
          SELECT *
          FROM notifications
          WHERE username = $1
          ORDER BY created_at DESC
          LIMIT 50
          `,

          [username]

        );

      res.json(
        notifications.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Notifications error"
      );

    }

  }
);
/* ---------------- MARK NOTIFICATIONS READ ---------------- */

app.put(
  "/notifications/read/:username",
  async (req, res) => {

    try {

      const { username } =
        req.params;

      await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE username = $1
        `,
        [username]
      );

      res.json(
        "Notifications marked read"
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Read notification error"
      );

    }

  }
);
/* ---------------- UNREAD COUNT ---------------- */

app.get(
  "/notifications/count/:username",
  async (req, res) => {

    try {

      const { username } =
        req.params;

      const result =
        await pool.query(
          `
          SELECT COUNT(*) AS count
          FROM notifications
          WHERE username = $1
          AND is_read = FALSE
          `,
          [username]
        );

      res.json(
        result.rows[0]
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Unread count error"
      );

    }

  }
);
/* ---------------- EARNINGS DASHBOARD ---------------- */

app.get(
  "/earnings-dashboard",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const userId =
        decoded.user;

      const result =
        await pool.query(

          `
          SELECT

          COALESCE(
            SUM(earnings),
            0
          ) AS total_earnings,

          COALESCE(
            SUM(downloads),
            0
          ) AS total_downloads,

          COUNT(*) AS total_images

          FROM images

          WHERE uploaded_by = $1
          `,

          [userId]

        );

      res.json(
        result.rows[0]
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Earnings dashboard error"
      );

    }

  }
);
/* ---------------- BEST SELLING IMAGE ---------------- */

app.get(
  "/best-selling-image",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const userId =
        decoded.user;

      const result =
        await pool.query(

          `
          SELECT
            id,
            title,
            filename,
            downloads,
            earnings
          FROM images
          WHERE uploaded_by = $1
          ORDER BY downloads DESC
          LIMIT 1
          `,

          [userId]

        );

      res.json(
        result.rows[0] || {}
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Best selling image error"
      );

    }

  }
);
/* ---------------- SEARCH KEYWORD ---------------- */

app.post("/search-keyword", async (req, res) => {
  try {

    const { keyword } = req.body;

    if (!keyword || keyword.trim() === "") {
      return res.json();
    }

    const existing = await pool.query(
      `
      SELECT *
      FROM keyword_searches
      WHERE LOWER(keyword)=LOWER($1)
      `,
      [keyword.trim()]
    );

    if (existing.rows.length > 0) {

      await pool.query(
        `
        UPDATE keyword_searches
        SET
          search_count = search_count + 1,
          updated_at = NOW()
        WHERE LOWER(keyword)=LOWER($1)
        `,
        [keyword.trim()]
      );

    } else {

      await pool.query(
        `
        INSERT INTO keyword_searches
        (
          keyword,
          search_count
        )
        VALUES
        (
          $1,
          1
        )
        `,
        [keyword.trim()]
      );

    }

    res.json({
      success:true
    });

  } catch(err){

    console.error(err);

    res.status(500).json(err);

  }

});
/* ---------------- TRENDING KEYWORDS ---------------- */

app.get("/trending-keywords", async (req, res) => {

  try {

    const result = await pool.query(

      `
      SELECT
        ks.keyword,

        ks.search_count,

        COALESCE(
          SUM(i.views),
          0
        ) AS views,

        COALESCE(
          SUM(i.downloads),
          0
        ) AS downloads,

        CASE

          WHEN
          (
            COALESCE(SUM(i.views),0)
            +
            COALESCE(SUM(i.downloads),0)
          ) = 0

          THEN 0

          ELSE

            ks.search_count::decimal /

            (
              COALESCE(SUM(i.views),0)
              +
              COALESCE(SUM(i.downloads),0)
            )

        END AS score

      FROM keyword_searches ks

      LEFT JOIN images i

      ON

      (
        LOWER(i.title)
        LIKE '%' || LOWER(ks.keyword) || '%'

        OR

        LOWER(i.keywords)
        LIKE '%' || LOWER(ks.keyword) || '%'
      )

      GROUP BY

        ks.id,
        ks.keyword,
        ks.search_count

      HAVING

        COALESCE(
          SUM(i.downloads),
          0
        ) > 0

      ORDER BY

        score DESC,

        ks.search_count DESC

      LIMIT 5
      `

    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to load trending keywords"
    });

  }

});
/* ---------------- RECORD KEYWORD SEARCH ---------------- */

app.post("/search-keyword", async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json("Keyword is required");
    }

    await pool.query(
      `
      INSERT INTO keyword_searches
      (keyword, search_count, updated_at)
      VALUES
      ($1, 1, NOW())

      ON CONFLICT (keyword)

      DO UPDATE
      SET
        search_count = keyword_searches.search_count + 1,
        updated_at = NOW()
      `,
      [keyword.trim()]
    );

    res.json({
      success: true,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json("Server Error");
  }
});
/* ---------------- TRENDING KEYWORDS ---------------- */

app.get("/trending-keywords", async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        ks.keyword,
        ks.search_count,

        COALESCE(SUM(i.views), 0) AS views,
        COALESCE(SUM(i.downloads), 0) AS downloads,

        CASE
          WHEN (COALESCE(SUM(i.views),0) + COALESCE(SUM(i.downloads),0)) = 0
          THEN ks.search_count
          ELSE
            ks.search_count::decimal /
            (
              COALESCE(SUM(i.views),0) +
              COALESCE(SUM(i.downloads),0)
            )
        END AS score

      FROM keyword_searches ks

      LEFT JOIN images i
      ON
        LOWER(i.title) LIKE '%' || LOWER(ks.keyword) || '%'
        OR
        LOWER(i.keywords) LIKE '%' || LOWER(ks.keyword) || '%'

      GROUP BY
        ks.id,
        ks.keyword,
        ks.search_count

      ORDER BY
        score DESC,
        ks.search_count DESC

      LIMIT 5
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to load trending keywords"
    });

  }
});
/* ---------------- TRACK VISITOR ---------------- */

app.post("/track-visitor", async (req, res) => {

  try {

    await pool.query(
      `
      INSERT INTO visitor_logs
      (
        visited_at
      )
      VALUES
      (
        CURRENT_TIMESTAMP
      )
      `
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json(err);

  }

});
/* ---------------- HERO STATS ---------------- */

app.get("/hero-stats", async (req, res) => {

  try {

    const totalAssets =
      await pool.query(

        `
        SELECT COUNT(*) AS total
        FROM images
        WHERE status='approved'
        `

      );

    const totalSearches =
      await pool.query(

        `
        SELECT
        COALESCE(
          SUM(search_count),
          0
        ) AS total
        FROM keyword_searches
        `

      );

    const totalDownloads =
      await pool.query(

        `
        SELECT COUNT(*) AS total
        FROM downloads
        `

      );

    const todayVisitors =
      await pool.query(

        `
        SELECT COUNT(*) AS total
        FROM visitor_logs

        WHERE

        visited_at::date =
        CURRENT_DATE
        `

      );

    res.json({

      totalAssets:
        Number(
          totalAssets.rows[0].total
        ),

      totalSearches:
        Number(
          totalSearches.rows[0].total
        ),

      totalDownloads:
        Number(
          totalDownloads.rows[0].total
        ),

      todayVisitors:
        Number(
          todayVisitors.rows[0].total
        )

    });

  }

  catch(err){

    console.log(err);

    res.status(500).json(err);

  }

});
/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "127.0.0.1", () => {

  console.log(
    `Server running on port ${PORT}`
  );

});