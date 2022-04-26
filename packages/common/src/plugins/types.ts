import { Plugin as EnvelopPlugin, PromiseOrValue } from '@envelop/core'
import { GraphQLParams } from '../types'

export type Plugin<
  PluginContext extends Record<string, any> = {},
  TServerContext = {},
  > = EnvelopPlugin<PluginContext> & {
    onRequest?: OnRequestHook<TServerContext>
    onRequestParse?: OnRequestParseHook<TServerContext>
  }

export type OnRequestHook<TServerContext> = (
  payload: OnRequestEventPayload<TServerContext>,
) => PromiseOrValue<void | OnRequestHookResult>

export interface OnRequestEventPayload<TServerContext> {
  request: Request
  serverContext: TServerContext | undefined
  endResponse(body: BodyInit | null, init?: ResponseInit): void
}

export interface OnRequestHookResult {
  onRequestDone?: OnRequestDoneHook
}

export type OnRequestDoneHook = (
  payload: OnRequestDoneEventPayload,
) => PromiseOrValue<void>

export interface OnRequestDoneEventPayload {
  response: Response
}

export type OnRequestParseHook<TServerContext> = (
  payload: OnRequestParseEventPayload<TServerContext>,
) => PromiseOrValue<void | OnRequestParseHookResult>

export type RequestParser = (request: Request) => PromiseOrValue<GraphQLParams>

export interface OnRequestParseEventPayload<TServerContext> {
  serverContext: TServerContext | undefined
  request: Request
  requestParser: RequestParser
  setRequestParser: (parser: RequestParser) => void
}

export type OnRequestParseHookResult = {
  onRequestParseDone?: OnRequestParseDoneHook
}

export type OnRequestParseDoneHook = (
  payload: OnRequestParseDoneEventPayload,
) => PromiseOrValue<void>

export interface OnRequestParseDoneEventPayload {
  params: GraphQLParams
  setParams: (params: GraphQLParams) => void
}
