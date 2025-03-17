import getFeaturedProperties from '@controllers/api/property/featuredProperties'
import addProperty from '@controllers/api/property/addProperty'
import getPropertyById from '@controllers/api/property/getPropertyById'
import searchProperties from '@controllers/api/property/searchProperties'
import type { RouteGroup } from '@models/routes'
import { authMiddleware } from '@middleware/authMiddleware'
import getMyProperties from '@controllers/api/property/getMyProperties'
import toggleFavoriteProperty from '@controllers/api/property/toggleFavoriteProperty'
import getFavoriteProperties from '@controllers/api/property/getFavoriteProperties'

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
            path: '/getFeaturedProperties',
            method: 'get',
            handler: getFeaturedProperties,
        },
        {
            path: '/getMyProperties',
            method: 'get',
            middlewares: [authMiddleware],
            handler: getMyProperties,
        },
        {
            path: '/toggleFavoriteProperty',
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
    ],
}

export default propertyRoutes
