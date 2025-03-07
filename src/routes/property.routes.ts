import getFeaturedProperties from '@controllers/api/property/featuredProperties'
import addProperty from '@controllers/api/property/addProperty'
import getPropertyById from '@controllers/api/property/getPropertyById'
import searchProperties from '@controllers/api/property/searchProperties'
import type { RouteGroup } from '@models/routes'
import { authMiddleware } from '@middleware/authMiddleware'
import getPropertiesByUser from '@controllers/api/property/getPropertiesByUser'

const propertyRoutes: RouteGroup = {
    basePath: '/properties',
    routes: [
        {
            path: '/addProperty',
            method: 'post',
            middlewares: [authMiddleware],
            handler: addProperty,
        },
        {
            path: '/searchProperties',
            method: 'get',
            handler: searchProperties,
        },
        {
            path: '/getPropertyById/:id',
            method: 'get',
            handler: getPropertyById,
        },
        {
            path: '/featuredProperties',
            method: 'get',
            handler: getFeaturedProperties,
        },
        {
            path: '/getPropertiesByUser/:userId',
            method: 'get',
            middlewares: [authMiddleware],
            handler: getPropertiesByUser,
        },
    ],
}

export default propertyRoutes
