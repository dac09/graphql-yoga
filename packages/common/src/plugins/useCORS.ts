import { CORSOptions } from '../types'
import { Plugin } from './types'

export type CORSPluginOptions<TServerContext> =
  | ((
      request: Request,
      ...args: {} extends TServerContext
        ? [serverContext?: TServerContext | undefined]
        : [serverContext: TServerContext]
    ) => CORSOptions)
  | CORSOptions
  | boolean

export type CORSOptionsFactory<TServerContext> = (
  request: Request,
  serverContext: TServerContext,
) => CORSOptions

function getCORSResponseHeaders<TServerContext>(
  request: Request,
  serverContext: TServerContext,
  corsOptionsFactory: CORSOptionsFactory<TServerContext>,
) {
  const corsOptions = corsOptionsFactory(request, serverContext)

  const headers: Record<string, string> = {}

  const currentOrigin = request.headers.get('origin')

  headers['Access-Control-Allow-Origin'] = '*'

  if (currentOrigin) {
    const credentialsAsked = request.headers.get('cookies')
    if (credentialsAsked) {
      headers['Access-Control-Allow-Origin'] = currentOrigin
    }
  }

  if (
    currentOrigin != null &&
    corsOptions.origin?.length &&
    !corsOptions.origin.includes(currentOrigin) &&
    !corsOptions.origin.includes('*')
  ) {
    headers['Access-Control-Allow-Origin'] = 'null'
  }

  if (headers['Access-Control-Allow-Origin'] !== '*') {
    headers['Vary'] = 'Origin'
  }

  if (corsOptions.methods?.length) {
    headers['Access-Control-Allow-Methods'] = corsOptions.methods.join(', ')
  } else {
    const requestMethod = request.headers.get('access-control-request-method')
    if (requestMethod) {
      headers['Access-Control-Allow-Methods'] = requestMethod
    }
  }

  if (corsOptions.allowedHeaders?.length) {
    headers['Access-Control-Allow-Headers'] =
      corsOptions.allowedHeaders.join(', ')
  } else {
    const requestHeaders = request.headers.get('access-control-request-headers')
    if (requestHeaders) {
      headers['Access-Control-Allow-Headers'] = requestHeaders
      if (headers['Vary']) {
        headers['Vary'] += ', Access-Control-Request-Headers'
      }
      headers['Vary'] = 'Access-Control-Request-Headers'
    }
  }

  if (corsOptions.credentials != null) {
    if (corsOptions.credentials === true) {
      headers['Access-Control-Allow-Credentials'] = 'true'
    }
  } else if (headers['Access-Control-Allow-Origin'] !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true'
  }

  if (corsOptions.exposedHeaders) {
    headers['Access-Control-Expose-Headers'] =
      corsOptions.exposedHeaders.join(', ')
  }

  if (corsOptions.maxAge) {
    headers['Access-Control-Max-Age'] = corsOptions.maxAge.toString()
  }

  headers['Server'] = 'GraphQL Yoga'

  return headers
}

export function useCORS<TServerContext>(
  options?: CORSPluginOptions<TServerContext>,
): Plugin {
  let corsOptionsFactory: CORSOptionsFactory<TServerContext> = () => ({})
  if (options != null) {
    if (typeof options === 'function') {
      corsOptionsFactory = options
    } else if (typeof options === 'object') {
      const corsOptions = {
        ...options,
      }
      corsOptionsFactory = () => corsOptions
    }
  }
  return {
    onRequest({ request, serverContext, endResponse }) {
      if (request.method.toUpperCase() === 'OPTIONS') {
        const headers = getCORSResponseHeaders<any>(
          request,
          serverContext,
          corsOptionsFactory,
        )
        endResponse(null, {
          status: 204,
          headers,
        })
        return
      } else {
        return {
          onRequestDone({ response }) {
            const headers = getCORSResponseHeaders<any>(
              request,
              serverContext,
              corsOptionsFactory,
            )
            for (const headerName in headers) {
              response.headers.set(headerName, headers[headerName])
            }
          },
        }
      }
    },
  }
}
