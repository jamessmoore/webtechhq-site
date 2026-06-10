# webtechhq-site

James S. Moore personal brand site — **Moore Methods** — built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

## Local development

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## Stack

- **Next.js 14** — App Router, server-side rendering, `output: standalone`
- **TypeScript** — strict mode
- **Tailwind CSS** — utility-first, brand palette in `tailwind.config.js`
- **PM2** — process management on EC2
- **Nginx** — reverse proxy + SSL termination

## Project structure

```
src/
  app/
    layout.tsx       # Root layout, metadata
    page.tsx         # Home page
    globals.css      # Base styles, BR grid, utility classes
    services/
    portfolio/
    about/
    blog/
  components/
    HexMark.tsx      # Locked 2D hex shield SVG mark
    Navbar.tsx       # Fixed top nav with active state
    Hero.tsx         # Full-height hero section
    Services.tsx     # 4-card services grid
    ProofBar.tsx     # Credentials strip
    Footer.tsx       # Footer with nav, social links, quiet domain
```

## Deploy to EC2

```bash
# First time: clone the repo on the server at /srv/webtechhq
# Then from your local machine:
./deploy.sh <elastic-ip>

# Or manually:
ssh ubuntu@<ip>
cd /srv/webtechhq && git pull && npm ci && npm run build
pm2 restart webtechhq
```

## SSL / TLS

After DNS is pointed at the Elastic IP:

```bash
ssh ubuntu@<ip>
sudo certbot --nginx -d webtechhq.com -d www.webtechhq.com
# Certbot auto-updates the Nginx config and sets up auto-renewal
```

## Infra

Terraform lives in the companion repo: `webtechhq-infra`
