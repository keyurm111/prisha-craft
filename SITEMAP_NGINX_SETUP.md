# Sitemap Setup for React + Node + Nginx Projects

Use this guide in future projects so `/sitemap.xml` works after deployment without manually editing Nginx on the server.

## Beginner Explanation

In a React website, Nginx usually sends most URLs to React's `index.html`.

That is correct for normal pages like:

```txt
/shop
/about
/product/some-item
```

But `sitemap.xml` is different. It is not a React page. It is an XML file that Google reads.

So the correct flow should be:

```txt
Google opens /sitemap.xml
        ↓
Nginx sees /sitemap.xml
        ↓
Nginx sends it to backend
        ↓
Backend creates sitemap XML
        ↓
Google receives the correct sitemap
```

Simple idea:

> React handles website pages. Backend creates the sitemap. Nginx decides where each request should go.

## Why This Is Needed

Most React deployments have this Nginx rule:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This means unknown URLs go to React.

If we do not add a special rule for `/sitemap.xml`, then Nginx may return `index.html` instead of real XML. Google will not get a valid sitemap.

## Backend Setup

Add a backend route for the sitemap:

```js
app.get("/sitemap.xml", sitemapController.getSitemap);
```

Example controller:

```js
exports.getSitemap = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "https://yourdomain.com";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${clientUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${clientUrl}/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  res.header("Content-Type", "application/xml");
  res.status(200).send(xml);
};
```

For ecommerce/blog projects, also add product and blog URLs dynamically from the database.

## Nginx Setup

Add this rule before the React fallback rule:

```nginx
location = /sitemap.xml {
    proxy_pass http://server:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Then keep the React fallback below it:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Important:

- If your backend Docker service is named `server`, use `http://server:5000`.
- If your backend service has another name, replace `server`.
- If your backend port is different, replace `5000`.
- The `/sitemap.xml` rule must come before `location /`.

## Docker Nginx Template Pattern

For Docker deployments, keep `nginx.conf` inside the frontend project and copy it during image build:

```dockerfile
FROM nginx:1.27-alpine AS production

ENV BACKEND_PORT=5000

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
```

Then in `nginx.conf`, use:

```nginx
location = /sitemap.xml {
    proxy_pass http://server:${BACKEND_PORT};
}
```

This makes the setup part of the project, so you do not need to manually change Nginx after deployment.

## Local Development Setup for Vite

In `vite.config.ts`, proxy `/sitemap.xml` to the backend:

```ts
server: {
  proxy: {
    "/sitemap.xml": {
      target: "http://localhost:5000",
      changeOrigin: true,
    },
  },
}
```

Now this works locally:

```txt
http://localhost:5173/sitemap.xml
```

## Environment Variables

Set the live website URL in production:

```env
CLIENT_URL=https://yourdomain.com
```

The backend should use `CLIENT_URL` when creating sitemap links.

Wrong:

```xml
<loc>http://localhost:5173/shop</loc>
```

Correct:

```xml
<loc>https://yourdomain.com/shop</loc>
```

## Final Checklist

Before deploying any future project:

- Backend has `GET /sitemap.xml`.
- Backend returns `Content-Type: application/xml`.
- Sitemap URLs use production `CLIENT_URL`.
- Frontend Nginx has `location = /sitemap.xml`.
- Sitemap Nginx rule appears before `location /`.
- Docker copies the custom `nginx.conf`.
- Local Vite proxy handles `/sitemap.xml`.
- Test live URL after deployment.

## Test Commands

After deployment, test:

```sh
curl -I https://yourdomain.com/sitemap.xml
```

Expected result should include:

```txt
HTTP/2 200
content-type: application/xml
```

Also test:

```sh
curl https://yourdomain.com/sitemap.xml
```

You should see XML, not React HTML.

If you see React HTML, Nginx is sending `/sitemap.xml` to `index.html`. Check the Nginx rule order.

