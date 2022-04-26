import { PromiseOrValue } from '@envelop/core'
import {
  GraphiQLOptions,
  renderGraphiQL as defaultGraphiQLRenderer,
  shouldRenderGraphiQL,
} from '../graphiql'
import { YogaLogger } from '../logger'
import { Plugin } from './types'

export type GraphiQLOptionsFactory<TServerContext> = (
  request: Request,
  ...args: {} extends TServerContext
    ? [serverContext?: TServerContext | undefined]
    : [serverContext: TServerContext]
) => PromiseOrValue<GraphiQLOptions | boolean>

export type GraphiQLOptionsOrFactory<TServerContext> =
  | GraphiQLOptions
  | GraphiQLOptionsFactory<TServerContext>
  | boolean

export interface GraphiQLPluginConfig<TServerContext> {
  endpoint?: string
  options?: GraphiQLOptionsOrFactory<TServerContext>
  render?(options?: GraphiQLOptions): PromiseOrValue<BodyInit>
  logger?: YogaLogger
}

export function useGraphiQL<TServerContext>(
  config?: GraphiQLPluginConfig<TServerContext>,
): Plugin {
  const logger = config?.logger ?? console
  let graphiqlOptionsFactory: GraphiQLOptionsFactory<TServerContext>
  if (typeof config?.options === 'function') {
    graphiqlOptionsFactory = config?.options
  } else if (typeof config?.options === 'object') {
    graphiqlOptionsFactory = () => config?.options as GraphiQLOptions
  } else if (config?.options === false) {
    graphiqlOptionsFactory = () => false
  } else {
    graphiqlOptionsFactory = () => ({})
  }

  const renderer = config?.render ?? defaultGraphiQLRenderer

  return {
    async onRequest({ request, serverContext, endResponse }) {
      const requestPath = request.url.split('?')[0]
      if (config?.endpoint != null && !requestPath.endsWith(config?.endpoint)) {
        logger.debug(`Responding 404 Not Found`)
        endResponse(`Unable to ${request.method} ${requestPath}`, {
          status: 404,
          statusText: `Not Found`,
        })
      } else if (shouldRenderGraphiQL(request)) {
        logger.debug(`Rendering GraphiQL`)
        let graphiqlOptions = graphiqlOptionsFactory(
          request,
          serverContext as TServerContext,
        )

        if (graphiqlOptions) {
          const graphiQLBody = await renderer({
            endpoint: config?.endpoint,
            ...(graphiqlOptions === true ? {} : graphiqlOptions),
          })

          endResponse(graphiQLBody, {
            headers: {
              'Content-Type': 'text/html',
            },
            status: 200,
          })
        }
      }
    },
  }
}
