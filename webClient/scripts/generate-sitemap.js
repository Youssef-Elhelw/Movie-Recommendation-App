import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function fileExists(path) {
    try {
        await fs.access(path)
        return true
    } catch {
        return false
    }
}

async function readTitles(titlesPath) {
    if (!await fileExists(titlesPath)) return null
    try {
        const raw = await fs.readFile(titlesPath, 'utf8')
        if (!raw) return null
        const data = JSON.parse(raw)
        return data
    } catch (e) {
        console.warn('Could not parse titles.json:', e.message)
        return null
    }
}

function makeUrlEntry(loc, lastmod = new Date().toISOString().slice(0, 10), changefreq = 'weekly', priority = '0.5') {
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

async function generate() {
    const baseUrl = process.env.SITEMAP_BASE_URL || 'https://maymovie.vercel.app'
    const outPath = resolve(__dirname, '..', 'public', 'sitemap.xml')

    // Try to load local titles data (project root -> ../Model/server_artifacts/titles.json)
    const titlesPath = resolve(__dirname, '..', '..', 'Model', 'server_artifacts', 'titles.json')
    const titles = await readTitles(titlesPath)

    const urls = []
    // Always include homepage
    urls.push(makeUrlEntry(`${baseUrl}/`, undefined, 'daily', '1.0'))

    // If titles is an array of objects or strings, attempt to generate movie URLs
    if (Array.isArray(titles) && titles.length > 0) {
        for (let i = 0; i < titles.length; i++) {
            const item = titles[i]
            // prefer index or id if provided, otherwise use array index
            let id = null
            if (item && typeof item === 'object') {
                id = item.index ?? item.id ?? item.movieId ?? item.imdb_id ?? null
            }
            if (!id) id = i
            const loc = `${baseUrl}/movie/${encodeURIComponent(String(id))}`
            urls.push(makeUrlEntry(loc))
        }
    } else {
        // fallback: include a sample pattern route to help crawlers know structure
        urls.push(makeUrlEntry(`${baseUrl}/movie/1`, undefined, 'monthly', '0.6'))
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`

    await fs.writeFile(outPath, xml, 'utf8')
    console.log('Sitemap generated at', outPath)
}

generate().catch(err => {
    console.error('Failed to generate sitemap:', err)
    process.exitCode = 1
})
