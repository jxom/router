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
   * Per-node route-tree customization. Handlers can append chained calls
   * or additional expressions to a node's route expression.
   *
   * Return additional code to append, or `undefined` to keep the default.
   */
  extendRouteNodeExpression?: (opts: {
    node: TRouteNode
    acc: HandleNodeAccumulator
    config: Config
  }) => string | void
  /**
   * Get or modify the template context for this node.
   * Return an updated context to customize template variables available during scaffolding.
   */
  getTemplateContext?: (opts: {
    node: TRouteNode
    context: TemplateContext
    config: Config
  }) => TemplateContext
  /**
   * Called once per route-tree generation.
   * Return imports and/or modified route nodes to customize the generated route tree.
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
   * Decide if this file should be handled by this handler.
   * Called during filesystem discovery.
   */
  matches: (opts: {
    fileName: string
    fullPath: string
    relativePath: string
  }) => boolean
  name: string
  /**
   * A base RouteNode has been created for this physical file.
   * Mutate the node to add metadata (e.g., mark `_isMdxRoute`) or return a modified node.
   */
  onRouteNodeCreated?: (opts: {
    node: TRouteNode
    config: Config
  }) => TRouteNode | void
  /**
   * All RouteNodes from the filesystem are known, but not yet turned into a tree.
   * Mutate `routeNodes` in-place (add/remove/annotate) or return a modified array
   * to apply cross-file adjustments (e.g., MDX/TSX sibling precedence rules).
   */
  onRouteNodesFinalized?: (opts: {
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
   *
   * Return overrides; omit to keep defaults.
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
   * Return false to skip transformation.
   */
  shouldTransformFile?: (opts: { node: TRouteNode }) => boolean
}
