import type {
  DocumentNode,
  ExecutionResult,
  GraphQLError,
  GraphQLSchema,
  OperationDefinitionNode,
} from 'graphql'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { PromiseOrValue } from '@envelop/core'

export interface ExecutionPatchResult<
  TData = { [key: string]: any },
  TExtensions = { [key: string]: any },
  > {
  errors?: ReadonlyArray<GraphQLError>
  data?: TData | null
  path?: ReadonlyArray<string | number>
  label?: string
  hasNext: boolean
  extensions?: TExtensions
}

export interface GraphQLParams<
  TVariables = Record<string, any>,
  TExtensions = Record<string, any>,
  > {
  operationName?: string
  query?: string
  variables?: TVariables
  extensions?: TExtensions
}

export interface FormatPayloadParams<TContext, TRootValue> {
  payload: ExecutionResult | ExecutionPatchResult
  context?: TContext
  document?: DocumentNode
  operation?: OperationDefinitionNode
  rootValue?: TRootValue
}

export interface YogaInitialContext {
  /**
   * A Document containing GraphQL Operations and Fragments to execute.
   */
  query?: string | DocumentNode
  /**
   * An object describing the HTTP request.
   */
  request: Request
  /**
   * The name of the Operation in the Document to execute.
   */
  operationName?: string
  /**
   * Values for any Variables defined by the Operation.
   */
  variables?: string | Record<string, any>
  /**
   * Additional extensions object sent by the client.
   */
  extensions?: Record<string, any>
}

export interface RequestProcessContext<TContext, TRootValue>
  extends YogaInitialContext {
  /**
   * The GraphQL schema used to process the request.
   */
  schema: GraphQLSchema
  /**
   * A function whose return value is passed in as the `context` to `execute`.
   */
  contextFactory: () => Promise<TContext> | TContext
  /**
   * A function which will be used to execute instead of default `execute` from `graphql-js`.
   */
  execute: (...args: any[]) => any
  /**
   * A function which will be used to create a document instead of the default `parse` from `graphql-js`.
   */
  parse: (...args: any[]) => any
  /**
   * A function which will be used to subscribe instead of default `subscribe` from `graphql-js`.
   */
  subscribe: (...args: any[]) => any
  /**
   * A function which will be used to validate instead of default `validate` from `graphql-js`.
   */
  validate: (...args: any[]) => any
  /**
   * The extra headers server will send in the request
   */
  extraHeaders: Record<string, string>
  /**
   * WHATWG compliant Response constructor
   */
  Response: typeof Response
  /**
   * WHATWG compliant ReadableStream constructor
   */
  ReadableStream: typeof ReadableStream
}

export type CORSOptions =
  | {
    origin?: string[] | string
    methods?: string[]
    allowedHeaders?: string[]
    exposedHeaders?: string[]
    credentials?: boolean
    maxAge?: number
  }
  | false

export type GraphQLServerInject<
  TData = any,
  TVariables = Record<string, any>,
  TServerContext extends Record<string, any> = Record<string, any>,
  > = {
    /** GraphQL Operation to execute */
    document: string | TypedDocumentNode<TData, TVariables>
    /** Variables for GraphQL Operation */
    variables?: TVariables
    /** Name for GraphQL Operation */
    operationName?: string
    /** Set any headers for the GraphQL request */
    headers?: HeadersInit
  } & ({} extends TServerContext
    ? { serverContext?: TServerContext }
    : { serverContext: TServerContext })

export { EnvelopError as GraphQLYogaError } from '@envelop/core'

declare global {
  interface ReadableStream<R = any> {
    [Symbol.asyncIterator]: () => AsyncIterator<R>
  }
}

export type FetchEvent = Event & {
  respondWith: (response: PromiseOrValue<Response>) => void
  request: Request
}

export type FetchAPI = {
  /**
   * WHATWG compliant Request object constructor
   * Default: `Request` from `cross-undici-fetch`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Request
   */
  Request?: typeof Request
  /**
   * WHATWG compliant Response object constructor
   * Default: `Response` from `cross-undici-fetch`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Response
   */
  Response?: typeof Response
  /**
   * WHATWG compliant fetch function
   * Default: `fetch` from `cross-undici-fetch`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
   */
  fetch?: typeof fetch
  /**
   * WHATWG compliant ReadableStream object constructor
   * Default: `ReadableStream` from `cross-undici-fetch`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
   */
  ReadableStream?: typeof ReadableStream
}
