import type { RequestHandler } from 'express'
import { prisma } from '@lib/prismaClient'
import { z } from 'zod'
import { createOllama } from 'ollama-ai-provider'
import { generateObject } from 'ai'
import { Property } from '@prisma/client'

const ollama = createOllama()
const model = ollama('mistral')

const prompt = `
You are an expert PostgreSQL query generator. Generate queries with these STRICT rules:

1. Use EXACT table names with proper casing:
   - "Property" (must be quoted)
   - "Features" (must be quoted)
   - "Media" (must be quoted)

2. Always quote column names with special characters or case sensitivity:
   - "propertyId" (must be quoted)
   - "isDeleted" (must be quoted)

3. Example CORRECT query:
SELECT p.* FROM "Property" p 
JOIN "Features" f ON p.id = f."propertyId" 
WHERE p."isDeleted" = false ANAD p."country" = 'SOMALIA';

4. Example WRONG query:
SELECT p.* FROM Property p [UNQUOTED]
JOIN Features f ON p.id = f.propertyId [UNQUOTED]
WHERE p.isDeleted = false; [UNQUOTED]

5. Never include:
- Additional text before/after query
- Parameter placeholders (:param)
- Type casts (::type)
- JSON functions unless absolutely necessary

6. Kenya and Somalia are the only countries in the database. Use their exact names in caps and tehy are in the property table not features table.
7. The query should be a SELECT statement that retrieves all columns from the "Property" table and joins the "Features" table on the propertyId.
8. The query should include a WHERE clause that filters out deleted properties (isDeleted = false) and any other conditions based on the input.
9. The query should be formatted correctly with proper indentation and spacing.
10. The query should be safe from SQL injection attacks.
11. Parking is an integer in the features table, so there could be a condition like "parking = 1" or "parking > 0" in the WHERE clause.

- Here are the table structures:
model Property {
    id                 String               @id @default(uuid())
    country            Country              
    title              String
    description        String?
    address            String
    price              Float
    isDeleted          Boolean              @default(false)
    createdAt          DateTime             @default(now())
    updatedAt          DateTime             @updatedAt
    updatedBy          String?       
    listingType        ListingType          @default(SALE)
    status             PropertyStatus       @default(PENDING)
    expiresAt          DateTime?
    approvedAt         DateTime?
    approvedBy         String?
    rejectedAt         DateTime?
    rejectedBy         String?
    deletedAt         DateTime?
    deletedBy         String?
    propertyType       PropertyType
    userId             String
    favoriteProperties FavoriteProperties[]
    features           Features?
    media              Media[]
    user               User                 @relation(fields: [userId], references: [id])
    payments           Payment[]
    comments           Comment[]
}

model Features {
    id              String   @id @default(uuid())
    bedroom         Int?
    livingRoom      Int?
    bathroom        Int?
    kitchen         Int?
    parking         Int?
    area            Float?
    pool            Boolean?
    yearBuilt       Int?
    furnished       Boolean?
    dishwasher      Boolean?
    airConditioning Boolean?
    laundry         Boolean?
    wardrobe        Boolean?
    oven            Boolean?
    propertyId      String   @unique
    property        Property @relation(fields: [propertyId], references: [id])
}

model Media {
    id         String    @id @default(uuid())
    url        String
    type       MediaType
    uploadedBy String
    createdAt  DateTime  @default(now())
    updatedAt  DateTime?  @updatedAt
    propertyId String
    property   Property  @relation(fields: [propertyId], references: [id])
}

model Comment {
    id          String    @id @default(uuid())
    content     String
    isDeleted   Boolean   @default(false)
    createdAt   DateTime  @default(now())
    updatedAt   DateTime  @updatedAt
    deletedAt   DateTime?
    deletedBy   String?
    userId      String
    propertyId  String

    user        User      @relation(fields: [userId], references: [id])
    property    Property  @relation(fields: [propertyId], references: [id])
}


enum MediaType {
    IMAGE
    VIDEO
}

enum PropertyType {
    RESIDENTIAL
    COMMERCIAL
    LAND
}

enum ListingType {
    SALE
    RENT
}

enum PropertyStatus {
    PENDING
    REJECTED
    EXPIRED
    AVAILABLE
    LEASED
    SOLD
}

enum Country {
    SOMALIA
    KENYA
}
`

const aiPropertySearch: RequestHandler = async (req, res) => {
    const inputSchema = z.object({
        query: z.string().min(1),
    })

    const parsed = inputSchema.safeParse(req.body)

    if (!parsed.success) {
        res.status(400).json({
            success: false,
            message: 'Invalid input',
            errors: parsed.error.errors,
        })
        return
    }

    const generateQuery = async (input: string): Promise<string> => {
        try {
            const result = await generateObject({
                model,
                system: prompt,
                prompt: `Generate query for: ${input}`,
                schema: z.object({
                    query: z
                        .string()
                        .regex(/FROM\s+"Property"/i)
                        .regex(/JOIN\s+"Features"/i)
                        .regex(/WHERE\s+.*"isDeleted"\s*=\s*false/i),
                }),
            })

            // Ensure proper quoting
            const sql = result.object.query
                .replace(/FROM\s+Property/g, 'FROM "Property"')
                .replace(/JOIN\s+Features/g, 'JOIN "Features"')
                .replace(/ON\s+\w+\.id\s*=\s*\w+\.propertyId/g, 'ON p.id = f."propertyId"')

            // console.log('Final Query:', sql)
            return sql
        } catch (error) {
            throw new Error('Query generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
        }
    }

    try {
        const sqlQuery = await generateQuery(parsed.data.query)
        const properties = await prisma.$queryRawUnsafe<Property[]>(sqlQuery)

        res.status(200).json({
            success: true,
            data: properties,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Search failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}

export default aiPropertySearch
