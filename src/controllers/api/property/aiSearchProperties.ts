import { createOllama } from 'ollama-ai-provider'
import { generateText } from 'ai'
import { prisma } from '@lib/prismaClient'
import type { RequestHandler } from 'express'
import { z } from 'zod'
import { Property, Features, Media, User } from '@prisma/client'

const model = createOllama()('mistral')

// Define property result types using Prisma types
type MediaItem = Pick<Media, 'url' | 'type'>

type RawPropertyResult = Property &
    Partial<Features> & {
        mediaUrl?: string | null
        mediaType?: Media['type'] | null
        firstName?: User['firstName'] | null
        lastName?: User['lastName'] | null
        isFavorite?: boolean
    }

type PropertyWithRelations = Property &
    Partial<Features> & {
        firstName?: User['firstName'] | null
        lastName?: User['lastName'] | null
        isFavorite?: boolean
        media: MediaItem[]
    }

const systemPrompt = `
You are an assistant that generates PostgreSQL queries for a property listing app. Use the following PostgreSQL table and column names from Prisma schema:

Tables and Columns (case-sensitive in double quotes):
- "Property" ("id", "country", "title", "description", "address", "price", "isDeleted", "createdAt", "updatedAt", "listingType", "status", "propertyType", "userId")
- "Features" ("propertyId", "bedroom", "bathroom", "parking", "pool", "furnished")
- "Media" ("propertyId", "url", "type")
- "User" ("id", "firstName", "lastName", "email")
- "FavoriteProperties" ("userId", "propertyId")

Rules:
- Only return SELECT queries.
- Always filter out properties with status IN ('PENDING', 'REJECTED', 'EXPIRED') and isDeleted = false.
- Always wrap table and column names in double quotes.
- If no filters are given, return the top 10 most recent properties.
- If possible, include LEFT JOINs to enrich results with media, features, user, and favorite info.
- Use ILIKE for matching text fields and avoid SQL injection: wrap values safely.
- Do not use ORDER BY or LIMIT in the generated SQL and return only the SQL. No explanations.

Important Notes:
- Always use exact column names with correct case (e.g., "userId" not "userid")
- "userId" is camelCase in "Property" table
- "propertyId" is camelCase in "Features" and "Media" tables
- "id" is the primary key in "Property" table
- Always join tables using the correct relation fields
`

// Function to validate SQL query against schema
const validateSQL = (sql: string): string => {
    // Ensure userId is properly cased
    const fixedSQL = sql
        .replace(/\b"userid"\b/gi, '"userId"')
        .replace(/\b"propertyid"\b/gi, '"propertyId"')
        .replace(/\bfp\."userid"\b/gi, 'fp."userId"')
        .replace(/\bp\."userid"\b/gi, 'p."userId"')
        .replace(/\b"Property"\."userid"\b/gi, '"Property"."userId"')
        .replace(/\bf\."propertyid"\b/gi, 'f."propertyId"')
        .replace(/\bm\."propertyid"\b/gi, 'm."propertyId"')
        .replace(/\b"Features"\."propertyid"\b/gi, '"Features"."propertyId"')
        .replace(/\b"Media"\."propertyid"\b/gi, '"Media"."propertyId"')
        .replace(/\b"FavoriteProperties"\."propertyid"\b/gi, '"FavoriteProperties"."propertyId"')
        .replace(/\b"FavoriteProperties"\."userid"\b/gi, '"FavoriteProperties"."userId"')

    // Ensure all table names are properly quoted
    const tableNames = ['Property', 'Features', 'Media', 'User', 'FavoriteProperties']
    let result = fixedSQL

    tableNames.forEach((tableName) => {
        // Only replace unquoted table names
        const unquotedRegex = new RegExp(`\\b${tableName}\\b(?!")`, 'g')
        result = result.replace(unquotedRegex, `"${tableName}"`)
    })

    return result
}

const convertBigInts = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
        return obj.map(convertBigInts)
    } else if (obj && typeof obj === 'object') {
        return Object.fromEntries(Object.entries(obj).map(([key, val]) => [key, convertBigInts(val)]))
    } else if (typeof obj === 'bigint') {
        return obj.toString()
    }
    return obj
}

const searchSchema = z.object({
    searchQuery: z.string().min(1, 'Search query is required'),
})

// Standard join template for consistency
const getStandardJoins = (userId: string): string => `
    LEFT JOIN "Features" AS f ON "Property"."id" = f."propertyId"
    LEFT JOIN "Media" AS m ON "Property"."id" = m."propertyId"
    LEFT JOIN "User" AS u ON "Property"."userId" = u."id"
    LEFT JOIN "FavoriteProperties" AS fp ON "Property"."id" = fp."propertyId" AND fp."userId" = '${userId}'
`

// Standard filters for properties
const getStandardFilters = (): string => `
    WHERE "Property"."isDeleted" = false 
    AND "Property"."status" NOT IN ('PENDING', 'REJECTED', 'EXPIRED')
`

// Fallback query in case AI generation fails
const getFallbackQuery = (userId: string): string => `
    SELECT 
        "Property".*,
        f.*,
        m."url" as "mediaUrl",
        m."type" as "mediaType",
        u."firstName",
        u."lastName",
        CASE WHEN fp."userId" IS NOT NULL THEN true ELSE false END as "isFavorite"
    FROM "Property"
    ${getStandardJoins(userId)}
    ${getStandardFilters()}
    ORDER BY "Property"."createdAt" DESC
    LIMIT 10
`

