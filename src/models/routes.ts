import type { RequestHandler } from 'express'

export type RouteConfig = {
    path: string
    method: 'get' | 'post' | 'put' | 'patch' | 'delete'
    middlewares?: RequestHandler[]
    handler: RequestHandler
}

export type RouteGroup = {
    basePath: string
    routes: RouteConfig[]
}
