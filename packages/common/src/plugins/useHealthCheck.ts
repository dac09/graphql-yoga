import { YogaLogger } from '../logger'
import { FetchAPI } from '../types'
import { Plugin } from './types'

export interface HealthCheckPluginOptions {
  id?: string
  logger?: YogaLogger
  fetch?: FetchAPI['fetch']
}

export function useHealthCheck(options?: HealthCheckPluginOptions): Plugin {
  const id = options?.id || Date.now().toString()
  const logger = options?.logger || console
  const fetch = options?.fetch || globalThis.fetch
  return {
    async onRequest({ request, endResponse }) {
      const requestPath = request.url.split('?')[0]
      if (requestPath.endsWith('/health')) {
        logger.debug(`Responding Health Check`)
        endResponse(`{ "message": "alive" }`, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'x-yoga-id': id,
          },
        })
      } else if (requestPath.endsWith('/readiness')) {
        logger.debug(`Responding Readiness Check`)
        const readinessResponse = await fetch(
          request.url.replace('/readiness', '/health'),
        )
        const { message } = await readinessResponse.json()
        if (
          readinessResponse.status === 200 &&
          readinessResponse.headers.get('x-yoga-id') === id &&
          message === 'alive'
        ) {
          endResponse(`{ "message": "ready" }`, {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          })
        } else {
          throw new Error(
            `Readiness check failed with status ${readinessResponse.status}`,
          )
        }
      }
    },
  }
}
