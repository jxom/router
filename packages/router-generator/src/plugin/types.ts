import type {
  HandleNodeAccumulator,
  ImportDeclaration,
  RouteNode,
} from '../types'
import type { Generator, TemplateContext } from '../generator'
import type { Config } from '../config'

export interface GeneratorPlugin<TRouteNode extends RouteNode = RouteNode> {
  afterTransform?: (opts: {
    node: RouteNode
    prevNode: RouteNode | undefined
  }) => void
  /**
   * Append additional expressions to a node's route expression.
   * @returns additional code to append.
   */
  appendRouteNodeExpression?: (opts: {
    node: TRouteNode
    acc: HandleNodeAccumulator
    config: Config
  }) => string | void
  /**
   * Get or modify the template context for this node.
   * @returns updated context to customize template variables available during scaffolding.
   */
  getTemplateContext?: (opts: {
    node: TRouteNode
    context: TemplateContext
    config: Config
  }) => TemplateContext
  /**
   * Called once per route-tree generation.
   * @returns imports and/or modified route nodes to customize the generated route tree.
   */
  getRouteTreeNodes?: (opts: {
    routeNodes: Array<TRouteNode>
    acc: HandleNodeAccumulator
    config: Config
  }) => {
    imports?: Array<ImportDeclaration>
    routeNodes?: Array<RouteNode>
  } | void
  init?: (opts: { generator: Generator }) => void
  /**
   * Decide if this file should be handled by this plugin.
   * Called during filesystem discovery.
   * @returns whether the file should be handled by this plugin.
   */
  matches?: (opts: {
    fileName: string
    fullPath: string
    relativePath: string
  }) => boolean
  name: string
  /**
   * A base RouteNode has been created for this physical file.
   * @returns modified route node to add metadata (e.g., mark `_isMdxRoute`).
   */
  onRouteNodeCreated?: (opts: {
    node: TRouteNode
    config: Config
  }) => TRouteNode | void
  /**
   * All RouteNodes from the filesystem are known, but not yet turned into a tree.
   * @returns route nodes
   */
  getRouteNodes?: (opts: {
    rootPathId: string
    routeNodes: Array<TRouteNode>
    config: Config
  }) => Array<TRouteNode> | void
  onRouteTreeChanged?: (opts: {
    routeTree: Array<RouteNode>
    routeNodes: Array<RouteNode>
    rootRouteNode: RouteNode
    acc: HandleNodeAccumulator
  }) => void
  /**
   * Customize how modules for this file type are imported when used
   * as components in the route tree.
   * @returns overrides to the default import path, export name, and keep extension.
   */
  resolveComponentImport?: (opts: {
    config: Config
    defaultExportName: string
    node: TRouteNode
    usage:
      | 'route.component'
      | 'route.errorComponent'
      | 'route.notFoundComponent'
      | 'route.pendingComponent'
      | 'root.component'
      | 'lazy.component'
  }) => {
    importPath?: string
    exportName?: string
    keepExtension?: boolean
  } | void
  /**
   * Decide whether to run the `transform()` step on this node.
   * @returns whether to transform the file.
   */
  shouldTransformFile?: (opts: { node: TRouteNode }) => boolean
}
