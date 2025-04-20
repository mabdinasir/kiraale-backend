import { Router } from 'express'
import authRoutes from './auth.routes'
import type { RouteGroup } from '@models/routes'
import propertyRoutes from './property.routes'
import userRoutes from './user.routes'
import mediaRoutes from './media.routes'
import paymentRoutes from './payment.routes'
import subscriberRoutes from './subscriber.routes'
import contactRoutes from './contact.routes'
import fileUploadsRoutes from './fileUploads.routes'

const registerRouteGroups = (router: Router, groups: RouteGroup[]) => {
    groups.forEach((group) => {
        group.routes.forEach((route) => {
            const fullPath = `/api${group.basePath}${route.path}`
            router[route.method](fullPath, ...(route.middlewares || []), route.handler)
        })
    })
}

const configureRoutes = (router: Router) => {
    const routeGroups = [
        authRoutes,
        propertyRoutes,
        userRoutes,
        mediaRoutes,
        paymentRoutes,
        subscriberRoutes,
        contactRoutes,
        fileUploadsRoutes,
    ]
    registerRouteGroups(router, routeGroups)
}

export default configureRoutes
