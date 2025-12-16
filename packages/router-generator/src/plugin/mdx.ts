import path from 'node:path'
import { removeExt, replaceBackslash } from '../utils'
import type { GeneratorPlugin } from './types'
import type { RouteNode as BaseRouteNode, ImportDeclaration } from '../types'

type RouteNode = BaseRouteNode & {
  _isMdxRoute?: boolean | undefined
  _siblingMdxFilePath?: string | undefined
}

export function mdxRouteGen(): GeneratorPlugin<RouteNode> {
  return {
    name: 'mdx',
    extendRouteNodeExpression({ node }) {
      if (!node._isMdxRoute) return
      return `.update({ component: ${node.variableName}RouteComponent })`
    },
    getTemplateContext({ node, context }) {
      if (!node._siblingMdxFilePath) return context
      return {
        ...context,
        routeComponentFileName: path.basename(node._siblingMdxFilePath),
      }
    },
    getRouteTreeNodes({ routeNodes, config }) {
      const mdxNodes = routeNodes.filter((n) => n._isMdxRoute)
      if (mdxNodes.length === 0) return

      let imports: Array<ImportDeclaration> = []

      // Add imports for MDX components
      for (const n of mdxNodes) {
        const importPath = replaceBackslash(
          path.relative(
            path.dirname(config.generatedRouteTree),
            path.resolve(config.routesDirectory, n.filePath),
          ),
        )
        imports.push({
          source: `./${importPath}`,
          specifiers: [
            {
              imported: 'default',
              local: `${n.variableName}RouteComponent`,
            },
          ],
        })
      }

      return {
        imports,
      }
    },
    matches({ fileName }) {
      return fileName.endsWith('.mdx')
    },
    onRouteNodeCreated({ node }) {
      return {
        ...node,
        _isMdxRoute: true,
      }
    },
    onRouteNodesFinalized({ routeNodes: nodes }) {
      const routeNodes = [...nodes]

      const mdxBases = new Set(
        routeNodes
          .filter((n) => n._isMdxRoute)
          .map((n) => removeExt(n.filePath)),
      )

      for (const node of routeNodes) {
        if (!node._isMdxRoute) {
          const base = removeExt(node.filePath)
          if (mdxBases.has(base)) {
            node._siblingMdxFilePath = `${base}.mdx`
          }
        }
      }

      const nonMdxBases = new Set(
        routeNodes
          .filter((n) => !n._isMdxRoute)
          .map((n) => removeExt(n.filePath)),
      )

      for (let i = routeNodes.length - 1; i >= 0; i--) {
        const n = routeNodes[i]!
        if (n._isMdxRoute && nonMdxBases.has(removeExt(n.filePath))) {
          routeNodes.splice(i, 1)
        }
      }

      return routeNodes
    },
    resolveComponentImport({ node, config }) {
      if (!node._isMdxRoute) return

      const importPath = replaceBackslash(
        path.relative(
          path.dirname(config.generatedRouteTree),
          path.resolve(config.routesDirectory, node.filePath),
        ),
      )

      return {
        importPath,
        exportName: 'default',
        keepExtension: true,
      }
    },
    shouldTransformFile({ node }) {
      return !node._isMdxRoute
    },
  }
}