// Process the raw SQL results to group media by property
const processPropertyResults = (rawResults: RawPropertyResult[]): PropertyWithRelations[] => {
    if (!rawResults || rawResults.length === 0) {
        return []
    }

    // Create a map to store properties by ID
    const propertyMap = new Map<string | number, PropertyWithRelations>()

    // Process each row
    rawResults.forEach((row) => {
        const propertyId = row.id

        // If this property hasn't been added to our map yet
        if (!propertyMap.has(propertyId)) {
            // Create a new property object with media array
            const property: PropertyWithRelations = {
                ...row,
                media: [],
            }

            // Add the property to our map
            propertyMap.set(propertyId, property)
        }

        // If we have media information, add it to the property's media array
        if (row.mediaUrl) {
            const property = propertyMap.get(propertyId)!

            // Check if this media item already exists in the property's media array
            const mediaExists = property.media.some(
                (media) => media.url === row.mediaUrl && media.type === row.mediaType,
            )

            // If not, add it
            if (!mediaExists && row.mediaType) {
                property.media.push({
                    url: row.mediaUrl,
                    type: row.mediaType,
                })
            }
        }
    })

    // Convert map values to array
    return Array.from(propertyMap.values())
}

// 🚀 Main Handler
const aiSearchProperties: RequestHandler = async (req, res) => {
    const userId = req.user?.id || 'anonymous'

    // ✅ Validate input
    const result = searchSchema.safeParse(req.query)
    if (!result.success) {
        res.status(400).json({
            success: false,
            message: 'Invalid query parameters',
            errors: result.error.flatten(),
        })
        return
    }

    const userQuery = result.data.searchQuery

    try {
        // 🧠 Ask the LLM for SQL
        const { text: rawSQL } = await generateText({
            model,
            system: systemPrompt,
            prompt: `User Input: ${userQuery}
            
Remember:
1. Always use double quotes around ALL column names, especially "userId" and "propertyId"
2. Always use correct casing for column names: "userId" not "userid"
3. Never use unquoted table names
4. Return only the SQL query with no explanations or code blocks`,
            maxTokens: 1000,
            temperature: 0.2, // Lower temperature for more consistent output
        })

        // 🧹 Clean and validate the SQL
        let cleanSQL = rawSQL.replace(/```sql|```/gi, '').trim()

        // Apply validation fixes
        cleanSQL = validateSQL(cleanSQL)

        // Ensure the query has our standard joins if not already present
        if (!cleanSQL.toLowerCase().includes('join')) {
            cleanSQL = cleanSQL.replace(/\bFROM\s+"Property"\b/i, `FROM "Property" ${getStandardJoins(userId)}`)
        }

        // Ensure standard filters are applied
        if (!cleanSQL.toLowerCase().includes('where')) {
            cleanSQL += ` ${getStandardFilters()}`
        } else if (!cleanSQL.toLowerCase().includes('isdeleted') || !cleanSQL.toLowerCase().includes('status')) {
            // Insert our standard filters after the existing WHERE clause
            cleanSQL = cleanSQL.replace(
                /\bWHERE\b/i,
                `WHERE "Property"."isDeleted" = false AND "Property"."status" NOT IN ('PENDING', 'REJECTED', 'EXPIRED') AND`,
            )
        }

        // Add ORDER BY and LIMIT if not present
        if (!cleanSQL.toLowerCase().includes('order by')) {
            cleanSQL += ` ORDER BY "Property"."createdAt" DESC LIMIT 10`
        }

        try {
            // 🧾 Run the query
            let rawProperties = await prisma.$queryRawUnsafe<RawPropertyResult[]>(cleanSQL)
            rawProperties = convertBigInts(rawProperties) as RawPropertyResult[]

            // Process the properties to group media items
            const properties = processPropertyResults(rawProperties)

            if (!properties || properties.length === 0) {
                res.status(404).json({ success: false, message: 'No properties found.' })
                return
            }

            res.status(200).json({ success: true, properties })
        } catch {
            // Try fallback query on SQL error
            const fallbackQuery = getFallbackQuery(userId)
            let rawProperties = await prisma.$queryRawUnsafe<RawPropertyResult[]>(fallbackQuery)
            rawProperties = convertBigInts(rawProperties) as RawPropertyResult[]

            // Process the properties to group media items
            const properties = processPropertyResults(rawProperties)

            res.status(200).json({
                success: true,
                properties,
                notice: 'Used fallback query due to error with AI-generated query',
            })
        }
    } catch {
        try {
            // Use fallback query if AI generation fails
            const fallbackQuery = getFallbackQuery(userId)
            let rawProperties = await prisma.$queryRawUnsafe<RawPropertyResult[]>(fallbackQuery)
            rawProperties = convertBigInts(rawProperties) as RawPropertyResult[]

            // Process the properties to group media items
            const properties = processPropertyResults(rawProperties)

            res.status(200).json({
                success: true,
                properties,
                notice: 'Used fallback query due to error with AI generation',
            })
        } catch (fallbackError) {
            res.status(500).json({
                success: false,
                message: `Search failed: ${(fallbackError as Error).message}`,
            })
        }
    }
}

export default aiSearchProperties
