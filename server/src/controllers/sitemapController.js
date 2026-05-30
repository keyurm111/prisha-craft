const { Product } = require("../models/Product");
const Blog = require("../models/Blog");

/**
 * Escapes special XML characters to prevent parsing errors.
 */
const escapeXml = (unsafe) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

/**
 * Generates and serves a dynamic XML sitemap based on MongoDB database contents.
 */
exports.getSitemap = async (req, res) => {
  try {
    // Dynamic domain URL from env variable with default fallback
    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
    
    // Fetch products (selecting only required fields to optimize DB load)
    const products = await Product.find({}, "_id slug createdAt").lean();
    
    // Fetch only published blogs
    const blogs = await Blog.find({ status: "Published" }, "slug publishedAt createdAt").lean();
    
    // Core static URLs of the website
    const staticPages = [
      { path: "", changefreq: "daily", priority: "1.0" },
      { path: "/shop", changefreq: "daily", priority: "0.8" },
      { path: "/blog", changefreq: "weekly", priority: "0.7" },
      { path: "/about", changefreq: "monthly", priority: "0.6" },
      { path: "/contact", changefreq: "monthly", priority: "0.6" },
      { path: "/privacy", changefreq: "monthly", priority: "0.4" },
      { path: "/terms", changefreq: "monthly", priority: "0.4" },
      { path: "/return", changefreq: "monthly", priority: "0.4" },
    ];
    
    // Build sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // 1. Add static pages
    staticPages.forEach(page => {
      const lastmod = new Date().toISOString().split("T")[0];
      const url = escapeXml(`${clientUrl}${page.path}`);
      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // 2. Add product pages dynamically
    products.forEach(product => {
      const lastmod = new Date(product.createdAt || Date.now()).toISOString().split("T")[0];
      const url = escapeXml(`${clientUrl}/product/${product.slug || product._id}`);
      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // 3. Add blog pages dynamically
    blogs.forEach(blog => {
      const lastmod = new Date(blog.publishedAt || blog.createdAt || Date.now()).toISOString().split("T")[0];
      const url = escapeXml(`${clientUrl}/blog/${blog.slug}`);
      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    // Set response headers and send XML response
    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("❌ Error generating dynamic sitemap:", error);
    res.status(500).header("Content-Type", "application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error generating dynamic sitemap: ${escapeXml(error.message)} -->
</urlset>`);
  }
};
