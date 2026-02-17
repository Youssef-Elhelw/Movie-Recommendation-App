import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import Papa from 'papaparse'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function fileExists(path) {
    try {
        await fs.access(path)
        return true
    } catch {
        return false
    }
}

async function readCSV(csvPath) {
    if (!await fileExists(csvPath)) return []
    try {
        const raw = await fs.readFile(csvPath, 'utf8')
        if (!raw) return []

        return new Promise((resolve) => {
            Papa.parse(raw, {
                header: true,
                complete: (results) => {
                    resolve(results.data.filter(movie => movie.title))
                },
                error: (err) => {
                    console.warn('Could not parse CSV:', err.message)
                    resolve([])
                }
            })
        })
    } catch (e) {
        console.warn('Could not read CSV file:', e.message)
        return []
    }
}

function makeUrlEntry(loc, lastmod = new Date().toISOString().slice(0, 10), changefreq = 'weekly', priority = '0.5') {
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

async function generate() {
    const baseUrl = process.env.SITEMAP_BASE_URL || 'https://maymovie.vercel.app'
    const outPath = resolve(__dirname, '..', 'public', 'sitemap.xml')

    // Read movies from CSV
    const csvPath = resolve(__dirname, '..', 'src', 'assets', 'final_movies.csv')
    const movies = await readCSV(csvPath)

    const urls = []
    const today = new Date().toISOString().slice(0, 10)

    // Static pages - ordered by importance
    urls.push(makeUrlEntry(`${baseUrl}/`, today, 'daily', '1.0'))
    urls.push(makeUrlEntry(`${baseUrl}/genres`, today, 'weekly', '0.9'))
    urls.push(makeUrlEntry(`${baseUrl}/trending`, today, 'daily', '0.9'))
    urls.push(makeUrlEntry(`${baseUrl}/about`, today, 'monthly', '0.7'))

    // Dynamic movie pages from CSV
    if (Array.isArray(movies) && movies.length > 0) {
        for (let i = 0; i < movies.length; i++) {
            const movie = movies[i]
            if (movie && movie.title) {
                // Use CSV index as the movie ID
                const loc = `${baseUrl}/movie/${i}`
                // Recently added movies get higher frequency/priority
                const changefreq = i < 10 ? 'weekly' : 'monthly'
                const priority = (0.8 - (i * 0.001)).toFixed(2) // Decreasing priority for older entries
                urls.push(makeUrlEntry(loc, today, changefreq, priority))
            }
        }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`

    await fs.writeFile(outPath, xml, 'utf8')
    console.log(`✓ Sitemap generated successfully at ${outPath}`)
    console.log(`✓ Total URLs: ${urls.length}`)
    console.log(`  - Static pages: 4`)
    console.log(`  - Dynamic movie pages: ${movies.length}`)
}

generate().catch(err => {
    console.error('✗ Failed to generate sitemap:', err)
    process.exitCode = 1
})
