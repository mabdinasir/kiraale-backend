import getFeaturedProperties from '@controllers/api/property/getFeaturedProperties'
import addProperty from '@controllers/api/property/addProperty'
import getPropertyById from '@controllers/api/property/getPropertyById'
import searchProperties from '@controllers/api/property/searchProperties'
import type { RouteGroup } from '@models/routes'
import { authMiddleware } from '@middleware/authMiddleware'
import toggleFavoriteProperty from '@controllers/api/property/toggleFavoriteProperty'
import getFavoriteProperties from '@controllers/api/property/getFavoriteProperties'
import getPropertiesByUser from '@controllers/api/property/getPropertiesByUser'
import { tokenExtractionMiddleware } from '@middleware/tokenExtractionMiddleware'
import updateProperty from '@controllers/api/property/updateProperty'

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
            middlewares: [tokenExtractionMiddleware],
            handler: searchProperties,
        },
        {
            path: '/getPropertyById/:id',
            method: 'get',
            middlewares: [tokenExtractionMiddleware],
            handler: getPropertyById,
        },
        {
            path: '/getFeaturedProperties',
            method: 'get',
            middlewares: [tokenExtractionMiddleware],
            handler: getFeaturedProperties,
        },
        {
            path: '/getPropertiesByUser',
            method: 'get',
            middlewares: [authMiddleware],
            handler: getPropertiesByUser,
        },
        {
            path: '/toggleFavoriteProperty/:propertyId',
            method: 'post',
            middlewares: [authMiddleware],
            handler: toggleFavoriteProperty,
        },

        {
            path: '/getFavoriteProperties',
            method: 'get',
            middlewares: [authMiddleware],
            handler: getFavoriteProperties,
        },
        {
            path: '/updateProperty/:id',
            method: 'put',
            middlewares: [authMiddleware],
            handler: updateProperty,
        },
    ],
}

export default propertyRoutes
